/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Sparkles, FileText, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from '../components/Animations';
import Magnetic from '../components/Magnetic';
import axios from 'axios';

const JobDescription = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [jobDescription, setJobDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleContinue = async () => {
        const stateToPass = location.state || { mode: 'build' };

        // Always save to localStorage as a fast fallback
        if (jobDescription.trim()) {
            localStorage.setItem('targetJobDescription', jobDescription);
        }

        // If JD has content, save it to the DB
        if (jobDescription.trim()) {
            setIsSaving(true);
            try {
                await axios.post(
                    '/api/v1/job-descriptions',
                    { text: jobDescription.trim() },
                    { withCredentials: true }
                );
                setSaved(true);
            } catch (err) {
                console.error('Failed to save JD to DB:', err);
                // Non-blocking — still continue to next page
            } finally {
                setIsSaving(false);
            }
        }

        // Pass JD text in navigation state so ResumeEditor gets it immediately
        navigate('/resume-templates', {
            state: { ...stateToPass, jdText: jobDescription.trim() }
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
            {/* Background decorative glow */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="relative z-10 w-full max-w-4xl mx-auto mt-16 md:mt-0">
                <FadeIn>
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back</span>
                    </button>
                    
                    <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
                        {/* Decorative internal glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
                        
                        <div className="relative z-10">
                            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                    Target Job Description
                                </span>
                            </h1>
                            <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                                Paste the details of the role you're targeting. Our AI will analyze the requirements to tailor your resume for maximum impact.
                            </p>

                            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden mb-8 focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/60 transition-all shadow-inner">
                                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm font-bold tracking-wider uppercase">
                                        <FileText className="w-4 h-4 text-blue-400" />
                                        <span>Input Field</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                                    </div>
                                </div>
                                <textarea
                                    className="w-full h-[400px] md:h-[500px] bg-transparent text-slate-200 placeholder-slate-600 p-6 text-base md:text-lg leading-relaxed resize-none focus:outline-none custom-scrollbar"
                                    placeholder="Paste the job description here (Role, Responsibilities, Requirements)..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                                <div className="px-5 py-4 border-t border-slate-800 flex justify-end items-center bg-slate-800/40">
                                    <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold tracking-wide">
                                        <Sparkles className="w-3 h-3 text-purple-400" />
                                        <span>AI Ready</span>
                                        <span className="mx-2 text-slate-600">•</span>
                                        <span>{jobDescription.length} characters</span>
                                        {saved && (
                                            <>
                                                <span className="mx-2 text-slate-600">•</span>
                                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                <span className="text-emerald-400">Saved</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Magnetic>
                                <button
                                    onClick={handleContinue}
                                    disabled={isSaving}
                                    className="w-full group bg-blue-600 hover:bg-blue-500 disabled:opacity-70 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-600/30 active:scale-[0.98]"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            Continue to template selection
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </Magnetic>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
};

export default JobDescription;
