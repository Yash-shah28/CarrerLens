import React from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Upload,
    Map,
    Mic,
    ArrowRight,
    Sparkles,
} from 'lucide-react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { FadeIn, ScaleIn } from '../components/Animations';
import Magnetic from '../components/Magnetic';

const Dashboard = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const actions = [
        {
            title: 'Build Resume',
            description: 'Create a tailored, ATS-optimized resume from scratch using our AI-powered builder.',
            icon: FileText,
            color: 'blue',
            gradient: 'from-blue-500 to-cyan-400',
            route: '/job-description',
            cta: 'Start Building',
        },
        {
            title: 'Upload & Enhance',
            description: 'Upload your existing resume, parse it instantly, and improve it with AI suggestions.',
            icon: Upload,
            color: 'purple',
            gradient: 'from-purple-500 to-indigo-500',
            route: '/resume-upload',
            cta: 'Upload Resume',
        },
        {
            title: 'Learning Roadmap',
            description: 'Generate a personalized, step-by-step roadmap for any skill — with books and YouTube resources.',
            icon: Map,
            color: 'emerald',
            gradient: 'from-emerald-500 to-teal-400',
            route: '/roadmap',
            cta: 'Generate Roadmap',
        },
        {
            title: 'AI Mock Interview',
            description: 'Practice with James — your AI interviewer — who asks real, resume-tailored questions via voice.',
            icon: Mic,
            color: 'rose',
            gradient: 'from-rose-500 to-pink-500',
            route: '/mock-interview',
            cta: 'Start Interview',
        },
    ];

    return (
        <div
            className="min-h-screen bg-slate-900 pb-20 group/main relative"
            onMouseMove={handleMouseMove}
        >
            {/* Background spotlight */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover/main:opacity-100 z-0"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            650px circle at ${mouseX}px ${mouseY}px,
                            rgba(59, 130, 246, 0.12),
                            transparent 80%
                        )
                    `,
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Hero */}
                <div className="pt-20 pb-16">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-semibold mb-6">
                            <Sparkles className="w-4 h-4" />
                            AI-Powered Career Platform
                        </div>
                        <motion.h1
                            className="text-5xl md:text-7xl font-extrabold text-white mb-5 tracking-tight leading-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            Welcome back,{' '}
                            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                {user?.fullName?.split(' ')[0] || 'Explorer'}
                            </span>
                        </motion.h1>
                        <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
                            Everything you need to land your next role — build your resume, sharpen your skills, and practice interviews with AI.
                        </p>
                    </FadeIn>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {actions.map((action, idx) => (
                        <ScaleIn key={action.route} delay={idx * 0.1}>
                            <motion.div
                                onClick={() => navigate(action.route)}
                                whileHover={{ y: -6, scale: 1.015 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/70 rounded-3xl p-8 cursor-pointer transition-all duration-300 overflow-hidden h-full flex flex-col"
                            >
                                {/* Glow */}
                                <div className={`absolute -right-8 -bottom-8 w-40 h-40 bg-${action.color}-500/15 blur-3xl rounded-full group-hover:bg-${action.color}-500/25 transition-colors duration-500`} />

                                {/* Icon */}
                                <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} p-3.5 rounded-2xl mb-6 shadow-lg group-hover:rotate-6 transition-transform duration-400`}>
                                    <action.icon className="w-full h-full text-white" />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-3">{action.title}</h3>
                                <p className="text-slate-400 leading-relaxed flex-1">{action.description}</p>

                                <div className={`mt-6 flex items-center gap-2 text-sm font-bold text-${action.color}-400 group-hover:text-${action.color}-300 transition-colors`}>
                                    {action.cta}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </motion.div>
                        </ScaleIn>
                    ))}
                </div>

                {/* Quick Start CTA */}
                <FadeIn delay={0.5}>
                    <div className="mt-10 group/cta relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover/cta:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                Where do you want to start?
                            </h2>
                            <p className="text-slate-300">
                                Select a card above or jump straight into the resume builder.
                            </p>
                        </div>
                        <div className="relative z-10 flex gap-3 flex-wrap">
                            <Magnetic>
                                <button
                                    onClick={() => navigate('/resume-selection')}
                                    className="bg-white text-blue-700 px-7 py-3.5 rounded-2xl font-bold text-base hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 whitespace-nowrap"
                                >
                                    Build My Resume
                                </button>
                            </Magnetic>
                            <Magnetic>
                                <button
                                    onClick={() => navigate('/mock-interview')}
                                    className="bg-slate-800 hover:bg-slate-700 text-white px-7 py-3.5 rounded-2xl font-bold text-base border border-slate-700 transition-all whitespace-nowrap"
                                >
                                    Practice Interview
                                </button>
                            </Magnetic>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
};

export default Dashboard;
