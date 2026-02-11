import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * DonutChart Component
 * Displays category distribution with a donut (hollow pie) chart
 * 
 * @param {Array} data - Array of data points with structure: [{name: string, value: number}, ...]
 * @param {Array} colors - Array of colors for each segment
 * @param {string} title - Optional chart title
 * @param {boolean} showLegend - Show/hide legend (default: true)
 * @param {string} centerText - Optional text to display in center
 * @param {string} centerValue - Optional value to display in center
 * @param {number} height - Chart height in pixels (default: 300)
 */
const DonutChart = ({
    data = [],
    colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'],
    title,
    showLegend = true,
    centerText = '',
    centerValue = '',
    height = 300
}) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                <p>No data available</p>
            </div>
        );
    }

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        if (percent < 0.05) return null; // Don't show label if segment is too small

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                style={{ fontSize: '12px', fontWeight: '600' }}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="w-full">
            {title && (
                <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            )}
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        labelStyle={{ color: '#94a3b8' }}
                    />
                    {showLegend && (
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
                        />
                    )}
                </PieChart>
            </ResponsiveContainer>

            {/* Center text overlay */}
            {(centerText || centerValue) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center" style={{ marginTop: title ? '20px' : '0' }}>
                        {centerValue && (
                            <div className="text-2xl font-bold text-white">{centerValue}</div>
                        )}
                        {centerText && (
                            <div className="text-sm text-slate-400">{centerText}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonutChart;
