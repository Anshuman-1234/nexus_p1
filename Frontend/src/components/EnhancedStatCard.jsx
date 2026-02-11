import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const EnhancedStatCard = ({
    title,
    value,
    icon: Icon,
    color = "blue",
    subtext,
    trend,
    trendValue,
    animateValue = false
}) => {
    const colorClasses = {
        blue: {
            iconBg: 'bg-blue-500/20',
            iconText: 'text-blue-400',
            gradient: 'from-blue-500/5 to-transparent',
            border: 'border-blue-500/20',
        },
        green: {
            iconBg: 'bg-green-500/20',
            iconText: 'text-green-400',
            gradient: 'from-green-500/5 to-transparent',
            border: 'border-green-500/20',
        },
        red: {
            iconBg: 'bg-red-500/20',
            iconText: 'text-red-400',
            gradient: 'from-red-500/5 to-transparent',
            border: 'border-red-500/20',
        },
        amber: {
            iconBg: 'bg-amber-500/20',
            iconText: 'text-amber-400',
            gradient: 'from-amber-500/5 to-transparent',
            border: 'border-amber-500/20',
        },
        purple: {
            iconBg: 'bg-purple-500/20',
            iconText: 'text-purple-400',
            gradient: 'from-purple-500/5 to-transparent',
            border: 'border-purple-500/20',
        },
        cyan: {
            iconBg: 'bg-cyan-500/20',
            iconText: 'text-cyan-400',
            gradient: 'from-cyan-500/5 to-transparent',
            border: 'border-cyan-500/20',
        }
    };

    const colors = colorClasses[color] || colorClasses.blue;

    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-400" />;
        if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-400" />;
        return <Minus className="h-4 w-4 text-slate-400" />;
    };

    return (
        <div className={`relative bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border ${colors.border} overflow-hidden group hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-${color}-500/10`}>
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />

            {/* Content */}
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <p className="text-slate-400 text-sm font-medium mb-1 tracking-wide">{title}</p>
                        <h3 className={`text-3xl font-bold text-white mb-1 ${animateValue ? 'transition-all duration-500' : ''}`}>
                            {value}
                        </h3>
                        {subtext && (
                            <p className="text-xs text-slate-500 mt-1">{subtext}</p>
                        )}
                    </div>
                    <div className={`p-3 rounded-lg ${colors.iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                        <Icon className={`h-6 w-6 ${colors.iconText}`} />
                    </div>
                </div>

                {/* Trend indicator */}
                {trend && (
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
                        {getTrendIcon()}
                        <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-400' :
                                trend === 'down' ? 'text-red-400' :
                                    'text-slate-400'
                            }`}>
                            {trendValue}
                        </span>
                    </div>
                )}
            </div>

            {/* Hover shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
        </div>
    );
};

export default EnhancedStatCard;
