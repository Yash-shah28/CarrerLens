import React from 'react';
import Skeleton from '../components/ui/Skeleton';

const AuthSkeleton = () => {
    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-xl">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/50 mb-4 border border-slate-700/50">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                    </div>
                    <Skeleton className="h-9 w-48 mx-auto mb-2" />
                    <Skeleton className="h-4 w-64 mx-auto" />
                </div>

                <div className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>

                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-32" />
                    </div>

                    <Skeleton className="h-14 w-full rounded-xl" />

                    <div className="text-center pt-2">
                        <Skeleton className="h-4 w-48 mx-auto" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthSkeleton;
