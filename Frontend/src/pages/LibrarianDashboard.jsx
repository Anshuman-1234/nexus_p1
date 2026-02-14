import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import EnhancedStatCard from '../components/EnhancedStatCard';
import TransactionHistory from '../components/TransactionHistory'; // Import TransactionHistory
import {
    LayoutDashboard, Users as UsersIcon, LogOut, RotateCcw, BookOpen, TrendingUp, Clock, CreditCard
} from 'lucide-react';
import soaLogo from '../assets/soa_logo.png';
import DashboardLayout from '../layouts/DashboardLayout';

const LibrarianDashboard = () => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ studentCount: 0, bookCount: 0, activeIssues: 0 });
    const [books, setBooks] = useState([]);
    const [transactions, setTransactions] = useState([]); // State for transactions
    const [searchRegNo, setSearchRegNo] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [issueBookId, setIssueBookId] = useState('');
    const [overdueBooks, setOverdueBooks] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/api/dashboard-stats');
                setStats(res.data);
                const booksRes = await api.get('/api/books');
                setBooks(booksRes.data);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchTransactions = async () => {
            try {
                const res = await api.get('/api/transactions');
                setTransactions(res.data);
            } catch (err) {
                console.error("Failed to fetch transactions", err);
            }
        };

        const fetchOverdue = async () => {
            try {
                const res = await api.get('/api/overdue-books');
                setOverdueBooks(res.data);
            } catch (err) {
                console.error("Failed to fetch overdue books", err);
            }
        };

        fetchStats();
        if (activeTab === 'fines') {
            fetchTransactions();
        }
        if (activeTab === 'overdue' || activeTab === 'dashboard') {
            fetchOverdue();
        }
    }, [activeTab]);

    const searchStudent = async () => {
        try {
            const res = await api.get(`/api/student/${searchRegNo}`);
            setSelectedStudent(res.data);
        } catch (err) {
            alert('Student not found');
            setSelectedStudent(null);
        }
    };

    const handleIssueBook = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/issue', {
                regno: searchRegNo,
                bookId: issueBookId
            });
            alert('Book Issued successfully');
            searchStudent();
        } catch (err) {
            alert(err.response?.data?.error || 'Issue Failed');
        }
    };

    const handleReturnBook = async (bookIssueId) => {
        if (!window.confirm('Confirm return?')) return;
        try {
            const res = await api.post('/api/return', {
                regno: searchRegNo,
                bookIssueId
            });
            alert(`Book Returned. Fine: ₹${res.data.fine}`);
            searchStudent();
        } catch (err) {
            alert(err.response?.data?.error || 'Return Failed');
        }
    };

    const navTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'manage', label: 'Manage Issues', icon: UsersIcon },
        { id: 'overdue', label: 'Overdue Monitor', icon: Clock },
        { id: 'fines', label: 'Fines & Payments', icon: CreditCard },
    ];

    return (
        <DashboardLayout
            tabs={navTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            logout={logout}
            user={{ name: 'Librarian', role: 'Chief Librarian' }}
            title="Librarian Console"
            colorScheme="amber"
            headerTitle="Librarian Console"
        >
            <div className="space-y-6">

                {activeTab === 'dashboard' && (
                    <>
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">Library Overview</h1>
                            <p className="text-slate-400 text-sm">Monitor and manage library operations</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <EnhancedStatCard
                                title="Total Students"
                                value={stats.studentCount}
                                icon={UsersIcon}
                                color="blue"
                                subtext="Registered users"
                            />
                            <EnhancedStatCard
                                title="Total Books"
                                value={stats.bookCount}
                                icon={BookOpen}
                                color="purple"
                                subtext="In collection"
                            />
                            <EnhancedStatCard
                                title="Active Issues"
                                value={stats.activeIssues}
                                icon={TrendingUp}
                                color="amber"
                                subtext="Currently issued"
                            />
                        </div>

                        <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-amber-500/20 p-3 rounded-lg">
                                    <Clock className="h-6 w-6 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">Quick Actions</h3>
                                    <p className="text-sm text-slate-400 mb-4">Use the "Manage Issues" tab to issue or return books for students</p>
                                    <Button
                                        onClick={() => setActiveTab('manage')}
                                        className="bg-amber-600 hover:bg-amber-700 text-white"
                                    >
                                        Manage Student Books
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'manage' && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Manage Issues & Returns</h1>
                            <p className="text-slate-400">Search for students and manage their book transactions</p>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Search Student</h3>
                            <div className="flex gap-4">
                                <Input
                                    placeholder="Enter Student Registration Number"
                                    value={searchRegNo}
                                    onChange={(e) => setSearchRegNo(e.target.value)}
                                    className="bg-slate-900 border-slate-600 text-white flex-1"
                                />
                                <Button onClick={searchStudent} className="bg-amber-600 hover:bg-amber-700 px-8">
                                    Search
                                </Button>
                            </div>
                        </div>

                        {selectedStudent && (
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-6">
                                <div className="flex justify-between items-start border-b border-slate-700 pb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">{selectedStudent.user.name}</h2>
                                        <p className="text-slate-400">{selectedStudent.user.email}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-sm font-mono bg-slate-800 text-blue-400 px-3 py-1 rounded">
                                                {selectedStudent.user.regno}
                                            </span>
                                            {selectedStudent.totalFine > 0 && (
                                                <span className="text-sm font-semibold bg-red-500/10 text-red-400 px-3 py-1 rounded border border-red-500/20">
                                                    Pending Fines: ₹{selectedStudent.totalFine}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <BookOpen className="h-5 w-5 text-blue-400" />
                                            Issue New Book
                                        </h3>
                                        <form onSubmit={handleIssueBook} className="space-y-4">
                                            <select
                                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                value={issueBookId}
                                                onChange={(e) => setIssueBookId(e.target.value)}
                                                required
                                            >
                                                <option value="">Select a Book</option>
                                                {books.map(b => (
                                                    <option key={b._id} value={b._id} disabled={b.availableCopies < 1}>
                                                        {b.title} - {b.edition} ({b.section}) [{b.availableCopies} available]
                                                    </option>
                                                ))}
                                            </select>
                                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                                Issue Book
                                            </Button>
                                        </form>
                                    </div>

                                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <RotateCcw className="h-5 w-5 text-green-400" />
                                            Currently Issued ({selectedStudent.user.booksIssued.filter(b => b.status === 'Issued').length})
                                        </h3>
                                        <div className="space-y-3 max-h-64 overflow-y-auto">
                                            {selectedStudent.user.booksIssued.filter(b => b.status === 'Issued').map(b => (
                                                <div key={b._id} className="bg-slate-900 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-white mb-1">{b.bookTitle}</p>
                                                            <p className="text-xs text-slate-400">
                                                                Due: {new Date(b.dueDate).toLocaleDateString()}
                                                            </p>
                                                            {b.fine > 0 && (
                                                                <p className="text-xs text-red-400 font-semibold mt-1">
                                                                    Fine: ₹{b.fine}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleReturnBook(b._id)}
                                                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3"
                                                        >
                                                            Return
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {selectedStudent.user.booksIssued.filter(b => b.status === 'Issued').length === 0 && (
                                            <p className="text-slate-500 text-sm text-center py-4">No active issues</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'fines' && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Fines & Payment History</h1>
                            <p className="text-slate-400">View recent fine payments from students</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <EnhancedStatCard
                                title="Total Collected"
                                value={`₹${transactions.reduce((sum, t) => sum + (t.status === 'Success' ? t.amount : 0), 0)}`}
                                icon={TrendingUp}
                                color="green"
                                subtext="Lifetime collections"
                            />
                            <EnhancedStatCard
                                title="Recent Transactions"
                                value={transactions.length}
                                icon={Clock}
                                color="blue"
                                subtext="Last 50 transactions"
                            />
                            <EnhancedStatCard
                                title="Payment Gateway"
                                value="Razorpay"
                                icon={CreditCard}
                                color="purple"
                                subtext="Active"
                            />
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <TransactionHistory transactions={transactions} />
                        </div>
                    </div>
                )}

                {activeTab === 'overdue' && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Overdue Monitor</h1>
                            <p className="text-slate-400">Students with outstanding books beyond due date</p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-800/50 text-slate-300 text-sm uppercase tracking-wider font-mono">
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Book</th>
                                        <th className="px-6 py-4">Due Date</th>
                                        <th className="px-6 py-4 text-red-400">Fine</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {overdueBooks.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white">{item.userName}</div>
                                                <div className="text-xs text-slate-500 font-mono">{item.userRegno}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">{item.bookTitle}</td>
                                            <td className="px-6 py-4 text-slate-400">{new Date(item.dueDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-bold text-red-400">₹{item.fine}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    size="sm"
                                                    className="bg-red-600/10 text-red-400 border border-red-600/20 hover:bg-red-600 hover:text-white"
                                                    onClick={async () => {
                                                        alert(`Notice sent to ${item.userEmail}`);
                                                    }}
                                                >
                                                    Send Notice
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {overdueBooks.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic">
                                                No overdue books found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default LibrarianDashboard;
