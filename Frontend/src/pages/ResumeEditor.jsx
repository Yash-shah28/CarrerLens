/* eslint-disable no-unused-vars */

import React, { useState, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import { useUser } from '../context/UserContext';
import {
    Send,
    Bot,
    User,
    FileText,
    Maximize2,
    Download,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Briefcase,
    AlertCircle,
    CheckCircle2,
    Minus,
    Square,
    X,
    MoreVertical,
    Eye,
    Settings,
    Plus,
    ZoomIn,
    ZoomOut,
    ChevronDown,
    Trash2,
    Layout,
    Award,
    Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import ResumePreview from '../components/ResumePreview';


const ResumeEditor = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const { fileUrl, fileName, templateId, parsedData } = location.state || {};

    const TEMPLATE_NAMES = {
        't1': "Standard Default",
        't2': "Modern",
        't3': "Creative",
        't4': "Classic",
        't5': "Balanced",
        't6': "Minimalist",
        't7': "Professional",
        't8': "Corporate",
        't9': "Bold",
        't10': "Slate",
        't11': "Professional Compact",
        't12': "Executive",
        't13': "Insight",
        't14': "Atelier",
        't15': "Elegant",
        't16': "Aqua",
    };

    // --- PDF Viewer State ---
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [zoom, setZoom] = useState(1.0);
    const containerRef = useRef(null);

    const [viewMode, setViewMode] = useState(fileUrl ? 'pdf' : 'template');

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    useLayoutEffect(() => {
        if (!containerRef.current) return;
        let timeoutId;
        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };
        const debouncedUpdateSize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(updateSize, 100);
        };
        updateSize();
        const observer = new ResizeObserver(debouncedUpdateSize);
        observer.observe(containerRef.current);
        return () => {
            observer.disconnect();
            clearTimeout(timeoutId);
        };
    }, []);


    // --- Chat State ---
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi there! I've analyzed your resume details. I can help you rewrite sections or fix formatting. What would you like to do?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState("");

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        setMessages([...messages, { id: Date.now(), text: inputValue, sender: 'user' }]);
        setInputValue("");

        // Simulate bot response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "I've updated that section for you. Is there anything else you'd like to adjust?",
                sender: 'bot'
            }]);
        }, 1500);
    };


    // --- Resume Data State ---
    // If parsedData is passed, use it. Otherwise use the default mock data.
    const [resumeData, setResumeData] = useState(parsedData || {
        personalInfo: {
            name: "YASH SHAH",
            title: "Software Engineer",
            email: "[Your Email Address]",
            phone: "[Your Phone Number]",
            city: "Ahmedabad, Gujarat, India",
            linkedin: "linkedin.com/in/yash-shah28",
            website: "[Your GitHub Link]",
            photo: null
        },
        workExperience: [
            {
                id: 1,
                company: "The Special Character",
                role: "AI Development Intern",
                location: "Location",
                startDate: "Nov 2025",
                endDate: "Present",
                current: true,
                responsibilities: [
                    "Architected RAG pipelines using LlamaIndex and LangChain",
                    "Developed high-concurrency FastAPI services for LLM responses",
                    "Built Agentic AI workflows for autonomous decision-making",
                    "Optimized data ingestion and embedding pipelines"
                ]
            }
        ],
        summary: "Full-Stack Developer and AI Researcher with hands-on experience in Agentic AI, Retrieval-Augmented Generation (RAG), and production-grade AI systems. Currently contributing to real-world AI architecture at The Special Character. Strong expertise in MERN Stack, FastAPI, and LLM-powered automation.",
        education: [
            {
                id: 1,
                university: "GSEB",
                location: "",
                degree: "Class 10",
                graduationDate: "Expected March 2026",
                additionalInfo: "Focus: Advanced Mathematics, Computer Science. Parallel B.Tech-level study in Image Processing and AI Architecture"
            }
        ],
        volunteering: [
            {
                id: 1,
                role: "Lead Volunteer",
                organization: "Tech for Good",
                date: "2024 - Present"
            }
        ],
        certifications: [
            {
                id: 1,
                name: "Secured AI internship while in Class 10",
                institution: "Honors & Achievements",
                date: "Date Acquired",
                expiry: "Expiration Date"
            },
            {
                id: 2,
                name: "Selected for senior-level B.Tech AI projects",
                institution: "Honors & Achievements",
                date: "Date Acquired",
                expiry: "Expiration Date"
            }
        ],
        languages: [
            { id: 1, language: "English", proficiency: "Professional Proficiency" },
            { id: 2, language: "Hindi", proficiency: "Native" }
        ],
        skills: {
            categories: [
                {
                    name: "AI & ML",
                    skills: ["Agentic AI", "RAG", "LangChain", "LlamaIndex", "Pinecone", "Milvus", "OpenAI API"]
                },
                {
                    name: "Full-Stack",
                    skills: ["MongoDB", "Express.js", "React.js", "Node.js", "HTML5", "CSS3", "Tailwind CSS"]
                },
                {
                    name: "Backend & Cloud",
                    skills: ["Python", "FastAPI", "Docker", "Git", "GitHub", "Postman"]
                }
            ]
        },
        projects: [
            {
                id: 1,
                title: "MERN Stack Development Portfolio",
                startDate: "Start Date",
                endDate: "End Date",
                current: false,
                descriptions: [
                    "Developed multiple full-stack applications with JWT authentication",
                    "Implemented secure CRUD operations and API integrations"
                ]
            },
            {
                id: 2,
                title: "ProcessPilot AI - Core Developer",
                startDate: "Start Date",
                endDate: "End Date",
                current: false,
                descriptions: [
                    "Built AI-driven business process automation platform",
                    "Integrated autonomous Agentic AI nodes",
                    "FastAPI backend with MongoDB logging",
                    "React-based workflow dashboard"
                ]
            }
        ],
        references: [],
        referencesHidden: true
    });

    const [expandedSection, setExpandedSection] = useState('personal');

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const handlePersonalChange = (field, value) => {
        setResumeData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: value }
        }));
    };

    return (
        <div className="h-screen bg-slate-900 overflow-hidden flex flex-col pt-20">

            {/* Header / Toolbar */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5 text-slate-400" />
                    </button>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        {resumeData.personalInfo.name}'s Resume <span className="text-slate-500 text-sm font-normal">Editing</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-emerald-400 text-sm font-medium">ATS Score: 78/100</span>
                    </div>
                    <button
                        onClick={() => navigate('/resume-templates', { state: { mode: 'preview', parsedData: resumeData, fileUrl, fileName } })}
                        className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-2"
                    >
                        <Layout className="w-3 h-3" />
                        Change Template
                    </button>
                    {templateId && (
                        <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
                            <Layout className="w-3 h-3 text-blue-400" />
                            <span className="text-blue-400 text-sm font-medium">{TEMPLATE_NAMES[templateId] || 'Custom Template'}</span>
                        </div>
                    )}
                    <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-slate-700">
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-600/20">
                        Finish Update
                    </button>
                </div>
            </div>

            {/* Main Content Grid: 3 Columns [Editor | Chat | Preview] */}
            <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">

                {/* LEFT: Resume Editor Form (4 cols) */}
                <div className="col-span-12 lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 space-y-4 pb-20">

                    {/* Personal Information */}
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden transition-all hover:border-slate-600">
                        <button
                            onClick={() => toggleSection('personal')}
                            className="w-full px-5 py-3 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                                <h3 className="text-base font-bold text-white">Personal Information</h3>
                            </div>
                            {expandedSection === 'personal' ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                        </button>

                        {expandedSection === 'personal' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-5 border-t border-slate-700 space-y-4">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-400">Name</label>
                                        <input
                                            value={resumeData.personalInfo.name}
                                            onChange={(e) => handlePersonalChange('name', e.target.value)}
                                            className="w-full bg-slate-900 text-white p-2.5 rounded-lg border border-slate-700 focus:border-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-400">Job Title</label>
                                        <input
                                            value={resumeData.personalInfo.title}
                                            onChange={(e) => handlePersonalChange('title', e.target.value)}
                                            className="w-full bg-slate-900 text-white p-2.5 rounded-lg border border-slate-700 focus:border-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-400">Email</label>
                                        <input
                                            value={resumeData.personalInfo.email}
                                            onChange={(e) => handlePersonalChange('email', e.target.value)}
                                            className="w-full bg-slate-900 text-white p-2.5 rounded-lg border border-slate-700 focus:border-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-400">Phone</label>
                                        <input
                                            value={resumeData.personalInfo.phone}
                                            onChange={(e) => handlePersonalChange('phone', e.target.value)}
                                            className="w-full bg-slate-900 text-white p-2.5 rounded-lg border border-slate-700 focus:border-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5 xl:col-span-2">
                                        <label className="text-xs font-medium text-slate-400">City</label>
                                        <input
                                            value={resumeData.personalInfo.city}
                                            onChange={(e) => handlePersonalChange('city', e.target.value)}
                                            className="w-full bg-slate-900 text-white p-2.5 rounded-lg border border-slate-700 focus:border-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    {/* Additional fields compressed for space */}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Work Experience */}
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden transition-all hover:border-slate-600">
                        <button
                            onClick={() => toggleSection('experience')}
                            className="w-full px-5 py-3 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                                <h3 className="text-base font-bold text-white">Work Experience</h3>
                            </div>
                            {expandedSection === 'experience' ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                        </button>

                        {expandedSection === 'experience' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 border-t border-slate-700 space-y-4">
                                {resumeData.workExperience.map((exp) => (
                                    <div key={exp.id} className="p-3 bg-slate-900/30 border border-slate-700 rounded-xl space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-slate-200 text-sm">{exp.company}</h4>
                                            <div className="flex gap-1">
                                                <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400"><MoreVertical className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-medium text-slate-500">Role</label>
                                                <div className="text-slate-300 text-sm">{exp.role}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-medium text-slate-500">Duration</label>
                                                <div className="text-slate-300 text-xs">{exp.startDate} - {exp.endDate}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2 border-t border-slate-700/50">
                                            {exp.responsibilities.slice(0, 2).map((resp, idx) => (
                                                <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                                                    <span className="line-clamp-2">{resp}</span>
                                                </div>
                                            ))}
                                            <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">Edit Responsibilities</button>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-300 border border-slate-600 border-dashed rounded-lg py-2 hover:bg-slate-700 transition-colors">
                                    <Plus className="w-3.5 h-3.5" /> Add New
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Professional Summary */}
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden transition-all hover:border-slate-600">
                        <button
                            onClick={() => toggleSection('summary')}
                            className="w-full px-5 py-3 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                                <h3 className="text-base font-bold text-white">Professional Summary</h3>
                            </div>
                            {expandedSection === 'summary' ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                        </button>
                        {expandedSection === 'summary' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 border-t border-slate-700 space-y-3">
                                <textarea
                                    value={resumeData.summary}
                                    className="w-full min-h-[120px] bg-slate-900 text-white p-3 rounded-xl border border-slate-700 focus:border-blue-500 outline-none leading-relaxed text-sm resize-y"
                                />
                                <button className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg text-xs font-bold text-blue-300 hover:bg-blue-600/10 transition-all">
                                    <Sparkles className="w-3.5 h-3.5" /> Rewrite with AI
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Education */}
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden transition-all hover:border-slate-600">
                        <button
                            onClick={() => toggleSection('education')}
                            className="w-full px-5 py-3 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                <h3 className="text-base font-bold text-white">Education</h3>
                            </div>
                            {expandedSection === 'education' ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                        </button>
                        {expandedSection === 'education' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 border-t border-slate-700 space-y-4">
                                {resumeData.education.map((edu) => (
                                    <div key={edu.id} className="p-3 bg-slate-900/30 border border-slate-700 rounded-xl space-y-2 relative">
                                        <div className="font-medium text-slate-200 text-sm">{edu.university}</div>
                                        <div className="text-xs text-slate-400">{edu.degree}</div>
                                        <div className="text-[10px] text-slate-500">{edu.graduationDate}</div>
                                    </div>
                                ))}
                                <button className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-300 border border-slate-600 border-dashed rounded-lg py-2 hover:bg-slate-700 transition-colors">
                                    <Plus className="w-3.5 h-3.5" /> Add Education
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Skills */}
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden transition-all hover:border-slate-600">
                        <button
                            onClick={() => toggleSection('skills')}
                            className="w-full px-5 py-3 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                                <h3 className="text-base font-bold text-white">Skills</h3>
                            </div>
                            {expandedSection === 'skills' ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                        </button>
                        {expandedSection === 'skills' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 border-t border-slate-700 space-y-4">
                                {resumeData.skills.categories.map((cat, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cat.name}</h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {cat.skills.map((skill, sIdx) => (
                                                <div key={sIdx} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs text-slate-300">
                                                    {skill}
                                                </div>
                                            ))}
                                            <button className="px-2 py-1 border border-dashed border-slate-600 rounded-md text-xs text-slate-500 hover:text-white hover:bg-slate-800">
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Projects */}
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden transition-all hover:border-slate-600">
                        <button
                            onClick={() => toggleSection('projects')}
                            className="w-full px-5 py-3 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                                <h3 className="text-base font-bold text-white">Projects</h3>
                            </div>
                            {expandedSection === 'projects' ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                        </button>
                        {expandedSection === 'projects' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 border-t border-slate-700 space-y-4">
                                {resumeData.projects?.map((proj) => (
                                    <div key={proj.id} className="p-3 bg-slate-900/30 border border-slate-700 rounded-xl space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-slate-200 text-sm">{proj.title}</h4>
                                            <div className="flex gap-1">
                                                <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400"><MoreVertical className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-medium text-slate-500">Duration</label>
                                                <div className="text-slate-300 text-xs">{proj.startDate} - {proj.endDate}</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pt-2 border-t border-slate-700/50">
                                            {proj.descriptions?.map((desc, idx) => (
                                                <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                                                    <span className="line-clamp-2">{desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-300 border border-slate-600 border-dashed rounded-lg py-2 hover:bg-slate-700 transition-colors">
                                    <Plus className="w-3.5 h-3.5" /> Add Project
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* References */}
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden transition-all hover:border-slate-600">
                        <button
                            onClick={() => toggleSection('references')}
                            className="w-full px-5 py-3 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
                                <h3 className="text-base font-bold text-white">References</h3>
                            </div>
                            {expandedSection === 'references' ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                        </button>
                        {expandedSection === 'references' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 border-t border-slate-700 space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-900/30 border border-slate-700 rounded-xl">
                                    <span className="text-sm text-slate-300">Hide references and show "Available upon request"</span>
                                    <button
                                        onClick={() => setResumeData(prev => ({ ...prev, referencesHidden: !prev.referencesHidden }))}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${resumeData.referencesHidden ? 'bg-blue-600' : 'bg-slate-600'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${resumeData.referencesHidden ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                                {!resumeData.referencesHidden && (
                                    <button className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-300 border border-slate-600 border-dashed rounded-lg py-2 hover:bg-slate-700 transition-colors">
                                        <Plus className="w-3.5 h-3.5" /> Add Reference
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Certifications */}
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden transition-all hover:border-slate-600">
                        <button
                            onClick={() => toggleSection('certifications')}
                            className="w-full px-5 py-3 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Award className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                                <h3 className="text-base font-bold text-white">Certifications</h3>
                            </div>
                            {expandedSection === 'certifications' ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                        </button>
                        {expandedSection === 'certifications' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 border-t border-slate-700 space-y-4">
                                {resumeData.certifications?.map((cert) => (
                                    <div key={cert.id} className="p-3 bg-slate-900/30 border border-slate-700 rounded-xl space-y-2 relative">
                                        <div className="font-medium text-slate-200 text-sm">{cert.name}</div>
                                        <div className="text-xs text-slate-400">{cert.institution}</div>
                                        <div className="text-[10px] text-slate-500">{cert.date}</div>
                                    </div>
                                ))}
                                <button className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-300 border border-slate-600 border-dashed rounded-lg py-2 hover:bg-slate-700 transition-colors">
                                    <Plus className="w-3.5 h-3.5" /> Add Certification
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Achievements */}
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden transition-all hover:border-slate-600">
                        <button
                            onClick={() => toggleSection('achievements')}
                            className="w-full px-5 py-3 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Star className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                                <h3 className="text-base font-bold text-white">Achievements</h3>
                            </div>
                            {expandedSection === 'achievements' ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                        </button>
                        {expandedSection === 'achievements' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 border-t border-slate-700 space-y-4">
                                <div className="p-3 bg-slate-900/30 border border-slate-700 rounded-xl space-y-1 relative">
                                    <div className="font-medium text-slate-200 text-sm">Employee of the Month</div>
                                    <div className="text-[10px] text-slate-500">Dec 2024</div>
                                </div>
                                <button className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-300 border border-slate-600 border-dashed rounded-lg py-2 hover:bg-slate-700 transition-colors">
                                    <Plus className="w-3.5 h-3.5" /> Add Achievement
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* MIDDLE: Chat Interface (4 cols) */}
                <div className="col-span-12 lg:col-span-4 h-full">
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl h-full flex flex-col overflow-hidden relative backdrop-blur-sm">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-700/50 bg-slate-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">JobSuit AI</h3>
                                    <p className="text-slate-400 text-xs">Assistant</p>
                                </div>
                            </div>
                            <button className="text-slate-400 hover:text-white text-xs transition-colors">Clear</button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-sm'
                                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm shadow-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-slate-800/50 border-t border-slate-700/50 mt-auto">
                            <form onSubmit={handleSendMessage} className="relative">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type a command..."
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </form>
                            <p className="text-center text-[10px] text-slate-600 mt-2">
                                AI can make mistakes. Please verify generated content.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Resume Preview (4 cols) */}
                <div className="col-span-12 lg:col-span-4 h-full">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl h-full flex flex-col overflow-hidden relative shadow-2xl">
                        {/* Header Tools */}
                        <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-3 select-none z-10 relative">
                            <div className="flex items-center bg-slate-700/50 p-1 rounded-lg border border-slate-600">
                                {(fileUrl || parsedData?.formattedText) && (
                                    <button
                                        onClick={() => setViewMode('pdf')}
                                        className={`px-3 h-7 rounded-md text-[10px] font-bold transition-all ${viewMode === 'pdf' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        Original PDF
                                    </button>
                                )}
                                <button
                                    onClick={() => setViewMode('template')}
                                    className={`px-3 h-7 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5 ${viewMode === 'template' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    <Layout className="w-3 h-3" />
                                    Live Preview
                                </button>
                            </div>

                            <div className="flex items-center">
                                <div className="flex items-center p-0.5 bg-slate-700 rounded-lg border border-slate-600">
                                    <button
                                        onClick={() => setZoom(prev => Math.max(0.2, prev - 0.1))}
                                        className="w-6 h-6 flex items-center justify-center hover:bg-slate-600 rounded-md text-slate-300 transition-all"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-8 text-center text-[10px] font-semibold text-slate-200 tabular-nums">
                                        {Math.round(zoom * 100)}%
                                    </span>
                                    <button
                                        onClick={() => setZoom(prev => Math.min(2.0, prev + 0.1))}
                                        className="w-6 h-6 flex items-center justify-center hover:bg-slate-600 rounded-md text-slate-300 transition-all"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* PDF Viewer */}
                        <div className="flex-1 bg-slate-900 relative overflow-hidden" ref={containerRef}>
                            <div className="absolute inset-0 overflow-y-auto custom-scrollbar-light scroll-smooth">
                                {viewMode === 'pdf' && fileUrl ? (
                                    <div className="min-h-full flex flex-col items-center py-4">
                                        <Document
                                            file={fileUrl}
                                            onLoadSuccess={onDocumentLoadSuccess}
                                            loading={
                                                <div className="flex flex-col items-center gap-2 mt-10">
                                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-slate-500 text-[10px]">Loading PDF...</span>
                                                </div>
                                            }
                                            error={<div className="text-red-500 text-xs mt-10">Failed to load</div>}
                                            className="w-full flex justify-center shadow-lg"
                                        >
                                            <div className="origin-top transition-transform duration-200" style={{ width: containerSize.width ? containerSize.width * zoom * 0.9 : '90%' }}>
                                                {containerSize.width > 0 && (
                                                    <Page
                                                        pageNumber={pageNumber}
                                                        width={containerSize.width * zoom * 0.9}
                                                        renderTextLayer={false}
                                                        renderAnnotationLayer={false}
                                                        className="bg-white rounded-sm overflow-hidden"
                                                        loading={<div className="bg-white w-full aspect-[1/1.414]" />}
                                                        devicePixelRatio={1.5}
                                                    />
                                                )}
                                            </div>
                                        </Document>

                                        {numPages && numPages > 1 && (
                                            <div className="sticky bottom-4 mt-auto bg-slate-800/90 backdrop-blur-md text-white px-2 py-1 rounded-full flex items-center gap-2 shadow-xl border border-slate-600 z-20 mx-auto scale-90">
                                                <button
                                                    onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                                                    disabled={pageNumber <= 1}
                                                    className="p-1 hover:bg-slate-700 rounded-full transition-colors disabled:opacity-30"
                                                >
                                                    <ChevronLeft className="w-3 h-3" />
                                                </button>
                                                <span className="text-[10px] font-medium tab-nums text-slate-300">
                                                    {pageNumber}/{numPages}
                                                </span>
                                                <button
                                                    onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                                                    disabled={pageNumber >= numPages}
                                                    className="p-1 hover:bg-slate-700 rounded-full transition-colors disabled:opacity-30"
                                                >
                                                    <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : viewMode === 'template' ? (
                                    <div className="min-h-full flex justify-center py-8 px-4" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
                                        <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl origin-top" style={{ width: containerSize.width ? containerSize.width * 0.9 : '210mm' }}>
                                            <ResumePreview data={resumeData} templateId={templateId} />
                                        </div>
                                    </div>
                                ) : viewMode === 'pdf' && parsedData?.formattedText ? (
                                    <div className="min-h-full flex justify-center py-8 px-4">
                                        <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-8 whitespace-pre-wrap font-mono text-[10px] text-slate-800" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', width: containerSize.width ? containerSize.width * 0.9 : '210mm' }}>
                                            {parsedData.formattedText}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                                            <FileText className="w-6 h-6 text-slate-600" />
                                        </div>
                                        <p className="text-xs">{templateId ? 'Template Active. Swich to Live Preview to see content.' : 'No resume uploaded'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MessageIcon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
)

export default ResumeEditor;
