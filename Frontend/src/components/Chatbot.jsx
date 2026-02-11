import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setLoading(true);
        const userMsg = { sender: 'user', text: newMessage };

        setMessages((prev) => [...prev, userMsg]);
        setNewMessage('');

        setTimeout(() => {
            const botResponseText = "Backend is not integrated in this yet. Anshuman will connect with you shortly.";
            const botMsg = { sender: 'bot', text: botResponseText };
            setMessages((prev) => [...prev, botMsg]);
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 h-[500px] bg-[#0f2442]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up transition-all duration-300">

                    <div className="bg-gradient-to-r from-[#16325C] to-[#2c5282] p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-full">
                                <Bot className="text-[#F39C12] h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Library Assistant</h3>
                                <p className="text-blue-200 text-xs flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/70 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="text-center text-slate-400 text-sm mt-8">
                                <p>Start a conversation...</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.sender === 'user'
                                            ? 'bg-[#F39C12] text-white rounded-tr-none'
                                            : 'bg-slate-700/80 text-white rounded-tl-none border border-white/5'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))
                        )}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-700/80 rounded-2xl p-3 rounded-tl-none border border-white/5">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-[#0a1a30]/50">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-slate-800/80 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#F39C12] transition-colors placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || loading}
                                className="bg-[#F39C12] hover:bg-[#e67e22] text-white p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative bg-[#F39C12] hover:bg-[#e67e22] text-white p-4 rounded-full shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-110 active:scale-95"
            >
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0f2442]"></span>
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </button>
        </div>
    );
};

export default Chatbot;
