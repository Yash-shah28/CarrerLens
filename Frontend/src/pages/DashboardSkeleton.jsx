import React from 'react';
import Skeleton from '../components/ui/Skeleton';

const DashboardSkeleton = () => {
    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                {/* Title Skeleton */}
                <Skeleton className="h-12 w-64 mb-6" />

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-6 rounded-2xl border border-slate-700 bg-slate-900/50">
                            <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                            <Skeleton className="h-7 w-32 mb-2" />
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
