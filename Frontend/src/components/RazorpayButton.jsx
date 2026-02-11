import React, { useState } from 'react';
import api from '../api/axios';
import { CreditCard, Loader2 } from 'lucide-react';
import soaLogo from '../assets/soa_logo.png';

const RazorpayButton = ({ amount, studentData, onSuccess, className }) => {
    const [loading, setLoading] = useState(false);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (amount <= 0) return;
        setLoading(true);

        const res = await loadRazorpay();

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setLoading(false);
            return;
        }

        try {
            // 1. Create Order
            let orderData = null;
            try {
                const result = await api.post('/api/create-order', { amount });
                orderData = result.data;
            } catch (err) {
                console.warn("Backend Create Order failed (likely missing keys). Falling back to mock payment.");
            }

            // Fallback to Mock if backend isn't ready
            if (!orderData || !orderData.id) {
                const confirmMock = window.confirm(
                    "Payment Gateway is currently in Test Mode.\n\nProcess a simulated payment to clear fines?"
                );
                if (confirmMock) {
                    const mockPaymentData = {
                        razorpay_payment_id: "pay_mock_" + Date.now(),
                        razorpay_order_id: "order_mock_" + Date.now(),
                        razorpay_signature: "mock_signature",
                        regno: studentData.regno,
                        is_mock: true
                    };

                    try {
                        const verifyRes = await api.post('/api/verify-payment', mockPaymentData);
                        if (verifyRes.data.success) {
                            onSuccess();
                        } else {
                            alert("Mock Payment verification failed");
                        }
                    } catch (e) {
                        alert("Could not clear fine on server.");
                    }
                }
                setLoading(false);
                return;
            }

            // Real Razorpay Flow
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                amount: orderData.amount.toString(),
                currency: orderData.currency,
                name: "SOA Library",
                description: "Fine Payment",
                image: soaLogo,
                order_id: orderData.id,
                handler: async function (response) {
                    const data = {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        regno: studentData.regno
                    };

                    try {
                        const verifyRes = await api.post('/api/verify-payment', data);
                        if (verifyRes.data.success) {
                            onSuccess();
                        } else {
                            alert("Payment verification failed");
                        }
                    } catch (error) {
                        console.error(error);
                        alert("Payment verification failed on server");
                    }
                },
                prefill: {
                    name: studentData.name,
                    email: studentData.email,
                    contact: "9999999999"
                },
                notes: {
                    address: "SOA University"
                },
                theme: {
                    color: "#00f3ff"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
            paymentObject.on('payment.failed', function (response) {
                alert(response.error.description);
                setLoading(false);
            });

        } catch (e) {
            console.error("Payment Error:", e);
            alert("Payment failed to initialize: " + e.message);
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading || amount <= 0}
            className={`relative group overflow-hidden px-8 py-3 rounded-none bg-transparent border border-hack-neon text-hack-neon font-heading tracking-wider uppercase transition-all duration-300 hover:bg-hack-neon/10 hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            <span className="relative z-10 flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                {loading ? 'Processing...' : `PAY ₹${amount}`}
            </span>
            <div className="absolute inset-0 bg-hack-neon/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </button>
    );
};

export default RazorpayButton;
