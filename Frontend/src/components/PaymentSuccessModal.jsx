import React, { useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Download } from 'lucide-react';
import gsap from 'gsap';

const PaymentSuccessModal = ({ isOpen, onClose, details }) => {
    const modalRef = useRef(null);
    const overlayRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const tl = gsap.timeline();
            tl.to(overlayRef.current, { opacity: 1, duration: 0.4 })
                .to(modalRef.current, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }, "-=0.2")
                .from(contentRef.current.children, { y: 20, opacity: 0, stagger: 0.1, duration: 0.4 }, "-=0.3");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md opacity-0"
        >
            <div
                ref={modalRef}
                className="w-full max-w-md bg-slate-900/90 border border-hack-neon/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.2)] opacity-0 scale-90"
            >
                <div ref={contentRef} className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-hack-neon/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                            <CheckCircle2 className="w-20 h-20 text-hack-neon relative z-10" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-heading font-bold text-white tracking-tighter">
                            SETTLEMENT <span className="text-hack-neon">COMPLETE</span>
                        </h2>
                        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Transaction Verified</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 font-mono text-sm">
                        <div className="flex justify-between items-center text-slate-400">
                            <span>Order ID</span>
                            <span className="text-white">{details?.payment?.order_id ? details.payment.order_id : (details?.orderId ? details.orderId.substring(0, 15) + '...' : '—')}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                            <span>Payment ID</span>
                            <span className="text-white">{details?.payment?.payment_id || details?.payment?.paymentId || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                            <span>Amount Paid</span>
                            <span className="text-hack-neon font-bold">₹{details?.amount || details?.payment?.totalPaid || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 pt-3 border-t border-white/5">
                            <span>Verified At</span>
                            <span className="text-white">{details?.payment?.verified_at ? new Date(details.payment.verified_at).toLocaleString() : '—'}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 pt-3 border-t border-white/5">
                            <span>Status</span>
                            <span className="text-green-400 flex items-center gap-1">
                                SECURE <CheckCircle2 className="w-3 h-3" />
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onClose}
                            className="w-full bg-hack-neon text-black font-heading font-bold py-3 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 group"
                        >
                            RETURN TO DASHBOARD <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessModal;
