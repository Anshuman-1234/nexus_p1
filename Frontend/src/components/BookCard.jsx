import React from 'react';
import { BookOpen, Calendar, Clock } from 'lucide-react';

const BookCard = ({
    book,
    variant = 'library', // 'library' or 'issued'
    showActions = false,
    onAction
}) => {
    const isIssued = variant === 'issued';
    const isOverdue = isIssued && book.fine > 0;
    const dueDate = isIssued ? new Date(book.dueDate) : null;
    const daysRemaining = isIssued && dueDate
        ? Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div className={`group relative bg-slate-800/80 backdrop-blur-sm rounded-xl border transition-all duration-300 hover:scale-[1.02] ${isOverdue
            ? 'border-red-500/30 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10'
            : 'border-slate-700 hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/10'
            } overflow-hidden`}>
            {/* Book Cover */}
            <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center overflow-hidden">
                {book.coverImage ? (
                    <img
                        src={book.coverImage}
                        alt={book.title || book.bookTitle}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <BookOpen className="h-16 w-16 text-slate-600 group-hover:text-slate-500 transition-colors" />
                )}

                {/* Availability badge for library variant */}
                {!isIssued && book.availableCopies !== undefined && (
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${book.availableCopies > 0
                        ? 'bg-green-500/80 text-white'
                        : 'bg-red-500/80 text-white'
                        }`}>
                        {book.availableCopies > 0 ? `${book.availableCopies} Available` : 'Unavailable'}
                    </div>
                )}

                {/* Status badge for issued variant */}
                {isIssued && (
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${isOverdue
                        ? 'bg-red-500/80 text-white'
                        : daysRemaining <= 3
                            ? 'bg-amber-500/80 text-white'
                            : 'bg-blue-500/80 text-white'
                        }`}>
                        {book.status || 'Issued'}
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Book Info */}
            <div className="p-4 space-y-3">
                <div>
                    <h4 className="font-bold text-white text-base line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">
                        {book.title || book.bookTitle}
                    </h4>
                    {book.author && (
                        <p className="text-sm text-slate-400 truncate">{book.author}</p>
                    )}
                </div>

                {/* Due date for issued books */}
                {isIssued && dueDate && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                            <Calendar className="h-3.5 w-3.5 text-slate-500" />
                            <span className="text-slate-400">
                                Due: <span className={isOverdue ? 'text-red-400 font-semibold' : 'text-slate-300'}>
                                    {dueDate.toLocaleDateString()}
                                </span>
                            </span>
                        </div>

                        {!isOverdue && daysRemaining <= 7 && (
                            <div className="flex items-center gap-2 text-xs">
                                <Clock className="h-3.5 w-3.5 text-amber-500" />
                                <span className="text-amber-400">
                                    {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                                </span>
                            </div>
                        )}

                        {book.fine > 0 && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                <p className="text-red-400 text-sm font-bold">Fine: ₹{book.fine}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Category, Section, and Edition for library books */}
                {!isIssued && (
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            {book.category && (
                                <span className="bg-slate-700/50 px-2.5 py-1 rounded text-slate-300 text-xs font-medium">
                                    {book.category}
                                </span>
                            )}
                            {book.section && (
                                <span className="bg-blue-500/20 border border-blue-500/30 px-2.5 py-1 rounded text-blue-300 text-xs font-medium">
                                    📚 {book.section}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            {book.edition && (
                                <span className="text-slate-400">
                                    <span className="text-slate-500">Edition:</span> <span className="text-slate-300 font-medium">{book.edition}</span>
                                </span>
                            )}
                            {book.isbn && (
                                <span className="text-slate-500 font-mono">
                                    {book.isbn}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Hover border effect */}
            <div className="absolute inset-0 rounded-xl border-2 border-blue-500/0 group-hover:border-blue-500/20 transition-colors duration-300 pointer-events-none" />
        </div>
    );
};

export default BookCard;
