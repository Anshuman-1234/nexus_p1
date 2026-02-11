import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import EnhancedStatCard from '../components/EnhancedStatCard';
import {
    LayoutDashboard, Plus, Trash2, LogOut, BookOpen, Users, Database, Activity
} from 'lucide-react';
import soaLogo from '../assets/soa_logo.png';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [books, setBooks] = useState([]);
    const [students, setStudents] = useState([]);

    // Forms state
    const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', category: '', section: '', edition: '', totalCopies: 1 });
    const [newStudent, setNewStudent] = useState({ name: '', regno: '', email: '', password: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [bRes, sRes] = await Promise.all([
                api.get('/api/books'),
                api.get('/api/all-students')
            ]);
            setBooks(bRes.data);
            setStudents(sRes.data);
        } catch (err) {
            console.error(err);
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

    // Calculate stats
    const totalBooksCount = books.reduce((sum, book) => sum + book.totalCopies, 0);
    const availableBooksCount = books.reduce((sum, book) => sum + book.availableCopies, 0);

    return (
        <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans">
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <img src={soaLogo} alt="SOA Logo" className="h-12 w-auto drop-shadow-md" />
                    <span className="text-xl font-bold text-white tracking-tight">SOA LIBRARY</span>
                </div>
                <div className="px-6 pb-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">Admin Console</div>
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20 shadow-lg shadow-purple-500/5' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <LayoutDashboard className="h-5 w-5" /> Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('books')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'books' ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20 shadow-lg shadow-purple-500/5' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <BookOpen className="h-5 w-5" /> Manage Books
                    </button>
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'students' ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20 shadow-lg shadow-purple-500/5' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Users className="h-5 w-5" /> Manage Students
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button onClick={logout} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full px-4 py-2">
                        <LogOut className="h-5 w-5" /> Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-white">Admin Console</h2>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {activeTab === 'dashboard' && (
                            <>
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">System Overview</h1>
                                    <p className="text-slate-400">Monitor and manage library system</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            </>
                        )}

                        {activeTab === 'books' && (
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
                        )}

                        {activeTab === 'students' && (
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
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-red-400 hover: bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDeleteStudent(s.regno)}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
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
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
