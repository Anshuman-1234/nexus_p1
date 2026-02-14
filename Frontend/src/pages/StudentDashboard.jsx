import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Button } from '../components/ui/Button';
import EnhancedStatCard from '../components/EnhancedStatCard';
import SubjectCard from '../components/SubjectCard';
import BookCard from '../components/BookCard';
import EmptyState from '../components/EmptyState';
import {
    BookOpen, LogOut, LayoutDashboard, Search, Book,
    CreditCard, User, TrendingUp, CheckCircle, GraduationCap, Library
} from 'lucide-react';
import soaLogo from '../assets/soa_logo.png';
import {
    semesterSubjects,
    getYearName,
    getAcademicYear,
    getSemestersForYear,
    getSubjectsForYear
} from '../data/subjectData';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import DonutChart from '../components/charts/DonutChart';
import ProgressRing from '../components/charts/ProgressRing';
import DashboardLayout from '../layouts/DashboardLayout';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [studentData, setStudentData] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalFine, setTotalFine] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user?.regno) {
                    const profileRes = await api.get(`/api/student/${user.regno}`);
                    setStudentData(profileRes.data.user);
                    setTotalFine(profileRes.data.totalFine);
                }
                const booksRes = await api.get('/api/books');
                setBooks(booksRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayFine = async () => {
        if (totalFine <= 0) return;

        const res = await loadRazorpay();
        if (!res) {
            // Fallback to mock if SDK fails (offline or blocked)
            console.warn("Razorpay SDK failed to load. Falling back to mock.");
        }

        try {
            // 1. Create Order
            let orderData = null;
            try {
                const result = await api.post('/api/create-order', { amount: totalFine });
                orderData = result.data;
            } catch (err) {
                console.warn("Backend Create Order failed (likely missing keys). Falling back to mock payment.");
            }

            // If backend failed or returned invalid data, use Mock flow
            if (!orderData || !orderData.id) {
                const confirmMock = window.confirm(
                    "Payment Gateway is not configured (missing API keys).\n\nProcess a MOCK payment to clear fines?"
                );
                if (confirmMock) {
                    // Simulate success
                    const mockPaymentData = {
                        razorpay_payment_id: "pay_mock_" + Date.now(),
                        razorpay_order_id: "order_mock_" + Date.now(),
                        razorpay_signature: "mock_signature",
                        regno: studentData.regno,
                        is_mock: true // Tell backend this is a mock
                    };

                    try {
                        const verifyRes = await api.post('/api/verify-payment', mockPaymentData);
                        if (verifyRes.data.success) {
                            alert("Mock Payment Successful! Fine cleared.");
                            window.location.reload();
                        } else {
                            alert("Mock Payment verification failed");
                        }
                    } catch (e) {
                        alert("Could not clear fine on server. Backend needs to allow Mock payments.");
                    }
                }
                return;
            }

            const { amount, id: order_id, currency, key_id } = orderData;

            const options = {
                key: key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                amount: amount.toString(),
                currency: currency,
                name: "SOA Library",
                description: "Fine Payment",
                image: soaLogo,
                order_id: order_id,
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
                            alert("Payment Successful! Fine cleared.");
                            window.location.reload();
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
                    contact: "" // Leave empty to let user enter their number (required for UPI)
                },
                notes: {
                    address: "SOA University"
                },
                theme: {
                    color: "#3b82f6"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (e) {
            console.error("Payment Error:", e);
            alert("Payment failed to initialize: " + e.message);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-slate-400">Loading your dashboard...</p>
            </div>
        </div>
    );

    const issuedBooks = studentData?.booksIssued || [];
    const activeIssued = issuedBooks.filter(b => b.status === "Issued");
    const returnedBooks = issuedBooks.filter(b => b.status === "Returned");

    // Filter books based on search
    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.section && book.section.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const navTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'subjects', label: 'Subjects & Resources', icon: GraduationCap },
        { id: 'books', label: 'Browse Books', icon: Library },
        { id: 'history', label: 'History', icon: Book },
    ];

    return (
        <DashboardLayout
            tabs={navTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            logout={logout}
            user={studentData}
            title="Student Portal"
            colorScheme="blue"
            headerTitle="Student Portal"
        >
            <div className="space-y-6">
                {activeTab === 'dashboard' && (
                    <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Welcome back, {studentData?.name?.split(' ')[0]}!</h1>
                                <p className="text-slate-400 text-sm">Here's your library overview</p>
                            </div>
                            {totalFine > 0 && (
                                <Button onClick={handlePayFine} className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-500/20">
                                    <CreditCard className="h-4 w-4" />
                                    Pay Fine: ₹{totalFine}
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <EnhancedStatCard
                                title="Books Issued"
                                value={activeIssued.length}
                                icon={BookOpen}
                                color="blue"
                                subtext={`Currently reading`}
                            />
                            <EnhancedStatCard
                                title="Books Returned"
                                value={returnedBooks.length}
                                icon={CheckCircle}
                                color="green"
                                subtext="All time"
                            />
                            <EnhancedStatCard
                                title="Total Fines"
                                value={`₹${totalFine}`}
                                icon={TrendingUp}
                                color={totalFine > 0 ? "red" : "green"}
                                subtext={totalFine > 0 ? "Payment Pending" : "All Clear!"}
                            />
                        </div>

                        {/* Quick Actions Panel */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                            <h3 className="text-base font-semibold text-white mb-3">Quick Actions</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <button
                                    className="flex flex-col items-center gap-2 p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-all duration-200 group"
                                    onClick={() => setActiveTab('books')}
                                >
                                    <div className="p-2 bg-blue-500/20 rounded-full group-hover:scale-110 transition-transform">
                                        <BookOpen className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-white text-sm">Browse Books</div>
                                        <div className="text-[10px] text-slate-400">Find new books</div>
                                    </div>
                                </button>

                                <button
                                    className="flex flex-col items-center gap-2 p-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-all duration-200 group"
                                    onClick={() => setActiveTab('subjects')}
                                >
                                    <div className="p-2 bg-purple-500/20 rounded-full group-hover:scale-110 transition-transform">
                                        <GraduationCap className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-white text-sm">Study Resources</div>
                                        <div className="text-[10px] text-slate-400">Access materials</div>
                                    </div>
                                </button>

                                <button
                                    className="flex flex-col items-center gap-2 p-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg transition-all duration-200 group"
                                    onClick={() => setActiveTab('history')}
                                >
                                    <div className="p-2 bg-green-500/20 rounded-full group-hover:scale-110 transition-transform">
                                        <Book className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-white text-sm">View History</div>
                                        <div className="text-[10px] text-slate-400">Past readings</div>
                                    </div>
                                </button>

                                <button
                                    className="flex flex-col items-center gap-2 p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-all duration-200 group"
                                    disabled={totalFine === 0}
                                    onClick={handlePayFine}
                                >
                                    <div className="p-2 bg-amber-500/20 rounded-full group-hover:scale-110 transition-transform">
                                        <CreditCard className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-white text-sm">Pay Fines</div>
                                        <div className="text-[10px] text-slate-400">
                                            {totalFine > 0 ? `₹${totalFine} due` : 'No fines'}
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-white">Currently Issued Books</h3>
                                <span className="text-sm text-slate-400">{activeIssued.length} active</span>
                            </div>
                            {activeIssued.length === 0 ? (
                                <EmptyState
                                    type="no-books"
                                    action={
                                        <Button
                                            onClick={() => setActiveTab('books')}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            Browse Library
                                        </Button>
                                    }
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeIssued.map((book, idx) => (
                                        <BookCard key={idx} book={book} variant="issued" />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'subjects' && (() => {
                    const userYear = getAcademicYear(studentData?.regno || '');
                    const userSemesters = getSemestersForYear(userYear);
                    const userSubjects = getSubjectsForYear(userYear);

                    return (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Subjects & Resources</h1>
                                <p className="text-slate-400">Access your semester study materials and resources</p>
                            </div>

                            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <GraduationCap className="h-6 w-6 text-blue-400" />
                                        <div>
                                            <h2 className="text-xl font-bold text-white">
                                                {getYearName(userYear)} Year
                                            </h2>
                                            <p className="text-sm text-slate-400">
                                                Semesters {userSemesters[0]} & {userSemesters[1]} | Computer Science & Engineering
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-medium">
                                        {userSubjects.length} Subjects
                                    </span>
                                </div>
                            </div>

                            {userSubjects.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {userSubjects.map((subject, idx) => (
                                            <SubjectCard
                                                key={idx}
                                                title={subject.title}
                                                code={subject.code}
                                                description={subject.description}
                                                link={subject.link}
                                                color={subject.color}
                                            />
                                        ))}
                                    </div>

                                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
                                        <p className="text-sm text-slate-400">
                                            <span className="font-semibold text-slate-300">Note:</span> All materials are provided by ITER Wallah.
                                            Click on any subject card to access Google Drive resources.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-xl p-12 text-center">
                                    <div className="max-w-md mx-auto">
                                        <div className="bg-amber-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <GraduationCap className="h-8 w-8 text-amber-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Materials Coming Soon</h3>
                                        <p className="text-slate-400 mb-4">
                                            Study materials for {getYearName(userYear)} Year (Semesters {userSemesters[0]} & {userSemesters[1]})
                                            are not yet available on ITER Wallah.
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Check back later or contact your faculty for course materials.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {activeTab === 'books' && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Browse Library Collection</h1>
                            <p className="text-slate-400">Explore our extensive collection of books</p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by title, author, category, or section..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {filteredBooks.length === 0 ? (
                            <EmptyState
                                type="no-results"
                                description="Try adjusting your search query to find books."
                            />
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-400">
                                        Showing {filteredBooks.length} of {books.length} books
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredBooks.map((book) => (
                                        <BookCard key={book._id} book={book} variant="library" />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Reading History</h1>
                            <p className="text-slate-400">Your complete book history</p>
                        </div>

                        {returnedBooks.length === 0 ? (
                            <EmptyState type="no-history" />
                        ) : (
                            <div className="space-y-3">
                                {returnedBooks.map((book, idx) => (
                                    <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex justify-between items-center hover:border-slate-700 transition-colors">
                                        <div>
                                            <h4 className="text-white font-medium">{book.bookTitle}</h4>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Issued: {new Date(book.issueDate).toLocaleDateString()} •
                                                Returned: {new Date(book.returnDate).toLocaleDateString()}
                                            </p>
                                            {book.fine > 0 && (
                                                <p className="text-xs text-amber-400 mt-1">Fine Paid: ₹{book.fine}</p>
                                            )}
                                        </div>
                                        <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full font-medium">Returned</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentDashboard;
