import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-[9999]">
            <div className="relative">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>

                {/* Spinner */}
                <div className="w-16 h-16 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin"></div>

                {/* Center dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
