import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import EnhancedStatCard from '../components/EnhancedStatCard.jsx';
import TransactionHistory from '../components/TransactionHistory.jsx'; // Import TransactionHistory
import {
    LayoutDashboard, Users as UsersIcon, LogOut, RotateCcw, BookOpen, TrendingUp, Clock, CreditCard, FileDown, Settings
} from 'lucide-react';
import soaLogo from '../assets/soa_logo.png';
import DashboardLayout from '../layouts/DashboardLayout.jsx';

const LibrarianDashboard = () => {
    const { logout, user, login } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ studentCount: 0, bookCount: 0, activeIssues: 0 });
    const [books, setBooks] = useState([]);
    const [transactions, setTransactions] = useState([]); // State for transactions
    const [searchRegNo, setSearchRegNo] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [issueBookId, setIssueBookId] = useState('');
    const [customDueDate, setCustomDueDate] = useState('');
    const [overdueBooks, setOverdueBooks] = useState([]);

    // Settings state
    const [profileName, setProfileName] = useState(user?.name || '');
    const [profileEmail, setProfileEmail] = useState(user?.email || '');
    const [profilePassword, setProfilePassword] = useState('');
    const [dashboardColor, setDashboardColor] = useState('amber');

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

    const downloadReport = async (type) => {
        try {
            // Use axios to fetch as blob to handle potential auth/CORS better if needed, 
            // but for now let's just use absolute URL if possible.
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const url = `${baseUrl}/api/reports/${type}`;
            window.open(url, '_blank');
        } catch (err) {
            alert('Failed to download report');
        }
    };

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
                bookId: issueBookId,
                customDueDate
            });
            alert('Book Issued successfully');
            setCustomDueDate('');
            setIssueBookId('');
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

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/api/profile/update', {
                regno: user.regno,
                name: profileName,
                email: profileEmail,
                password: profilePassword || undefined
            });
            alert('Profile updated successfully');
            // Update local state and storage
            const updatedUser = { ...user, name: profileName, email: profileEmail };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.location.reload(); // Refresh to reflect changes everywhere
        } catch (err) {
            alert(err.response?.data?.error || 'Update Failed');
        }
    };

    const navTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'manage', label: 'Manage Issues', icon: UsersIcon },
        { id: 'overdue', label: 'Overdue Monitor', icon: Clock },
        { id: 'fines', label: 'Fines & Payments', icon: CreditCard },
        { id: 'settings', label: 'Settings & Profile', icon: Settings },
    ];

    const palettes = [
        { id: 'amber', color: '#f59e0b', label: 'Amber Gold' },
        { id: 'blue', color: '#3b82f6', label: 'Royal Blue' },
        { id: 'emerald', color: '#10b981', label: 'Emerald Green' },
        { id: 'rose', color: '#f43f5e', label: 'Rose Red' },
        { id: 'purple', color: '#a855f7', label: 'Vibrant Purple' },
        { id: 'indigo', color: '#6366f1', label: 'Classic Indigo' },
    ];

    return (
        <DashboardLayout
            tabs={navTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            logout={logout}
            user={user}
            title="Librarian Console"
            colorScheme={dashboardColor}
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
                                    <div className="flex gap-4">
                                        <Button
                                            onClick={() => setActiveTab('manage')}
                                            className="bg-amber-600 hover:bg-amber-700 text-white"
                                        >
                                            Manage Student Books
                                        </Button>
                                        <Button
                                            onClick={() => downloadReport('books')}
                                            className="bg-slate-700 hover:bg-slate-600 text-white gap-2"
                                        >
                                            <FileDown className="h-4 w-4" /> Download Book Report
                                        </Button>
                                    </div>
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
                                            <div className="space-y-1">
                                                <label className="text-xs text-slate-400 ml-1">Optional Custom Due Date</label>
                                                <Input
                                                    type="date"
                                                    value={customDueDate}
                                                    onChange={(e) => setCustomDueDate(e.target.value)}
                                                    className="bg-slate-900 border-slate-600 text-white"
                                                />
                                            </div>
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
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Fines & Payment History</h1>
                                <p className="text-slate-400">View recent fine payments from students</p>
                            </div>
                            <Button onClick={() => downloadReport('transactions')} variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 gap-2">
                                <FileDown className="h-4 w-4" /> Export Ledger
                            </Button>
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
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Overdue Monitor</h1>
                                <p className="text-slate-400">Students with outstanding books beyond due date</p>
                            </div>
                            <Button onClick={() => downloadReport('overdue')} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2">
                                <FileDown className="h-4 w-4" /> Download Report
                            </Button>
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
                                                        try {
                                                            await api.post('/api/send-notice', {
                                                                regno: item.userRegno,
                                                                bookTitle: item.bookTitle,
                                                                dueDate: item.dueDate,
                                                                fine: item.fine,
                                                                email: item.userEmail
                                                            });
                                                            alert(`Notice sent to ${item.userEmail}`);
                                                        } catch (err) {
                                                            alert('Failed to send notice');
                                                        }
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

                {activeTab === 'settings' && (
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Settings & Profile</h1>
                            <p className="text-slate-400">Update your information and customize your experience</p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Profile Section */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <UsersIcon className="h-6 w-6 text-amber-500" />
                                    Edit Profile
                                </h3>

                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Full Name</label>
                                        <Input
                                            value={profileName}
                                            onChange={(e) => setProfileName(e.target.value)}
                                            className="bg-slate-950 border-slate-700 text-white"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Email Address</label>
                                        <Input
                                            type="email"
                                            value={profileEmail}
                                            onChange={(e) => setProfileEmail(e.target.value)}
                                            className="bg-slate-950 border-slate-700 text-white"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Change Password</label>
                                        <Input
                                            type="password"
                                            value={profilePassword}
                                            onChange={(e) => setProfilePassword(e.target.value)}
                                            className="bg-slate-950 border-slate-700 text-white"
                                            placeholder="Enter new password (optional)"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 mt-4">
                                        Save Changes
                                    </Button>
                                </form>
                            </div>

                            {/* Appearance Section */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <LayoutDashboard className="h-6 w-6 text-blue-500" />
                                    Appearance
                                </h3>

                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-slate-400">Dashboard Color Palette</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {palettes.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => setDashboardColor(p.id)}
                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${dashboardColor === p.id
                                                    ? 'bg-slate-800 border-white/20 ring-2 ring-offset-2 ring-offset-slate-950 ring-white/10'
                                                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                                                    }`}
                                            >
                                                <div
                                                    className="h-4 w-4 rounded-full shadow-lg"
                                                    style={{ backgroundColor: p.color }}
                                                />
                                                <span className="text-xs font-medium text-slate-300">{p.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 italic mt-4">
                                        Select a color to personalize your dashboard interface.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default LibrarianDashboard;
