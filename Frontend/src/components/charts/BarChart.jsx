import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

/**
 * BarChart Component
 * Displays categorical data with vertical or horizontal bars
 * 
 * @param {Array} data - Array of data points with structure: [{name: string, value: number}, ...]
 * @param {string} dataKey - Key to use for bar values
 * @param {string} xAxisKey - Key to use for X-axis labels (default: 'name')
 * @param {string} barColor - Color of the bars (default: '#8b5cf6')
 * @param {Array} colors - Array of colors for each bar (optional, overrides barColor)
 * @param {string} title - Optional chart title
 * @param {boolean} showGrid - Show/hide grid lines (default: true)
 * @param {number} height - Chart height in pixels (default: 300)
 */
const BarChart = ({
    data = [],
    dataKey = 'value',
    xAxisKey = 'name',
    barColor = '#8b5cf6',
    colors = [],
    title,
    showGrid = true,
    height = 300
}) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                <p>No data available</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {title && (
                <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            )}
            <ResponsiveContainer width="100%" height={height}>
                <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    {showGrid && (
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    )}
                    <XAxis
                        dataKey={xAxisKey}
                        stroke="#94a3b8"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        labelStyle={{ color: '#94a3b8' }}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    />
                    <Bar dataKey={dataKey} radius={[8, 8, 0, 0]}>
                        {colors.length > 0 ? (
                            data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))
                        ) : (
                            <Cell fill={barColor} />
                        )}
                    </Bar>
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChart;
