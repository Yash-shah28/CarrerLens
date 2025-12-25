import React from 'react';

const Dashboard = () => {
    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Dashboard
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 group">
                            <div className="h-12 w-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                                <div className="h-6 w-6 border-2 border-blue-600 group-hover:border-white rounded-md"></div>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Feature {i}</h3>
                            <p className="text-slate-400 text-sm">Enhanced career guidance and analytics for your journey.</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
