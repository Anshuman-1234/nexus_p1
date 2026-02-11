import React from 'react';

/**
 * ProgressRing Component
 * Circular progress indicator with percentage display
 * 
 * @param {number} percentage - Progress percentage (0-100)
 * @param {number} size - Size of the ring in pixels (default: 120)
 * @param {number} strokeWidth - Width of the ring stroke (default: 8)
 * @param {string} color - Color of the progress ring (default: '#3b82f6')
 * @param {string} backgroundColor - Color of the background ring (default: '#1e293b')
 * @param {string} label - Optional label to display below percentage
 * @param {boolean} showPercentage - Show/hide percentage text (default: true)
 */
const ProgressRing = ({
    percentage = 0,
    size = 120,
    strokeWidth = 8,
    color = '#3b82f6',
    backgroundColor = '#1e293b',
    label = '',
    showPercentage = true
}) => {
    // Ensure percentage is within 0-100
    const normalizedPercentage = Math.min(100, Math.max(0, percentage));

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (normalizedPercentage / 100) * circumference;

    return (
        <div className="inline-flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    className="transform -rotate-90"
                >
                    {/* Background ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={backgroundColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        style={{
                            filter: `drop-shadow(0 0 6px ${color}40)`
                        }}
                    />
                </svg>

                {/* Center text */}
                {showPercentage && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                            {Math.round(normalizedPercentage)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Label */}
            {label && (
                <span className="text-sm text-slate-400 text-center max-w-[120px]">
                    {label}
                </span>
            )}
        </div>
    );
};

export default ProgressRing;
