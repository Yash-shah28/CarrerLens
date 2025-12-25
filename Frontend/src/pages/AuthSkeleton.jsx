import React from 'react';
import Skeleton from '../components/ui/Skeleton';

const AuthSkeleton = () => {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
            <div className="max-w-md w-full relative">
                <div className="bg-slate-800/50 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-700/50 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-700/50 mb-6 mx-auto">
                            <Skeleton className="w-10 h-10 rounded-lg" />
                        </div>
                        <Skeleton className="h-10 w-48 mx-auto mb-2 rounded-lg" />
                        <Skeleton className="h-5 w-64 mx-auto rounded-lg" />
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Skeleton className="h-14 w-full rounded-2xl" />
                            <Skeleton className="h-14 w-full rounded-2xl" />
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <Skeleton className="h-4 w-28 rounded" />
                            <Skeleton className="h-4 w-28 rounded" />
                        </div>

                        <Skeleton className="h-14 w-full rounded-2xl shadow-xl" />

                        <div className="text-center pt-2">
                            <Skeleton className="h-5 w-48 mx-auto rounded" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthSkeleton;
