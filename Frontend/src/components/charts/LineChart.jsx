import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * LineChart Component
 * Displays trend data over time with smooth curves and gradients
 * 
 * @param {Array} data - Array of data points with structure: [{name: string, value: number}, ...]
 * @param {string} dataKey - Key to use for Y-axis values
 * @param {string} xAxisKey - Key to use for X-axis labels (default: 'name')
 * @param {string} lineColor - Color of the line (default: '#3b82f6')
 * @param {string} title - Optional chart title
 * @param {boolean} showGrid - Show/hide grid lines (default: true)
 * @param {boolean} showLegend - Show/hide legend (default: false)
 */
const LineChart = ({
    data = [],
    dataKey = 'value',
    xAxisKey = 'name',
    lineColor = '#3b82f6',
    title,
    showGrid = true,
    showLegend = false,
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
                <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    />
                    {showLegend && <Legend />}
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={lineColor}
                        strokeWidth={2}
                        dot={{ fill: lineColor, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LineChart;
