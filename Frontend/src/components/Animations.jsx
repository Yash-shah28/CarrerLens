import React, { useState, useEffect } from 'react';

// Use standard imports to avoid the 'displayName' of null error 
// and ensure React's Reconciliation process works correctly.
import { motion } from 'framer-motion';

export const FadeIn = ({ children, delay = 0, direction = 'up' }) => {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
                x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
            }}
            whileInView={{
                opacity: 1,
                y: 0,
                x: 0,
            }}
            viewport={{ once: true }}
            transition={{
                duration: 0.8,
                delay: delay,
                ease: [0.21, 0.47, 0.32, 0.98],
            }}
        >
            {children}
        </motion.div>
    );
};

export const ScaleIn = ({ children, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
                duration: 0.6,
                delay: delay,
                ease: 'easeOut',
            }}
        >
            {children}
        </motion.div>
    );
};

export const Floating = ({ children }) => {
    return (
        <motion.div
            animate={{
                y: [0, -10, 0],
            }}
            transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            {children}
        </motion.div>
    );
};
