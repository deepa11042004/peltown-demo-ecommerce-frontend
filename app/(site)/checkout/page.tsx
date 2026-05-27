"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  CreditCard,
  ShoppingBag,
  ArrowLeft,
  Plus,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { addressApi, checkoutApi, paymentApi } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { loadRazorpayCheckout } from "../../../lib/razorpay";

type Address = {
  id: number;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  landmark?: string | null;
  type?: "shipping" | "billing" | "both";
};

type AddressFormState = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  landmark: string;
  type: "shipping" | "billing" | "both";
};

const buildAddressLabel = (address: Address) => {
  if (address.type === "billing") {
    return "Billing";
  }

  if (address.type === "both") {
    return "Shipping + Billing";
  }

  return "Shipping";
};

const formatAddressLine = (address: Address) => {
  const parts = [
    address.addressLine1,
    address.addressLine2,
    `${address.city}, ${address.state}`,
    `${address.country} ${address.postalCode}`,
  ].filter((entry) => entry && entry.trim());

  return parts.join(", ");
};

const formatMoney = (value: number) => {
  return `₹${value.toFixed(2)}`;
};

const CheckoutPage = () => {
  const router = useRouter();
  const { cart, cartTotal, itemCount, clearCart, refreshCart, loading } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState("");
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [selectedBillingId, setSelectedBillingId] = useState<number | null>(null);
  const [useShippingForBilling, setUseShippingForBilling] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isCreatingAddress, setIsCreatingAddress] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [notes, setNotes] = useState("");
  const [addressForm, setAddressForm] = useState<AddressFormState>({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    landmark: "",
    type: "both",
  });

  useEffect(() => {
    if (user?.firstName || user?.lastName) {
      setAddressForm((prev) => ({
        ...prev,
        fullName: prev.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      }));
    }
  }, [user]);

  const loadAddresses = async () => {
    setAddressLoading(true);
    setAddressError("");

    try {
      const response = await addressApi.list();
      const payload = response.data?.data;
      const items = Array.isArray(payload) ? payload : [];
      setAddresses(items as Address[]);

      if (items.length > 0) {
        const firstId = Number(items[0].id);
        setSelectedShippingId(firstId);
        setSelectedBillingId(firstId);
      }
    } catch (error: any) {
      setAddressError(error.response?.data?.message || error.message || "Unable to load addresses");
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void loadAddresses();
    }
  }, [authLoading, isAuthenticated]);

  const selectedShipping = useMemo(
    () => addresses.find((address) => address.id === selectedShippingId) || null,
    [addresses, selectedShippingId],
  );

  const selectedBilling = useMemo(
    () => addresses.find((address) => address.id === selectedBillingId) || null,
    [addresses, selectedBillingId],
  );

  const effectiveBillingId = useShippingForBilling
    ? selectedShippingId
    : selectedBillingId;

  const handleCreateAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreatingAddress(true);

    try {
      const response = await addressApi.create({
        fullName: addressForm.fullName.trim(),
        phone: addressForm.phone.trim(),
        addressLine1: addressForm.addressLine1.trim(),
        addressLine2: addressForm.addressLine2.trim() || null,
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        country: addressForm.country.trim(),
        postalCode: addressForm.postalCode.trim(),
        landmark: addressForm.landmark.trim() || null,
        type: addressForm.type,
      });

      const newAddress = response.data?.data as Address | undefined;
      if (newAddress?.id) {
        setAddresses((prev) => [newAddress, ...prev]);
        setSelectedShippingId(Number(newAddress.id));
        setSelectedBillingId(Number(newAddress.id));
      }

      setIsAddingAddress(false);
      setAddressForm((prev) => ({
        ...prev,
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        landmark: "",
      }));
      toast.success("Address saved successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Unable to save address");
    } finally {
      setIsCreatingAddress(false);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!selectedShippingId || !effectiveBillingId) {
      toast.error("Please select shipping and billing addresses");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const response = await checkoutApi.create({
        shippingAddressId: selectedShippingId,
        billingAddressId: effectiveBillingId,
        paymentMethod: "razorpay",
        notes: notes.trim() || null,
      });

      const payload = response.data?.data;

      await loadRazorpayCheckout({
        payload,
        customer: {
          name: selectedShipping?.fullName || user?.firstName,
          email: user?.email,
          contact: selectedShipping?.phone,
        },
        onSuccess: async (payment) => {
          await paymentApi.verify({
            orderId: payload.orderId,
            razorpay_order_id: payment.razorpay_order_id,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature: payment.razorpay_signature,
          });

          await clearCart();
          await refreshCart();
          toast.success("Payment confirmed. Order placed!");
          router.push(`/order/${payload.orderId}`);
        },
        onFailure: (message) => {
          toast.error(message || "Payment not completed");
        },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Unable to start checkout");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#fdfbf9] pt-36 pb-24 px-6 flex items-center justify-center">
        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading checkout...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fdfbf9] pt-36 pb-24 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-4xl p-10 text-center shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#facc15]">
            <ShoppingBag size={36} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Login required</h2>
          <p className="text-gray-500 font-medium mb-8">
            Please sign in to complete your purchase.
          </p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full bg-[#facc15] text-black py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-lg"
            >
              Login to Checkout
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-700 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:border-black hover:text-black transition-all shadow-sm"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#fdfbf9] pt-36 pb-24 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-4xl p-10 text-center shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#facc15]">
            <ShoppingBag size={36} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Checkout is empty</h2>
          <p className="text-gray-500 font-medium mb-8">
            Add premium products to your cart before checking out.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#facc15] text-black py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-lg"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf9] pt-32 pb-24 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight uppercase">
              Checkout
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              {itemCount} items ready for secure payment
            </p>
          </div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 font-bold text-sm text-gray-600 hover:text-black transition-colors bg-white border border-gray-200 px-5 py-2.5 rounded-full shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Cart
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-4xl border border-gray-100 shadow-xl p-8 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 flex items-center gap-2">
                  <MapPin size={18} className="text-[#facc15]" /> Shipping Address
                </h2>
                <button
                  type="button"
                  onClick={() => setIsAddingAddress((prev) => !prev)}
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-yellow-700 hover:text-black transition-colors"
                >
                  <Plus size={14} /> Add Address
                </button>
              </div>

              {addressLoading ? (
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading addresses...</div>
              ) : addressError ? (
                <div className="text-sm font-bold text-red-500">{addressError}</div>
              ) : addresses.length === 0 ? (
                <div className="text-sm font-bold text-gray-500">No saved addresses yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => {
                    const isSelected = address.id === selectedShippingId;
                    return (
                      <button
                        type="button"
                        key={address.id}
                        onClick={() => {
                          setSelectedShippingId(address.id);
                          if (useShippingForBilling) {
                            setSelectedBillingId(address.id);
                          }
                        }}
                        className={`text-left p-5 rounded-3xl border transition-all shadow-sm ${
                          isSelected
                            ? "border-yellow-400 bg-yellow-50/50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            {buildAddressLabel(address)}
                          </span>
                          {isSelected && <CheckCircle2 size={16} className="text-yellow-600" />}
                        </div>
                        <p className="font-black text-gray-900 mt-2">{address.fullName}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatAddressLine(address)}</p>
                        <p className="text-xs text-gray-400 mt-2">Phone: {address.phone}</p>
                      </button>
                    );
                  })}
                </div>
              )}

              {isAddingAddress && (
                <form onSubmit={handleCreateAddress} className="bg-gray-50 border border-gray-200 rounded-3xl p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-600 mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        value={addressForm.fullName}
                        onChange={(event) =>
                          setAddressForm((prev) => ({ ...prev, fullName: event.target.value }))
                        }
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-600 mb-2">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={addressForm.phone}
                        onChange={(event) =>
                          setAddressForm((prev) => ({ ...prev, phone: event.target.value }))
                        }
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-600 mb-2">Address Line 1</label>
                    <input
                      type="text"
                      required
                      value={addressForm.addressLine1}
                      onChange={(event) =>
                        setAddressForm((prev) => ({ ...prev, addressLine1: event.target.value }))
                      }
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-600 mb-2">Address Line 2</label>
                    <input
                      type="text"
                      value={addressForm.addressLine2}
                      onChange={(event) =>
                        setAddressForm((prev) => ({ ...prev, addressLine2: event.target.value }))
                      }
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-600 mb-2">City</label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(event) =>
                          setAddressForm((prev) => ({ ...prev, city: event.target.value }))
                        }
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-600 mb-2">State</label>
                      <input
                        type="text"
                        required
                        value={addressForm.state}
                        onChange={(event) =>
                          setAddressForm((prev) => ({ ...prev, state: event.target.value }))
                        }
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-600 mb-2">Country</label>
                      <input
                        type="text"
                        required
                        value={addressForm.country}
                        onChange={(event) =>
                          setAddressForm((prev) => ({ ...prev, country: event.target.value }))
                        }
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-600 mb-2">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={addressForm.postalCode}
                        onChange={(event) =>
                          setAddressForm((prev) => ({ ...prev, postalCode: event.target.value }))
                        }
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-600 mb-2">Landmark</label>
                      <input
                        type="text"
                        value={addressForm.landmark}
                        onChange={(event) =>
                          setAddressForm((prev) => ({ ...prev, landmark: event.target.value }))
                        }
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-600 mb-2">Address Type</label>
                      <select
                        value={addressForm.type}
                        onChange={(event) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            type: event.target.value as AddressFormState["type"],
                          }))
                        }
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold"
                      >
                        <option value="shipping">Shipping</option>
                        <option value="billing">Billing</option>
                        <option value="both">Shipping + Billing</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="px-6 py-3 border border-gray-200 rounded-full font-black text-xs uppercase tracking-wider text-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingAddress}
                      className="px-8 py-3 bg-[#facc15] text-black rounded-full font-black text-xs uppercase tracking-widest shadow-md hover:bg-black hover:text-white transition-all disabled:opacity-60"
                    >
                      {isCreatingAddress ? "Saving..." : "Save Address"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-4xl border border-gray-100 shadow-xl p-8 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 flex items-center gap-2">
                  <MapPin size={18} className="text-[#facc15]" /> Billing Address
                </h2>
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-500">
                  <input
                    type="checkbox"
                    checked={useShippingForBilling}
                    onChange={(event) => {
                      setUseShippingForBilling(event.target.checked);
                      if (event.target.checked && selectedShippingId) {
                        setSelectedBillingId(selectedShippingId);
                      }
                    }}
                    className="accent-black"
                  />
                  Use shipping address
                </label>
              </div>

              {useShippingForBilling ? (
                selectedShipping ? (
                  <div className="p-5 rounded-3xl border border-gray-200 bg-gray-50">
                    <p className="font-black text-gray-900">{selectedShipping.fullName}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatAddressLine(selectedShipping)}</p>
                    <p className="text-xs text-gray-400 mt-2">Phone: {selectedShipping.phone}</p>
                  </div>
                ) : (
                  <div className="text-sm font-bold text-gray-500">Select a shipping address first.</div>
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => {
                    const isSelected = address.id === selectedBillingId;
                    return (
                      <button
                        type="button"
                        key={`billing-${address.id}`}
                        onClick={() => setSelectedBillingId(address.id)}
                        className={`text-left p-5 rounded-3xl border transition-all shadow-sm ${
                          isSelected
                            ? "border-yellow-400 bg-yellow-50/50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            {buildAddressLabel(address)}
                          </span>
                          {isSelected && <CheckCircle2 size={16} className="text-yellow-600" />}
                        </div>
                        <p className="font-black text-gray-900 mt-2">{address.fullName}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatAddressLine(address)}</p>
                        <p className="text-xs text-gray-400 mt-2">Phone: {address.phone}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-4xl border border-gray-100 shadow-xl p-8 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 flex items-center gap-2">
                  <CreditCard size={18} className="text-[#facc15]" /> Payment Method
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Secure</span>
              </div>

              <div className="p-6 rounded-3xl border border-yellow-100 bg-yellow-50/60 space-y-2">
                <p className="font-black text-gray-900 uppercase tracking-tight">Razorpay</p>
                <p className="text-xs font-semibold text-gray-600">
                  Pay securely using UPI, cards, or net banking through Razorpay.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-600 mb-2">Order Notes (optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-900 resize-none"
                  placeholder="Delivery instructions, gift notes, etc."
                />
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-4xl border border-yellow-100 shadow-xl p-8 space-y-6 sticky top-32">
              <h2 className="text-2xl font-black text-gray-900 uppercase border-b border-gray-100 pb-4">
                Order Summary
              </h2>

              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-snug">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 font-bold">Qty {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-gray-900">
                      {formatMoney(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm text-gray-600 font-medium border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-bold text-gray-900">{formatMoney(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span className="font-bold text-gray-900">₹0.00</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-lg font-black text-gray-900">
                  <span>Grand Total</span>
                  <span className="text-2xl text-[#facc15]">{formatMoney(cartTotal)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isPlacingOrder || addressLoading}
                className="w-full bg-[#facc15] text-black py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all shadow-2xl disabled:opacity-60"
              >
                {isPlacingOrder ? "Starting secure payment..." : "Place Order & Pay"}
              </button>

              <p className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Secure checkout powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
