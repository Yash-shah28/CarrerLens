/* eslint-disable no-unused-vars */
import ReactMock from 'react'; // Renaming to avoid conflict if needed, though this is a full rewrite.
import React from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Layout, Star, ShieldCheck } from 'lucide-react';
import { FadeIn, ScaleIn } from '../components/Animations';
import Magnetic from '../components/Magnetic';
import ResumePreview from '../components/ResumePreview';

// Mock Template Data
const TEMPLATES = [
    { id: 't1', name: "Standard Default", type: "Professional", color: "blue" },
    { id: 't2', name: "Modern", type: "Two-Column", color: "emerald" },
    { id: 't3', name: "Creative", type: "Timeline", color: "purple" },
    { id: 't4', name: "Classic", type: "Traditional", color: "slate" },
    { id: 't5', name: "Balanced", type: "Professional", color: "indigo" },
    { id: 't6', name: "Minimalist", type: "Clean", color: "gray" },
    { id: 't7', name: "Professional", type: "Executive", color: "blue" },
    { id: 't8', name: "Corporate", type: "Two-Column", color: "sky" },
    { id: 't9', name: "Bold", type: "Modern", color: "rose" },
    { id: 't10', name: "Slate", type: "Accent", color: "slate" },
    { id: 't11', name: "Professional Compact", type: "Compact", color: "teal" },
    { id: 't12', name: "Executive", type: "Details Panel", color: "violet" },
    { id: 't13', name: "Insight", type: "Navy Accent", color: "indigo" },
    { id: 't14', name: "Atelier", type: "Editorial", color: "amber" },
    { id: 't15', name: "Elegant", type: "Refined", color: "cyan" },
    { id: 't16', name: "Aqua", type: "Soft Header", color: "cyan" },
];

const ResumeTemplates = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const mode = location.state?.mode || searchParams.get('mode') || 'build'; // 'build' or 'preview'
    const { fileUrl, fileName, parsedData } = location.state || {};

    const handleSelect = (templateId) => {
        // Navigate to Editor
        // Pass the file, filename, and importantly the templateId
        // Also pass parsedData if available so Editor can initialize with it
        navigate('/resume-editor', {
            state: {
                templateId,
                fileUrl,
                fileName,
                isNew: mode === 'build',
                parsedData
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <FadeIn>
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold mb-4">
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            100% ATS Friendly Architectures
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
                            Choose Your <span className="text-blue-500">Structure</span>
                        </h1>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            {parsedData
                                ? "Here's how your resume looks in different styles. Select the one that fits you best."
                                : "Select a template to get started. All templates are optimized for Applicant Tracking Systems."
                            }
                        </p>
                    </FadeIn>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {TEMPLATES.map((template, idx) => (
                        <ScaleIn key={template.id} delay={idx * 0.05}>
                            <motion.div
                                whileHover={{ y: -8 }}
                                className="group relative bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 shadow-lg flex flex-col h-full"
                            >
                                {/* Preview Area */}
                                <div className="aspect-[1/1.414] bg-slate-200 relative overflow-hidden group-hover:opacity-100 transition-opacity">
                                    {parsedData ? (
                                        // Live Preview of Parsed Data
                                        <div className="w-full h-full transform scale-[0.4] origin-top-left" style={{ width: '250%', height: '250%' }}>
                                            <ResumePreview data={parsedData} templateId={template.id} />
                                        </div>
                                    ) : (
                                        // Mock Skeleton (only if no data)
                                        <div className="w-full h-full bg-white shadow-sm flex flex-col p-2 space-y-2 select-none pointer-events-none opacity-80">
                                            <div className={`h-8 w-1/3 bg-${template.color}-100 rounded-sm mb-2`} />
                                            <div className="space-y-1">
                                                <div className="h-1.5 w-full bg-slate-100 rounded-sm" />
                                                <div className="h-1.5 w-5/6 bg-slate-100 rounded-sm" />
                                            </div>
                                            <div className="flex gap-2 flex-1 mt-2">
                                                <div className="w-1/3 space-y-2">
                                                    <div className="h-20 bg-slate-50 rounded-sm" />
                                                </div>
                                                <div className="w-2/3 space-y-2">
                                                    <div className="h-4 w-1/2 bg-slate-100 rounded-sm" />
                                                    <div className="space-y-1">
                                                        <div className="h-1.5 w-full bg-slate-50 rounded-sm" />
                                                        <div className="h-1.5 w-full bg-slate-50 rounded-sm" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay on Hover */}
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 backdrop-blur-[2px]">
                                        <button
                                            onClick={() => handleSelect(template.id)}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
                                        >
                                            Select Style <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Info Footer */}
                                <div className="p-4 bg-slate-800 border-t border-slate-700 mt-auto">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-white font-bold text-sm">{template.name}</h3>
                                            <p className="text-xs text-slate-400">{template.type}</p>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full bg-gradient-to-br from-${template.color}-400 to-${template.color}-600 shadow-[0_0_8px_theme(colors.${template.color}.500)]`} />
                                    </div>
                                </div>
                            </motion.div>
                        </ScaleIn>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResumeTemplates;
