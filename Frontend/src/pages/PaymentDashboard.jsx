import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import RazorpayButton from '../components/RazorpayButton';
import { useScrollAnimations } from '../hooks/useScrollAnimations';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CreditCard, AlertTriangle, CheckCircle, Clock, History } from 'lucide-react';

const PaymentDashboard = () => {
    useScrollAnimations();
    const { user } = useAuth();
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [totalFine, setTotalFine] = useState(0);

    const containerRef = useRef(null);
    const heroRef = useRef(null);
    const statsRef = useRef(null);
    const historyRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user?.regno) {
                    const profileRes = await api.get(`/api/student/${user.regno}`);
                    setStudentData(profileRes.data.user);
                    setTotalFine(profileRes.data.totalFine);
                }
            } catch (err) {
                console.error("Failed to fetch payment data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        if (!loading && studentData) {
            const ctx = gsap.context(() => {
                // Hero Text Reveal
                gsap.from(".hero-text-char", {
                    y: 100,
                    opacity: 0,
                    duration: 1,
                    stagger: 0.05,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: heroRef.current,
                        start: "top center",
                    }
                });

                // Stats Cards Floating Parallax
                gsap.to(".stat-card", {
                    y: -50,
                    stagger: 0.1,
                    scrollTrigger: {
                        trigger: statsRef.current,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1.5
                    }
                });

                // History List Review
                gsap.from(".history-item", {
                    x: -50,
                    opacity: 0,
                    stagger: 0.1,
                    duration: 0.8,
                    scrollTrigger: {
                        trigger: historyRef.current,
                        start: "top 80%",
                    }
                });

            }, containerRef);
            return () => ctx.revert();
        }
    }, [loading, studentData]);

    if (loading) return <div className="min-h-screen bg-hack-black text-white flex items-center justify-center">Loading Portal...</div>;

    const fines = studentData?.booksIssued?.filter(b => b.fine > 0) || [];
    const paidHistory = studentData?.booksIssued?.filter(b => b.finePaid) || [];

    return (
        <div ref={containerRef} className="bg-hack-black min-h-screen w-full text-white font-sans selection:bg-hack-neon selection:text-hack-black overflow-hidden relative">

            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-20"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opactiy='0.5'/%3E%3C/svg%3E")` }}>
            </div>

            {/* Glowing Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-hack-neon/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse-slow"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-hack-violet/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>


            <main className="relative z-10 px-6 md:px-12 lg:px-24">

                {/* HERO SECTION */}
                <section ref={heroRef} className="h-screen flex flex-col justify-center items-start border-b border-white/10">
                    <p className="text-hack-neon font-mono mb-4 tracking-widest uppercase text-sm">Financial Operations</p>
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-bold leading-[0.9] tracking-tighter mb-8 overflow-hidden">
                        {"PAYMENT".split("").map((char, i) => (
                            <span key={i} className="hero-text-char inline-block">{char}</span>
                        ))}
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-hack-neon to-hack-violet">
                            {"PORTAL".split("").map((char, i) => (
                                <span key={i} className="hero-text-char inline-block">{char}</span>
                            ))}
                        </span>
                    </h1>
                    <div className="glass-neon px-6 py-4 rounded-lg flex items-center gap-4 mt-8 max-w-md w-full justify-between">
                        <div>
                            <p className="text-sm text-gray-400 uppercase tracking-wider">Total Due</p>
                            <p className="text-4xl font-mono font-bold text-white">₹{totalFine}</p>
                        </div>
                        <RazorpayButton
                            amount={totalFine}
                            studentData={studentData}
                            onSuccess={() => window.location.reload()}
                        />
                    </div>
                </section>

                {/* STATS OVERVIEW */}
                <section ref={statsRef} className="py-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="stat-card glass-card p-8 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                            <AlertTriangle className="w-12 h-12 text-hack-neon" />
                        </div>
                        <h3 className="text-gray-400 font-mono text-sm uppercase mb-2">Pending Fines</h3>
                        <p className="text-5xl font-heading text-hack-neon">{fines.length}</p>
                        <p className="text-sm text-gray-500 mt-2">Books with overdue charges</p>
                    </div>

                    <div className="stat-card glass-card p-8 rounded-2xl relative overflow-hidden group mt-12 md:mt-0">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <h3 className="text-gray-400 font-mono text-sm uppercase mb-2">Cleared</h3>
                        <p className="text-5xl font-heading text-white">{paidHistory.length}</p>
                        <p className="text-sm text-gray-500 mt-2">Successfully paid fines</p>
                    </div>

                    <div className="stat-card glass-card p-8 rounded-2xl relative overflow-hidden group mt-24 md:mt-0">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                            <Clock className="w-12 h-12 text-hack-violet" />
                        </div>
                        <h3 className="text-gray-400 font-mono text-sm uppercase mb-2">Next Due</h3>
                        <p className="text-2xl font-heading text-white mt-2">
                            {studentData?.booksIssued?.find(b => b.status === "Issued")
                                ? new Date(studentData.booksIssued.find(b => b.status === "Issued").dueDate).toLocaleDateString()
                                : "No Due Books"}
                        </p>
                    </div>
                </section>

                {/* DETAILED HISTORY (Sticky Scroll) */}
                <section ref={historyRef} className="py-24 min-h-screen relative">
                    <div className="flex flex-col lg:flex-row gap-16">
                        <div className="lg:w-1/3 lg:sticky lg:top-32 h-fit">
                            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                                TRANSACTION <br />
                                <span className="text-hack-violet">HISTORY</span>
                            </h2>
                            <p className="text-gray-400 leading-relaxed max-w-sm">
                                A complete record of your library financial interactions.
                                fines are calculated at ₹2 per day for overdue books.
                            </p>
                        </div>

                        <div className="lg:w-2/3 space-y-6">
                            {fines.length === 0 && paidHistory.length === 0 ? (
                                <div className="history-item glass p-8 rounded-xl border-l-4 border-gray-700">
                                    <p className="text-xl text-gray-500">No payment history found.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Unpaid Fines */}
                                    {fines.map((item, idx) => (
                                        <div key={`fine-${idx}`} className="history-item glass p-6 rounded-xl border-l-4 border-hack-neon md:flex items-center justify-between group hover:bg-white/5 transition-colors">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded uppercase tracking-wider">Unpaid</span>
                                                    <p className="text-lg font-bold text-white group-hover:text-hack-neon transition-colors">{item.bookTitle}</p>
                                                </div>
                                                <p className="text-sm text-gray-400">Due Date: {new Date(item.dueDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="mt-4 md:mt-0 text-right">
                                                <p className="text-2xl font-mono font-bold text-hack-neon">₹{item.fine}</p>
                                                <p className="text-xs text-gray-500 uppercase">Late Charge</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Paid History */}
                                    {paidHistory.map((item, idx) => (
                                        <div key={`paid-${idx}`} className="history-item glass p-6 rounded-xl border-l-4 border-green-500 md:flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded uppercase tracking-wider">Paid</span>
                                                    <p className="text-lg font-bold text-white">{item.bookTitle}</p>
                                                </div>
                                                <p className="text-sm text-gray-400">Paid on: {new Date(item.returnDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="mt-4 md:mt-0 text-right">
                                                <p className="text-2xl font-mono font-bold text-white">₹{item.fine}</p>
                                                <p className="text-xs text-gray-500 uppercase">Settled</p>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </section>

                <footer className="py-12 border-t border-white/10 text-center text-gray-600 text-sm">
                    <p>SECURE PAYMENTS POWERED BY RAZORPAY</p>
                </footer>

            </main>
        </div>
    );
};

export default PaymentDashboard;
