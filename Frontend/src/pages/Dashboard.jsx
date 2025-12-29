import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import {
    BookOpen, LogOut, LayoutDashboard, Search, Book,
    CreditCard, Bell, User, ChevronDown, Clock, AlertCircle, TrendingUp
} from 'lucide-react';

import soaLogo from '../assets/soa_logo.png';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 relative overflow-hidden group hover:border-slate-600 transition-all">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
                {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
                <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');


    const stats = [
        { title: 'Issued Books', value: '3', icon: BookOpen, color: 'text-blue-400', subtext: '2 Due Soon' },
        { title: 'Upcoming Due', value: '1', icon: Clock, color: 'text-amber-400', subtext: 'In 3 Days' },
        { title: 'Overdue', value: '0', icon: AlertCircle, color: 'text-red-400', subtext: 'Good job!' },
        { title: 'Total Fines', value: '₹45.00', icon: TrendingUp, color: 'text-green-400', subtext: 'Unpaid' },
    ];

    const issuedBooks = [
        { title: 'Modern Operating Systems', author: 'Andrew S. Tanenbaum', dueIn: '3 days', status: 'DUE SOON', statusColor: 'bg-amber-500/20 text-amber-400' },
        { title: 'Design Patterns', author: 'Erich Gamma', dueIn: '12 days', status: 'ACTIVE', statusColor: 'bg-green-500/20 text-green-400' },
        { title: 'Clean Code', author: 'Robert C. Martin', dueIn: '14 days', status: 'ACTIVE', statusColor: 'bg-green-500/20 text-green-400' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans">


            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <img
                        src={soaLogo}
                        alt="SOA Logo"
                        className="h-12 w-auto drop-shadow-md"
                    />
                    <span className="text-xl font-bold text-white tracking-tight">SOA LIBRARY</span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'search', label: 'Search Books', icon: Search },
                        { id: 'mybooks', label: 'My Books', icon: Book },
                        { id: 'fines', label: 'Fines', icon: CreditCard },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={logout} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full px-4 py-2">
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>


            <main className="flex-1 flex flex-col overflow-hidden">


                <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-white">Student Portal</h2>
                        <div className="hidden sm:flex bg-slate-800 rounded-full p-1 border border-slate-700">
                            <button className="px-3 py-1 bg-slate-700 rounded-full text-xs font-medium text-white shadow-sm">Student</button>
                            <button className="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white">Librarian</button>
                            <button className="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white">Admin</button>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative text-slate-400 hover:text-white">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-white">{user?.username || 'John Student'}</p>
                                <p className="text-xs text-slate-400">{user?.email || 'student@college.edu'}</p>
                            </div>
                            <div className="h-8 w-8 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600">
                                <User className="h-4 w-4 text-slate-300" />
                            </div>
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                        </div>
                    </div>
                </header>


                <div className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide">
                    <div className="max-w-6xl mx-auto space-y-8">


                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white">Welcome back, {user?.username?.split(' ')[0] || 'User'}!</h1>
                                <p className="text-slate-400 mt-1">Here is what's happening with your library account today.</p>
                            </div>
                            <Button className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-white gap-2">
                                <Search className="h-4 w-4" />
                                Find New Books
                            </Button>
                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.map((stat, idx) => (
                                <StatCard key={idx} {...stat} />
                            ))}
                        </div>


                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white">Currently Issued</h3>
                                    <button className="text-sm text-blue-400 hover:text-blue-300">View All &gt;</button>
                                </div>

                                <div className="space-y-3">
                                    {issuedBooks.map((book, idx) => (
                                        <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex items-center gap-4 hover:border-slate-700 transition-colors group">
                                            <div className="h-12 w-10 bg-slate-800 rounded flex items-center justify-center flex-shrink-0 border border-slate-700">
                                                <Book className="h-5 w-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-medium truncate">{book.title}</h4>
                                                <p className="text-sm text-slate-500 truncate">{book.author}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm text-slate-400 mb-1">Due in {book.dueIn}</p>
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${book.statusColor}`}>
                                                    {book.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white">Recent Notifications</h3>
                                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5 space-y-6">
                                    <div className="relative pl-6 border-l-2 border-green-500">
                                        <p className="text-sm text-slate-300 mb-1">Book 'Introduction to Algorithms' is now available for pickup.</p>
                                        <p className="text-xs text-slate-500">2 hours ago</p>
                                    </div>
                                    <div className="relative pl-6 border-l-2 border-blue-500">
                                        <p className="text-sm text-slate-300 mb-1">Your request for 'Deep Learning' has been approved.</p>
                                        <p className="text-xs text-slate-500">1 day ago</p>
                                    </div>
                                    <div className="relative pl-6 border-l-2 border-red-500">
                                        <p className="text-sm text-slate-300 mb-1">Fine of ₹15.00 generated for late return of 'Artificial Intelligence'.</p>
                                        <p className="text-xs text-slate-500">3 days ago</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
