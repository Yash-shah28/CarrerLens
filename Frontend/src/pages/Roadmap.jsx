import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import { 
    Search, 
    Sparkles, 
    ArrowRight, 
    CheckCircle2, 
    BookOpen, 
    Code, 
    Layers,
    Rocket,
    BrainCircuit,
    ChevronDown,
    ChevronUp,
    Download,
    Youtube,
    Book
} from 'lucide-react';
import { FadeIn } from '../components/Animations';
import Magnetic from '../components/Magnetic';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Roadmap = () => {
    const [skill, setSkill] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [roadmap, setRoadmap] = useState(null);
    const [expandedStep, setExpandedStep] = useState(0);
    const roadmapRef = useRef(null);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const generateRoadmap = async (e) => {
        if (e) e.preventDefault();
        if (!skill.trim()) return;

        setIsGenerating(true);
        try {
            const response = await axios.post('/api/v1/roadmaps/generate', 
                { skill },
                { withCredentials: true }
            );

            if (response.data.success) {
                // Map the dynamic icons based on step index or keywords if needed
                const icons = [BookOpen, BrainCircuit, Layers, Code, Rocket, Sparkles];
                const roadmapWithIcons = {
                    ...response.data.data,
                    steps: response.data.data.steps.map((step, idx) => ({
                        ...step,
                        icon: icons[idx % icons.length]
                    }))
                };
                setRoadmap(roadmapWithIcons);
            }
        } catch (error) {
            console.error("Roadmap Generation Error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to generate roadmap";
            alert(`Error: ${errorMessage}\n\nPlease check your Gemini API key and backend logs.`);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadPDF = async () => {
        if (!roadmapRef.current) return;
        
        const element = roadmapRef.current;
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#0f172a', // slate-900
            useCORS: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${roadmap.title}-Roadmap.pdf`);
    };

    const trendingSkills = ["React.js", "Python", "Data Science", "Cybersecurity", "DevOps"];

    return (
        <div 
            className="min-h-screen bg-slate-900 text-white relative overflow-hidden px-4 py-20"
            onMouseMove={handleMouseMove}
        >
            {/* Background Spotlight */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            650px circle at ${mouseX}px ${mouseY}px,
                            rgba(59, 130, 246, 0.1),
                            transparent 80%
                        )
                    `,
                }}
            />

            <div className="max-w-4xl mx-auto relative z-10">
                {!roadmap && !isGenerating && (
                    <FadeIn>
                        <div className="text-center space-y-8 mt-20">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
                                <Sparkles className="w-4 h-4" />
                                AI-Powered Learning Paths
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                                What do you want to <br />
                                <span className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent italic">
                                    master
                                </span> today?
                            </h1>
                            <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                                Enter any skill, and our AI will generate a personalized roadmap with books and YouTube resources.
                            </p>

                            <form onSubmit={generateRoadmap} className="max-w-2xl mx-auto relative group">
                                <div className="relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Fullstack Development, Machine Learning, UI/UX..."
                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-3xl py-6 pl-16 pr-40 text-lg focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all backdrop-blur-xl"
                                        value={skill}
                                        onChange={(e) => setSkill(e.target.value)}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Magnetic>
                                            <button 
                                                type="submit"
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                                            >
                                                Generate
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </Magnetic>
                                    </div>
                                </div>
                                <div className="mt-8 flex flex-wrap justify-center gap-3">
                                    {trendingSkills.map((s) => (
                                        <button 
                                            key={s}
                                            type="button"
                                            onClick={() => setSkill(s)}
                                            className="px-4 py-2 rounded-full bg-slate-800/40 border border-slate-700/50 text-slate-400 text-sm hover:border-blue-500/30 hover:text-white transition-all"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </form>
                        </div>
                    </FadeIn>
                )}

                {isGenerating && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10">
                        <div className="relative">
                            <div className="w-32 h-32 border-4 border-blue-500/20 rounded-full animate-spin border-t-blue-500" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-blue-400 animate-pulse" />
                            </div>
                        </div>
                        <div className="text-center space-y-3">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                Architecting your path...
                            </h2>
                            <p className="text-slate-400 animate-pulse">
                                Analyzing industry requirements for {skill}
                            </p>
                        </div>
                    </div>
                )}

                {roadmap && !isGenerating && (
                    <AnimatePresence>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-12"
                            ref={roadmapRef}
                        >
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-12">
                                <div className="space-y-4">
                                    <button 
                                        onClick={() => setRoadmap(null)}
                                        className="text-blue-400 text-sm font-semibold hover:text-blue-300 transition-colors flex items-center gap-2"
                                    >
                                        ← Create New Roadmap
                                    </button>
                                    <h1 className="text-4xl md:text-6xl font-bold">{roadmap.title}</h1>
                                    <p className="text-slate-400 text-lg max-w-2xl">{roadmap.description}</p>
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={downloadPDF}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/20 transition-all font-bold flex items-center gap-2"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download PDF
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                {/* Timeline Line */}
                                <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-600 opacity-20 hidden md:block" />

                                <div className="space-y-8">
                                    {roadmap.steps.map((step, idx) => (
                                        <div key={idx} className="relative">
                                            <div 
                                                className={`group relative flex gap-8 p-6 rounded-3xl transition-all duration-500 ${expandedStep === idx ? 'bg-slate-800/40 border-blue-500/30 ring-1 ring-blue-500/20' : 'bg-slate-800/20 border-slate-800 hover:bg-slate-800/30' } border cursor-pointer`}
                                                onClick={() => setExpandedStep(expandedStep === idx ? -1 : idx)}
                                            >
                                                {/* Icon Node */}
                                                <div className="relative z-10 hidden md:block">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${expandedStep === idx ? 'bg-blue-600 shadow-lg shadow-blue-600/40 scale-110' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600 group-hover:text-white'}`}>
                                                        <step.icon className="w-7 h-7" />
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <span className="text-blue-400 font-mono text-xs font-bold uppercase tracking-widest">Phase 0{idx + 1}</span>
                                                            </div>
                                                            <h3 className="text-2xl font-bold">{step.title}</h3>
                                                        </div>
                                                        {expandedStep === idx ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
                                                    </div>

                                                    <AnimatePresence>
                                                        {expandedStep === idx && (
                                                            <motion.div 
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden space-y-6 pt-2"
                                                            >
                                                                <p className="text-slate-400 leading-relaxed">{step.description}</p>
                                                                
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                    <div className="space-y-3">
                                                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                                            In this phase
                                                                        </h4>
                                                                        <ul className="space-y-2">
                                                                            {step.topics.map((topic, tIdx) => (
                                                                                <li key={tIdx} className="text-slate-400 text-sm flex items-center gap-3">
                                                                                    <div className="w-1.5 h-1.5 bg-blue-500/40 rounded-full" />
                                                                                    {topic}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        {step.resources.books && step.resources.books.length > 0 && (
                                                                            <div className="space-y-2">
                                                                                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                                                    <Book className="w-4 h-4 text-amber-400" />
                                                                                    Top Rated Books
                                                                                </h4>
                                                                                <ul className="space-y-1">
                                                                                    {step.resources.books.map((book, bIdx) => (
                                                                                        <li key={bIdx} className="text-slate-400 text-xs italic">
                                                                                            {book}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}
                                                                        {step.resources.youtube && step.resources.youtube.length > 0 && (
                                                                            <div className="space-y-2">
                                                                                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                                                    <Youtube className="w-4 h-4 text-red-500" />
                                                                                    Learn on YouTube
                                                                                </h4>
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {step.resources.youtube.map((query, yIdx) => (
                                                                                        <a 
                                                                                            key={yIdx}
                                                                                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-all"
                                                                                        >
                                                                                            {query}
                                                                                        </a>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default Roadmap;
