import React from 'react';
import { useUser } from '../context/UserContext';
import {
    LayoutDashboard,
    Briefcase,
    Target,
    TrendingUp,
    Users,
    Award,
    ArrowUpRight
} from 'lucide-react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { FadeIn, ScaleIn, Floating } from '../components/Animations';
import Magnetic from '../components/Magnetic';

const Dashboard = () => {
    const { user } = useUser();
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const stats = [
        { label: 'Applications', value: '12', icon: Briefcase, color: 'blue' },
        { label: 'Interviews', value: '3', icon: Users, color: 'indigo' },
        { label: 'Growth', value: '+24%', icon: TrendingUp, color: 'emerald' },
        { label: 'Rank', value: 'Top 5%', icon: Award, color: 'amber' },
    ];

    const features = [
        {
            title: 'AI Career Path',
            description: 'Intelligent career trajectory mapping based on your skills and goals.',
            icon: Target,
            color: 'from-blue-500 to-cyan-400'
        },
        {
            title: 'Skill Analysis',
            description: 'Deep dive into your technical and soft skills with industry benchmarking.',
            icon: Award,
            color: 'from-indigo-500 to-purple-500'
        },
        {
            title: 'Market Insights',
            description: 'Real-time data on job market trends and salary expectations.',
            icon: TrendingUp,
            color: 'from-emerald-500 to-teal-400'
        }
    ];

    return (
        <div
            className="min-h-screen bg-slate-900 pb-20 group/main relative"
            onMouseMove={handleMouseMove}
        >
            {/* Background Spoolight */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover/main:opacity-100 z-0"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            650px circle at ${mouseX}px ${mouseY}px,
                            rgba(59, 130, 246, 0.15),
                            transparent 80%
                        )
                    `,
                }}
            />

            {/* Hero Section */}
            <div className="relative overflow-hidden pt-16 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="max-w-2xl">
                            <FadeIn>
                                <motion.h1
                                    className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                >
                                    Welcome back, <br />
                                    <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                        {user?.fullName || 'Explorer'}
                                    </span>
                                </motion.h1>
                            </FadeIn>
                            <FadeIn delay={0.2}>
                                <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-xl">
                                    Your personalized career dashboard is ready. Track your progress, explore new opportunities, and level up your skills.
                                </p>
                            </FadeIn>
                            <FadeIn delay={0.4}>
                                <div className="flex gap-4">
                                    <Magnetic>
                                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20">
                                            Get Started
                                        </button>
                                    </Magnetic>
                                    <Magnetic>
                                        <button className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-bold transition-all border border-slate-700">
                                            View Roadmap
                                        </button>
                                    </Magnetic>
                                </div>
                            </FadeIn>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-20">
                        {stats.map((stat, idx) => (
                            <ScaleIn key={idx} delay={idx * 0.1}>
                                <div className="group bg-slate-800/20 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/40 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden">
                                    <div className={`w-12 h-12 bg-${stat.color}-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>

                                    {/* Subtle line reveal */}
                                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-transparent w-0 group-hover:w-full transition-all duration-500" />
                                </div>
                            </ScaleIn>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <FadeIn key={idx} delay={idx * 0.2}>
                            <motion.div
                                className="group relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 p-8 rounded-3xl hover:border-blue-500/50 transition-all duration-500 overflow-hidden h-full"
                                whileHover={{ y: -10 }}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <ArrowUpRight className="w-6 h-6 text-blue-400" />
                                </div>

                                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} p-3.5 rounded-2xl mb-8 shadow-lg shadow-blue-500/10 group-hover:rotate-12 transition-all duration-500`}>
                                    <feature.icon className="w-full h-full text-white" />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed mb-6">
                                    {feature.description}
                                </p>

                                <button className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                                    Explore Tool
                                    <div className="w-1 h-1 bg-blue-500 rounded-full" />
                                </button>
                            </motion.div>
                        </FadeIn>
                    ))}
                </div>

                {/* Secondary Section */}
                <div className="mt-12 group/cta relative bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover/cta:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-2">Ready to take the next step?</h2>
                        <p className="text-slate-300 text-lg">Our AI recruiter is ready to mock interview you.</p>
                    </div>
                    <div className="relative z-10">
                        <Magnetic>
                            <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl shadow-blue-900/20 whitespace-nowrap">
                                Start Interview
                            </button>
                        </Magnetic>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
