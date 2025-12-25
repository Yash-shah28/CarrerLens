import React from 'react';
import Skeleton from '../components/ui/Skeleton';

const DashboardSkeleton = () => {
    return (
        <div className="min-h-screen bg-slate-900 pb-20">
            {/* Hero Skeleton */}
            <div className="pt-16 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mb-12">
                        <Skeleton className="h-16 md:h-24 w-3/4 mb-4 rounded-2xl" />
                        <Skeleton className="h-16 md:h-24 w-1/2 mb-8 rounded-2xl" />
                        <Skeleton className="h-6 w-full max-w-xl mb-3" />
                        <Skeleton className="h-6 w-2/3 max-w-xl" />
                    </div>

                    {/* Stats Grid Skeleton */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl">
                                <Skeleton className="w-10 h-10 rounded-xl mb-4" />
                                <Skeleton className="h-4 w-20 mb-2" />
                                <Skeleton className="h-8 w-24" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Section Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-3xl">
                            <Skeleton className="w-14 h-14 rounded-2xl mb-8" />
                            <Skeleton className="h-8 w-3/4 mb-4 rounded-lg" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-2/3 mb-6" />
                            <Skeleton className="h-5 w-24 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
