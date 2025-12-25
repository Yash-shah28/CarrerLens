import React from 'react';

const Skeleton = ({ className }) => {
    return (
        <div className={`bg-slate-800 animate-pulse rounded ${className}`}></div>
    );
};

export default Skeleton;
