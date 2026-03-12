/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { FileText, Upload, PenTool, ArrowRight } from 'lucide-react';
import { FadeIn, ScaleIn } from '../components/Animations';

const ResumeSelection = () => {
    const navigate = useNavigate();
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const options = [
        {
            id: 'build',
            title: 'Build Resume',
            description: 'Start from scratch with our intelligent builder. Perfect for creating a fresh, optimized profile.',
            icon: PenTool,
            color: 'blue',
            action: () => navigate('/job-description'),
            features: ['Step-by-step guidance', 'Real-time ATS Score', 'Smart Suggestions']
        },
        {
            id: 'upload',
            title: 'Upload Resume',
            description: 'Upload your existing resume to analyze, format, and enhance it with our AI tools.',
            icon: Upload,
            color: 'purple',
            // CHANGE: Navigate directly to upload page first
            action: () => navigate('/resume-upload'),
            features: ['PDF/DOCX Import', 'Instant Analysis', 'Auto-Formatting']
        }
    ];

    return (
        <div
            className="min-h-screen bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-12"
            onMouseMove={handleMouseMove}
        >
            {/* Background Spoolight */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover/main:opacity-100 z-0"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            800px circle at ${mouseX}px ${mouseY}px,
                            rgba(59, 130, 246, 0.1),
                            transparent 80%
                        )
                    `,
                }}
            />

            <div className="relative z-10 max-w-5xl w-full mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <FadeIn>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                            Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Perfect Resume</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            Select how you want to begin. Whether you're starting fresh or updating an existing CV, we've got you covered.
                        </p>
                    </FadeIn>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {options.map((option, idx) => (
                        <ScaleIn key={option.id} delay={idx * 0.1}>
                            <motion.div
                                onClick={option.action}
                                whileHover={{ y: -8, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`group relative h-full bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-${option.color}-500/50 rounded-3xl p-8 md:p-10 cursor-pointer transition-all duration-300 shadow-xl overflow-hidden`}
                            >
                                <div className={`absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-${option.color}-400`}>
                                    <ArrowRight className="w-8 h-8 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                </div>

                                {/* Icon Glow Background */}
                                <div className={`absolute -right-10 -bottom-10 w-40 h-40 bg-${option.color}-500/20 blur-3xl rounded-full group-hover:bg-${option.color}-500/30 transition-colors duration-500`} />

                                <div className={`w-16 h-16 bg-${option.color}-500/10 rounded-2xl flex items-center justify-center mb-6 border border-${option.color}-500/20 group-hover:scale-110 transition-transform duration-300`}>
                                    <option.icon className={`w-8 h-8 text-${option.color}-400`} />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-${option.color}-300 transition-colors">
                                    {option.title}
                                </h3>
                                <p className="text-slate-400 leading-relaxed mb-8">
                                    {option.description}
                                </p>

                                <ul className="space-y-3">
                                    {option.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                                            <div className={`w-1.5 h-1.5 rounded-full bg-${option.color}-400`} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className={`mt-8 w-full py-4 rounded-xl bg-slate-800 border border-slate-700 text-center font-bold text-slate-300 group-hover:bg-${option.color}-600 group-hover:text-white group-hover:border-transparent transition-all duration-300`}>
                                    Select Process
                                </div>
                            </motion.div>
                        </ScaleIn>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResumeSelection;
