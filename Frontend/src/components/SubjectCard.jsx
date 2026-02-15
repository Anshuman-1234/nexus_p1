import React from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';

const SubjectCard = ({ title, code, description, link, icon: Icon = BookOpen, color = "blue" }) => {
    const colorClasses = {
        blue: {
            bg: 'from-blue-500/10 to-blue-600/5',
            border: 'border-blue-500/20 hover:border-blue-500/40',
            text: 'text-blue-400',
            iconBg: 'bg-blue-500/20',
        },
        purple: {
            bg: 'from-purple-500/10 to-purple-600/5',
            border: 'border-purple-500/20 hover:border-purple-500/40',
            text: 'text-purple-400',
            iconBg: 'bg-purple-500/20',
        },
        green: {
            bg: 'from-green-500/10 to-green-600/5',
            border: 'border-green-500/20 hover:border-green-500/40',
            text: 'text-green-400',
            iconBg: 'bg-green-500/20',
        },
        amber: {
            bg: 'from-amber-500/10 to-amber-600/5',
            border: 'border-amber-500/20 hover:border-amber-500/40',
            text: 'text-amber-400',
            iconBg: 'bg-amber-500/20',
        },
        cyan: {
            bg: 'from-cyan-500/10 to-cyan-600/5',
            border: 'border-cyan-500/20 hover:border-cyan-500/40',
            text: 'text-cyan-400',
            iconBg: 'bg-cyan-500/20',
        },
        pink: {
            bg: 'from-pink-500/10 to-pink-600/5',
            border: 'border-pink-500/20 hover:border-pink-500/40',
            text: 'text-pink-400',
            iconBg: 'bg-pink-500/20',
        },
        emerald: {
            bg: 'from-emerald-500/10 to-emerald-600/5',
            border: 'border-emerald-500/20 hover:border-emerald-500/40',
            text: 'text-emerald-400',
            iconBg: 'bg-emerald-500/20',
        }
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative bg-gradient-to-br ${colors.bg} backdrop-blur-sm border ${colors.border} rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-${color}-500/10 flex flex-col h-full`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${colors.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <ExternalLink className={`h-4 w-4 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-opacity-90 transition-colors">
                        {title}
                    </h3>
                </div>
                {code && (
                    <span className={`inline-block text-xs font-mono ${colors.text} bg-slate-800/50 px-2 py-1 rounded mb-3`}>
                        {code}
                    </span>
                )}
                <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                    {description}
                </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/50">
                <span className={`text-xs font-medium ${colors.text} flex items-center gap-1 group-hover:gap-2 transition-all`}>
                    Access Resources
                    <ExternalLink className="h-3 w-3" />
                </span>
            </div>

            {/* Hover gradient effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -z-10`} />
        </a>
    );
};

export default SubjectCard;
