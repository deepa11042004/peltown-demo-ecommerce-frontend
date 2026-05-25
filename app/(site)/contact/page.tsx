"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import Image from "next/image";

const ContactPage = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <main className="pt-24 min-h-screen bg-[#fdfbf9]">
      {/* Top Banner */}
      <section className="relative w-full overflow-hidden h-[300px] md:h-[400px] flex items-center justify-center">
        <Image
          src="/Img/mockup.webp"
          alt="Contact Everace"
          fill
          className="object-cover z-0"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/60 to-black/80 z-10" />
        
        <div className="relative z-20 text-center text-white px-6 max-w-3xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-[#facc15] mb-4 block"
          >
            We Are Here For You
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-7xl font-black uppercase tracking-tighter"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-lg text-gray-200 font-medium mt-4 max-w-xl mx-auto"
          >
            Have questions about our products or your order? Reach out to our dedicated support team.
          </motion.p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-20 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Contact Details Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex items-start gap-6 hover:shadow-xl hover:border-yellow-100 transition-all">
              <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-[#facc15] shrink-0 shadow-inner">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase">Call Us Directly</h3>
                <p className="text-gray-500 text-sm mt-1">Available Mon - Sat, 9:00 AM to 7:00 PM IST</p>
                <p className="text-xl font-bold text-gray-900 mt-2">+91 1111111111</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex items-start gap-6 hover:shadow-xl hover:border-yellow-100 transition-all">
              <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-[#facc15] shrink-0 shadow-inner">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase">Email Support</h3>
                <p className="text-gray-500 text-sm mt-1">We respond within 24 business hours</p>
                <p className="text-lg font-bold text-gray-900 mt-2">support@everacee.com</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex items-start gap-6 hover:shadow-xl hover:border-yellow-100 transition-all">
              <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-[#facc15] shrink-0 shadow-inner">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase">Our Orchards & HQ</h3>
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                  Pampore Orchards, Srinagar, Kashmir, Jammu and Kashmir - 190001
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex items-start gap-6 hover:shadow-xl hover:border-yellow-100 transition-all">
              <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-[#facc15] shrink-0 shadow-inner">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase">Working Hours</h3>
                <p className="text-gray-500 text-sm mt-1">Monday – Saturday: 9:00 AM – 7:00 PM</p>
                <p className="text-gray-500 text-sm">Sunday: Closed</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 bg-white p-10 sm:p-12 rounded-[36px] shadow-xl border border-gray-100 relative"
          >
            {formSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-16 px-4"
              >
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-md">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-black text-gray-900 uppercase mb-3">Message Sent Successfully!</h3>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                  Thank you for getting in touch with us, {formData.name}. Our team has received your message and will get back to your email ({formData.email}) shortly.
                </p>
                <button
                  onClick={() => {
                    setFormSubmitted(false);
                    setFormData({ name: "", email: "", subject: "", message: "" });
                  }}
                  className="mt-8 px-8 py-4 bg-black text-[#facc15] font-black text-xs uppercase tracking-widest rounded-full hover:bg-[#facc15] hover:text-black transition-all cursor-pointer"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">Send Us A Message</h2>
                  <p className="text-gray-500 text-sm font-medium">Fill out the form below and we will contact you as soon as possible.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full px-5 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-yellow-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full px-5 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-yellow-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Order inquiry, bulk gifting, etc."
                    className="w-full px-5 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-yellow-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-2">Your Message</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    className="w-full px-5 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-yellow-500 focus:bg-white transition-all font-medium resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-[#facc15] hover:bg-black text-black hover:text-[#facc15] font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Send size={18} />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </section>
    </main>
  );
};

export default ContactPage;
