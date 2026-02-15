import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import EnhancedStatCard from '../components/EnhancedStatCard.jsx';
import {
    LayoutDashboard, Plus, Trash2, LogOut, BookOpen, Users, Database, Activity, TrendingUp, DollarSign, FileDown
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import soaLogo from '../assets/soa_logo.png';
import DashboardLayout from '../layouts/DashboardLayout.jsx';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [books, setBooks] = useState([]);
    const [students, setStudents] = useState([]);

    // Forms state
    const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', category: '', section: '', edition: '', totalCopies: 1 });
    const [newStudent, setNewStudent] = useState({ name: '', regno: '', email: '', password: '' });
    const [editingStudent, setEditingStudent] = useState(null);
    const [analytics, setAnalytics] = useState({ categoryData: [], financialData: [], activityTrend: [] });
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [bRes, sRes, aRes] = await Promise.all([
                api.get('/api/books'),
                api.get('/api/all-students'),
                api.get('/api/admin/analytics')
            ]);
            setBooks(bRes.data);
            setStudents(sRes.data);
            setAnalytics(aRes.data);
            setLoadingAnalytics(false);
        } catch (err) {
            console.error(err);
            setLoadingAnalytics(false);
        }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/books', newBook);
            alert('Book Added Successfully');
            setNewBook({ title: '', author: '', isbn: '', category: '', section: '', edition: '', totalCopies: 1 });
            fetchData();
        } catch (err) {
            alert('Error adding book');
        }
    };

    const handleDeleteBook = async (id) => {
        if (!confirm('Delete this book? This action cannot be undone.')) return;
        try {
            await api.delete(`/api/books/${id}`);
            fetchData();
        } catch (err) {
            alert('Error deleting book');
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/students', newStudent);
            alert('Student Registered Successfully');
            setNewStudent({ name: '', regno: '', email: '', password: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Error adding student');
        }
    };

    const handleDeleteStudent = async (regno) => {
        if (!confirm('Delete this student? All records will be permanently lost.')) return;
        try {
            await api.delete(`/api/students/${regno}`);
            fetchData();
        } catch (err) {
            alert('Error deleting student');
        }
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/students/${editingStudent.regno}`, editingStudent);
            alert('Student Updated Successfully');
            setEditingStudent(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Error updating student');
        }
    };

    // Calculate stats
    const totalBooksCount = books.reduce((sum, book) => sum + book.totalCopies, 0);
    const availableBooksCount = books.reduce((sum, book) => sum + book.availableCopies, 0);

    const navTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'books', label: 'Manage Books', icon: BookOpen },
        { id: 'students', label: 'Manage Students', icon: Users },
        { id: 'edit', label: 'Edit Student', icon: Plus, hidden: !editingStudent },
    ];

    const downloadReport = (type) => {
        const url = `${import.meta.env.VITE_API_URL || ''}/api/reports/${type}`;
        window.open(url, '_blank');
    };

    return (
        <DashboardLayout
            tabs={navTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            logout={logout}
            user={{ name: 'Admin', role: 'System Administrator' }}
            title="Admin Console"
            colorScheme="purple"
            headerTitle="Admin Console"
        >
            <div className="space-y-6">
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">System Overview</h1>
                                <p className="text-slate-400 text-sm">Monitor and manage library system</p>
                            </div>
                            <Button onClick={() => downloadReport('books')} variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 gap-2">
                                <FileDown className="h-4 w-4" /> Export Catalog
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <EnhancedStatCard
                                title="Book Titles"
                                value={books.length}
                                icon={BookOpen}
                                color="blue"
                                subtext="Unique titles"
                            />
                            <EnhancedStatCard
                                title="Total Copies"
                                value={totalBooksCount}
                                icon={Database}
                                color="purple"
                                subtext="All books"
                            />
                            <EnhancedStatCard
                                title="Available"
                                value={availableBooksCount}
                                icon={Activity}
                                color="green"
                                subtext="Ready to issue"
                            />
                            <EnhancedStatCard
                                title="Students"
                                value={students.length}
                                icon={Users}
                                color="cyan"
                                subtext="Registered"
                            />
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Circulation Trend Chart */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-purple-400" />
                                    Circulation Trend (Last 7 Days)
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.activityTrend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Legend />
                                            <Bar dataKey="issues" name="Issues" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="returns" name="Returns" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Financial Health Chart */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-green-400" />
                                    Financial Health (Fines)
                                </h3>
                                <div className="h-64 flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={analytics.financialData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                <Cell key="cell-0" fill="#10b981" />
                                                <Cell key="cell-1" fill="#ef4444" />
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-purple-500/20 p-3 rounded-lg">
                                        <BookOpen className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-1">Book Management</h3>
                                        <p className="text-sm text-slate-400 mb-4">Add, remove, and organize library collection</p>
                                        <Button
                                            onClick={() => setActiveTab('books')}
                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                            Manage Books
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 rounded-xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-500/20 p-3 rounded-lg">
                                        <Users className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-1">Student Management</h3>
                                        <p className="text-sm text-slate-400 mb-4">Register and manage student accounts</p>
                                        <Button
                                            onClick={() => setActiveTab('students')}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            Manage Students
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'books' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Book Inventory</h1>
                                <p className="text-slate-400">Manage library collection and stock</p>
                            </div>
                            <Button onClick={() => downloadReport('books')} variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 gap-2">
                                <FileDown className="h-4 w-4" /> Export Catalog
                            </Button>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl border border-slate-700 sticky top-24">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Plus className="h-5 w-5 text-purple-400" />
                                        <h3 className="text-xl font-bold text-white">Add New Book</h3>
                                    </div>
                                    <form onSubmit={handleAddBook} className="space-y-4">
                                        <Input
                                            placeholder="Book Title"
                                            value={newBook.title}
                                            onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                                            className="bg-slate-900 border-slate-600 text-white"
                                            required
                                        />
                                        <Input
                                            placeholder="Author Name"
                                            value={newBook.author}
                                            onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                                            className="bg-slate-900 border-slate-600 text-white"
                                            required
                                        />
                                        <Input
                                            placeholder="ISBN (Optional)"
                                            value={newBook.isbn}
                                            onChange={e => setNewBook({ ...newBook, isbn: e.target.value })}
                                            className="bg-slate-900 border-slate-600 text-white"
                                        />
                                        <Input
                                            placeholder="Category"
                                            value={newBook.category}
                                            onChange={e => setNewBook({ ...newBook, category: e.target.value })}
                                            className="bg-slate-900 border-slate-600 text-white"
                                            required
                                        />
                                        <Input
                                            placeholder="Section (e.g., Fiction, Science, Engineering)"
                                            value={newBook.section}
                                            onChange={e => setNewBook({ ...newBook, section: e.target.value })}
                                            className="bg-slate-900 border-slate-600 text-white"
                                        />
                                        <Input
                                            placeholder="Edition (e.g., 1st Edition, 2nd Edition)"
                                            value={newBook.edition}
                                            onChange={e => setNewBook({ ...newBook, edition: e.target.value })}
                                            className="bg-slate-900 border-slate-600 text-white"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Number of Copies"
                                            value={newBook.totalCopies}
                                            onChange={e => setNewBook({ ...newBook, totalCopies: e.target.value })}
                                            className="bg-slate-900 border-slate-600 text-white"
                                            required
                                            min="1"
                                        />
                                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Book
                                        </Button>
                                    </form>
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white">Book Inventory ({books.length})</h3>
                                </div>
                                <div className="space-y-3">
                                    {books.map(b => (
                                        <div key={b._id} className="bg-slate-800/80 backdrop-blur-sm p-5 rounded-lg flex justify-between items-center border border-slate-700 hover:border-slate-600 transition-all group">
                                            <div className="flex-1">
                                                <p className="font-bold text-white text-lg mb-1">{b.title}</p>
                                                <p className="text-sm text-slate-400">{b.author}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                                                        {b.category}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {b.availableCopies}/{b.totalCopies} available
                                                    </span>
                                                    {b.isbn && (
                                                        <span className="text-xs text-slate-500 font-mono">
                                                            ISBN: {b.isbn}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-red-400 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteBook(b._id)}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))}
                                    {books.length === 0 && (
                                        <div className="text-center py-12 text-slate-500">
                                            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                            <p>No books in the library yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Student Directory</h1>
                                <p className="text-slate-400">Manage registered students and their access</p>
                            </div>
                            <Button onClick={() => downloadReport('students')} variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 gap-2">
                                <FileDown className="h-4 w-4" /> Export Students
                            </Button>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl border border-slate-700 sticky top-24">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Plus className="h-5 w-5 text-purple-400" />
                                        <h3 className="text-xl font-bold text-white">Register Student</h3>
                                    </div>
                                    <form onSubmit={handleAddStudent} className="space-y-4">
                                        <Input
                                            placeholder="Full Name"
                                            value={newStudent.name}
                                            onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                                            className="bg-slate-900 border-slate-600 text-white"
                                            required
                                        />
                                        <Input
                                            placeholder="Registration Number"
                                            value={newStudent.regno}
                                            onChange={e => setNewStudent({ ...newStudent, regno: e.target.value })}
                                            className="bg-slate-900 border-slate-600 text-white"
                                            required
                                        />
                                        <Input
                                            type="email"
                                            placeholder="Email Address"
                                            value={newStudent.email}
                                            onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                                            className="bg-slate-900 border-slate-600 text-white"
                                        />
                                        <Input
                                            type="password"
                                            placeholder="Password"
                                            value={newStudent.password}
                                            onChange={e => setNewStudent({ ...newStudent, password: e.target.value })}
                                            className="bg-slate-900 border-slate-600 text-white"
                                            required
                                        />
                                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Register Student
                                        </Button>
                                    </form>
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white">Student Directory ({students.length})</h3>
                                </div>
                                <div className="space-y-3">
                                    {students.map(s => (
                                        <div key={s._id} className="bg-slate-800/80 backdrop-blur-sm p-5 rounded-lg flex justify-between items-center border border-slate-700 hover:border-slate-600 transition-all group">
                                            <div className="flex-1">
                                                <p className="font-bold text-white text-lg mb-1">{s.name}</p>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-mono">
                                                        {s.regno}
                                                    </span>
                                                    {s.email && (
                                                        <span className="text-sm text-slate-400">{s.email}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-blue-400 hover:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => setEditingStudent(s)}
                                                >
                                                    <Settings className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-red-400 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDeleteStudent(s.regno)}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {students.length === 0 && (
                                        <div className="text-center py-12 text-slate-500">
                                            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                            <p>No students registered yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {editingStudent && (
                    <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl border border-blue-500/30">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-blue-400" />
                                <h3 className="text-xl font-bold text-white">Edit Student: {editingStudent.name}</h3>
                            </div>
                            <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setEditingStudent(null)}>Cancel</Button>
                        </div>
                        <form onSubmit={handleUpdateStudent} className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Full Name</label>
                                <Input
                                    value={editingStudent.name}
                                    onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })}
                                    className="bg-slate-900 border-slate-600 text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Registration Number</label>
                                <Input
                                    value={editingStudent.regno}
                                    onChange={e => setEditingStudent({ ...editingStudent, newRegno: e.target.value })}
                                    className="bg-slate-900 border-slate-600 text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Email Address</label>
                                <Input
                                    type="email"
                                    value={editingStudent.email}
                                    onChange={e => setEditingStudent({ ...editingStudent, email: e.target.value })}
                                    className="bg-slate-900 border-slate-600 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Password</label>
                                <Input
                                    type="text"
                                    value={editingStudent.password}
                                    onChange={e => setEditingStudent({ ...editingStudent, password: e.target.value })}
                                    className="bg-slate-900 border-slate-600 text-white"
                                />
                            </div>
                            <div className="sm:col-span-2 pt-4">
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                    Update Student Details
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
