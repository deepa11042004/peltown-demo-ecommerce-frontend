export type RazorpayCheckoutPayload = {
  orderId: number;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
};

type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCustomer = {
  name?: string;
  email?: string;
  contact?: string;
};

type LoadCheckoutOptions = {
  payload: RazorpayCheckoutPayload;
  customer?: RazorpayCustomer;
  onSuccess: (response: RazorpayPaymentResponse) => Promise<void> | void;
  onFailure?: (message?: string) => void;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response: any) => void) => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: RazorpayCustomer;
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const loadRazorpayScript = () => {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const loadRazorpayCheckout = async ({
  payload,
  customer,
  onSuccess,
  onFailure,
}: LoadCheckoutOptions) => {
  if (!payload?.razorpayOrderId || !payload?.key) {
    throw new Error("Missing payment payload");
  }

  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded || !window.Razorpay) {
    throw new Error("Unable to load Razorpay SDK");
  }

  const options: RazorpayOptions = {
    key: payload.key,
    amount: payload.amount,
    currency: payload.currency,
    order_id: payload.razorpayOrderId,
    name: "Peltown",
    description: `Order ${payload.orderNumber}`,
    handler: (response) => {
      void onSuccess(response);
    },
    prefill: customer,
    notes: {
      orderId: String(payload.orderId),
    },
    theme: {
      color: "#facc15",
    },
    modal: {
      ondismiss: () => {
        if (onFailure) {
          onFailure("Payment cancelled");
        }
      },
    },
  };

  const instance = new window.Razorpay(options);
  instance.on("payment.failed", (response) => {
    if (onFailure) {
      onFailure(response?.error?.description || "Payment failed");
    }
  });
  instance.open();
};
