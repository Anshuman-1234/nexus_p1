import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, X, Menu } from 'lucide-react';
import soaLogo from '../assets/soa_logo.png';

const Sidebar = ({ tabs, activeTab, setActiveTab, logout, title, isOpen, setIsOpen, colorScheme = 'blue' }) => {
    const getColorClasses = (isActive) => {
        const schemes = {
            blue: isActive ? 'bg-blue-600/10 text-blue-400 border-blue-600/20 shadow-blue-500/5' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
            purple: isActive ? 'bg-purple-600/10 text-purple-400 border-purple-600/20 shadow-purple-500/5' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
            amber: isActive ? 'bg-amber-600/10 text-amber-400 border-amber-600/20 shadow-amber-500/5' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
        };
        return schemes[colorScheme] || schemes.blue;
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={soaLogo} alt="SOA Logo" className="h-10 w-auto drop-shadow-md" />
                            <span className="text-lg font-bold text-white tracking-tight">SOA LIBRARY</span>
                        </div>
                        <button
                            className="md:hidden p-2 text-slate-400 hover:text-white"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="px-4 pb-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-2">
                        {title}
                    </div>

                    <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto scrollbar-none">
                        {tabs.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    if (window.innerWidth < 768) setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent ${getColorClasses(activeTab === item.id)}`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="p-3 border-t border-slate-800">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full px-4 py-3 text-sm rounded-lg hover:bg-red-500/5"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
