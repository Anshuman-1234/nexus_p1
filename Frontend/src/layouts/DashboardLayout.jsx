import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { User, Menu } from 'lucide-react';

const DashboardLayout = ({
    children,
    tabs,
    activeTab,
    setActiveTab,
    logout,
    user,
    title,
    colorScheme = 'blue',
    headerTitle = 'Dashboard'
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100 font-sans overflow-hidden">
            <Sidebar
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                logout={logout}
                title={title}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                colorScheme={colorScheme}
            />

            <main className="flex-1 flex flex-col overflow-hidden min-h-0">
                <header className="h-14 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 text-slate-400 hover:text-white"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h2 className="text-base font-semibold text-white">{headerTitle}</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">{user?.name}</p>
                            <p className="text-xs text-slate-400">{user?.regno || user?.role}</p>
                        </div>
                        <div className="h-8 w-8 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600">
                            <User className="h-4 w-4 text-slate-300" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
