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

const Dashboard = () => {
    const { user } = useUser();

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
        <div className="min-h-screen bg-slate-900 pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden pt-16 pb-32">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -mr-40 -mt-20 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -ml-40 -mb-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                            Welcome back, <br />
                            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                {user?.fullName || 'Explorer'}
                            </span>
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl">
                            Your personalized career dashboard is ready. Track your progress, explore new opportunities, and level up your skills.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/60 transition-all duration-300">
                                <div className={`w-10 h-10 bg-${stat.color}-500/10 rounded-xl flex items-center justify-center mb-4`}>
                                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                                </div>
                                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-3xl hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <ArrowUpRight className="w-6 h-6 text-blue-400" />
                            </div>

                            <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} p-3.5 rounded-2xl mb-8 shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform duration-500`}>
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
                        </div>
                    ))}
                </div>

                {/* Secondary Section */}
                <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Ready to take the next step?</h2>
                        <p className="text-blue-100 text-lg">Our AI recruiter is ready to mock interview you.</p>
                    </div>
                    <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl shadow-blue-900/20 whitespace-nowrap">
                        Start Interview
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
