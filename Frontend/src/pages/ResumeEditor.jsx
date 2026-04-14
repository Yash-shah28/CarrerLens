/* eslint-disable no-unused-vars */

import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
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
    Mic,
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
import { MOCK_RESUME_DATA, EMPTY_RESUME_DATA } from '../data/resumeData';
import html2pdf from 'html2pdf.js';
import axios from 'axios';


const ResumeEditor = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const { fileUrl, fileName, templateId, parsedData, jdText: jdFromState } = location.state || {};

    // Priority order: 1) navigation state  2) localStorage  3) DB fetch
    const localStorageJD = localStorage.getItem('targetJobDescription') || "";
    const [jdText, setJdText] = useState(jdFromState || localStorageJD || "");
    const [jdLoaded, setJdLoaded] = useState(!!(jdFromState || localStorageJD));

    // Fetch JD from DB on mount as the final fallback (covers direct navigation to editor)
    useEffect(() => {
        // If we already have it from state or localStorage, no need to fetch
        if (jdFromState || localStorageJD) {
            setJdLoaded(true);
            return;
        }
        const fetchJD = async () => {
            try {
                const res = await axios.get('/api/v1/job-descriptions/latest', { withCredentials: true });
                const text = res.data?.data?.text;
                if (text) {
                    setJdText(text);
                    setJdLoaded(true);
                    // Also cache it locally for next time
                    localStorage.setItem('targetJobDescription', text);
                    console.log('[ResumeEditor] JD loaded from DB:', text.slice(0, 60) + '...');
                } else {
                    console.warn('[ResumeEditor] No JD found in DB for this user.');
                }
            } catch (err) {
                console.warn('[ResumeEditor] Could not fetch JD from DB:', err?.response?.data || err.message);
            }
        };
        fetchJD();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
    const [isFullScreen, setIsFullScreen] = useState(false);
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
        { id: 1, text: "Hi! I'm CareerLens AI. I have access to your resume and the job description. Ask me to rewrite sections, improve bullet points, optimize for ATS, or tailor your resume for the JD!", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isBotTyping, setIsBotTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isBotTyping]);

    // Core AI call — takes a plain text message, adds it to chat, fires the API
    const sendToAI = async (messageText) => {
        if (!messageText.trim() || isBotTyping) return;

        const userMsg = { id: Date.now(), text: messageText, sender: 'user' };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInputValue("");
        setIsBotTyping(true);

        try {
            const response = await fetch('/api/chat/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageText,
                    resume_data: resumeData,
                    jd_text: jdText,
                    chat_history: updatedMessages.slice(-20).map(m => ({ sender: m.sender, text: m.text }))
                })
            });

            if (!response.ok) {
                let detail = `HTTP ${response.status}`;
                try {
                    const errBody = await response.json();
                    detail = errBody.detail || JSON.stringify(errBody);
                } catch { /* empty */ }
                throw new Error(detail);
            }

            const data = await response.json();

            if (data.resume_updates && typeof data.resume_updates === 'object') {
                setResumeData(prev => mergeResumeUpdates(prev, data.resume_updates));
            }

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: data.reply || "Done! Let me know if you need anything else.",
                sender: 'bot',
                hasUpdates: !!data.resume_updates
            }]);
        } catch (error) {
            console.error('Chat agent error:', error);
            const errMsg = error?.message || String(error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: `⚠️ Error: ${errMsg}`,
                sender: 'bot',
                isError: true
            }]);
        } finally {
            setIsBotTyping(false);
        }
    };

    // Form submission handler
    const handleSendMessage = async (e) => {
        e.preventDefault();
        await sendToAI(inputValue.trim());
    };

    // Trigger a targeted AI rewrite from an editor button (e.g. "Rewrite with AI")
    // scrolls the chat panel into view so the user sees the response
    const triggerAIRewrite = (section) => {
        if (isBotTyping) return;

        const prompts = {
            summary: `Rewrite my professional summary to be compelling and tailored to the job description. 
Keep it grounded in my actual experience from the resume — don't invent skills or roles I don't have. 
Make it 3–4 sentences, highlight my strongest relevant skills, and use keywords from the JD for ATS optimization. 
Current summary: "${resumeData.summary || 'Not written yet'}"`,
        };

        const message = prompts[section];
        if (!message) return;

        // Scroll chat panel into view
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

        sendToAI(message);
    };

    // Deep-merge resume updates from AI into existing resume data
    const mergeResumeUpdates = (current, updates) => {
        if (!updates) return current;
        const merged = { ...current };
        for (const key of Object.keys(updates)) {
            if (updates[key] !== null && updates[key] !== undefined) {
                // For arrays and objects, replace entirely if provided
                merged[key] = updates[key];
            }
        }
        return merged;
    };


    // --- Resume Data State ---
    // If parsedData is passed, use it. Otherwise use the default mock data.
    // --- Resume Data State ---
    // If parsedData is passed, use it. Otherwise use the EMPTY data structure for new builds.
    const [resumeData, setResumeData] = useState(() => {
        if (parsedData) return parsedData;
        return JSON.parse(JSON.stringify(EMPTY_RESUME_DATA)); // Deep copy to avoid reference issues
    });

    const [resumeId, setResumeId] = useState(parsedData?._id || null);
    const [isLoadingResume, setIsLoadingResume] = useState(false);

    // On mount: restore the last saved resume from DB if we didn't get parsedData from navigation
    useEffect(() => {
        if (parsedData) return; // Already have data from navigation state (e.g. upload flow)

        const savedResumeId = parsedData?._id || localStorage.getItem('lastSavedResumeId');
        if (!savedResumeId) return; // Nothing saved yet

        const loadResume = async () => {
            setIsLoadingResume(true);
            try {
                const res = await axios.get(`/api/v1/resumes/${savedResumeId}`, { withCredentials: true });
                const resume = res.data?.data;
                if (resume) {
                    setResumeData(resume);
                    setResumeId(resume._id);
                    // Also sync localStorage
                    localStorage.setItem('savedResumeData', JSON.stringify(resume));
                    console.log('[ResumeEditor] Resume restored from DB:', resume._id);
                }
            } catch (err) {
                console.warn('[ResumeEditor] Could not load resume from DB:', err?.response?.data || err.message);
                // Fallback: try localStorage cache
                const cached = localStorage.getItem('savedResumeData');
                if (cached) {
                    try {
                        const parsed = JSON.parse(cached);
                        setResumeData(parsed);
                        if (parsed._id) setResumeId(parsed._id);
                        console.log('[ResumeEditor] Resume restored from localStorage cache');
                    } catch { /* empty */ }
                }
            } finally {
                setIsLoadingResume(false);
            }
        };
        loadResume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Derived Preview Data: Merge User Data over Mock Data
    // We only use Mock Data if the specific field in User Data is empty/initial
    // Use resumeData directly for preview so the PDF reflects exactly what the user entered
    const previewData = resumeData;

    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

    const handleSave = async () => {
        if (saveStatus === 'saving') return;
        setSaveStatus('saving');
        try {
            let response;
            if (resumeId) {
                response = await axios.patch(`/api/v1/resumes/${resumeId}`, resumeData, { withCredentials: true });
            } else {
                response = await axios.post('/api/v1/resumes', resumeData, { withCredentials: true });
                if (response.data?.data?._id) {
                    const newId = response.data.data._id;
                    setResumeId(newId);
                    localStorage.setItem('lastSavedResumeId', newId);
                }
            }
            localStorage.setItem('savedResumeData', JSON.stringify(resumeData));
            if (resumeId) localStorage.setItem('lastSavedResumeId', resumeId);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2500);
        } catch (error) {
            console.error("Error saving resume:", error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 2500);
        }
    };

    const handleDownload = () => {
        // We download the Preview element
        // We need to target the internal div of ResumePreview or the container
        const element = document.getElementById('resume-preview-content');
        if (!element) return;

        const opt = {
            margin: 0,
            filename: `${resumeData.personalInfo.name || 'Resume'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Show loading state on button?
        const btn = document.getElementById('download-btn');
        let originalText = "";
        if (btn) {
            originalText = btn.innerHTML;
            btn.innerHTML = "Generating...";
        }

        html2pdf().set(opt).from(element).save().then(() => {
            if (btn) btn.innerHTML = originalText;
        });
    };

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

    // --- Work Experience Handlers ---
    const handleWorkExperienceChange = (id, field, value) => {
        setResumeData(prev => ({
            ...prev,
            workExperience: prev.workExperience.map(exp =>
                exp.id === id ? { ...exp, [field]: value } : exp
            )
        }));
    };
    const addWorkExperience = () => {
        setResumeData(prev => ({
            ...prev,
            workExperience: [...prev.workExperience, {
                id: Date.now().toString(),
                company: "New Company",
                role: "New Role",
                startDate: "",
                endDate: "",
                responsibilities: ["New responsibility"]
            }]
        }));
    };
    const removeWorkExperience = (id) => {
        setResumeData(prev => ({
            ...prev,
            workExperience: prev.workExperience.filter(exp => exp.id !== id)
        }));
    };
    const handleResponsibilityChange = (expId, idx, value) => {
        setResumeData(prev => ({
            ...prev,
            workExperience: prev.workExperience.map(exp => {
                if (exp.id !== expId) return exp;
                const newResps = [...exp.responsibilities];
                newResps[idx] = value;
                return { ...exp, responsibilities: newResps };
            })
        }));
    };
    const addResponsibility = (expId) => {
        setResumeData(prev => ({
            ...prev,
            workExperience: prev.workExperience.map(exp => {
                if (exp.id !== expId) return exp;
                return { ...exp, responsibilities: [...exp.responsibilities, "New responsibility"] };
            })
        }));
    };

    // --- Education Handlers ---
    const handleEducationChange = (id, field, value) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.map(edu =>
                edu.id === id ? { ...edu, [field]: value } : edu
            )
        }));
    };
    const addEducation = () => {
        setResumeData(prev => ({
            ...prev,
            education: [...prev.education, {
                id: Date.now().toString(),
                university: "University Name",
                degree: "Degree",
                graduationDate: ""
            }]
        }));
    };
    const removeEducation = (id) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.filter(edu => edu.id !== id)
        }));
    };

    // --- Skills Handlers ---
    const addSkillCategory = () => {
        setResumeData(prev => ({
            ...prev,
            skills: {
                ...prev.skills,
                categories: [...prev.skills.categories, { name: "New Category", skills: [] }]
            }
        }));
    };
    const handleCategoryNameChange = (idx, value) => {
        setResumeData(prev => {
            const newCats = [...prev.skills.categories];
            newCats[idx] = { ...newCats[idx], name: value };
            return { ...prev, skills: { ...prev.skills, categories: newCats } };
        });
    };
    const removeSkillCategory = (idx) => {
        setResumeData(prev => {
            const newCats = prev.skills.categories.filter((_, i) => i !== idx);
            return { ...prev, skills: { ...prev.skills, categories: newCats } };
        });
    };
    const addSkill = (catIdx) => {
        setResumeData(prev => {
            const newCats = [...prev.skills.categories];
            newCats[catIdx] = { ...newCats[catIdx], skills: [...newCats[catIdx].skills, "New Skill"] };
            return { ...prev, skills: { ...prev.skills, categories: newCats } };
        });
    };
    const handleSkillChange = (catIdx, skillIdx, value) => {
        setResumeData(prev => {
            const newCats = [...prev.skills.categories];
            const newSkills = [...newCats[catIdx].skills];
            newSkills[skillIdx] = value;
            newCats[catIdx] = { ...newCats[catIdx], skills: newSkills };
            return { ...prev, skills: { ...prev.skills, categories: newCats } };
        });
    };
    const removeSkill = (catIdx, skillIdx) => {
        setResumeData(prev => {
            const newCats = [...prev.skills.categories];
            const newSkills = newCats[catIdx].skills.filter((_, i) => i !== skillIdx);
            newCats[catIdx] = { ...newCats[catIdx], skills: newSkills };
            return { ...prev, skills: { ...prev.skills, categories: newCats } };
        });
    };

    // --- Projects Handlers ---
    const handleProjectChange = (id, field, value) => {
        setResumeData(prev => ({
            ...prev,
            projects: prev.projects.map(p =>
                p.id === id ? { ...p, [field]: value } : p
            )
        }));
    };
    const addProject = () => {
        setResumeData(prev => ({
            ...prev,
            projects: [...prev.projects, {
                id: Date.now().toString(),
                title: "New Project",
                startDate: "",
                endDate: "",
                descriptions: ["Project description"]
            }]
        }));
    };
    const removeProject = (id) => {
        setResumeData(prev => ({
            ...prev,
            projects: prev.projects.filter(p => p.id !== id)
        }));
    };
    const handleProjectDescChange = (projId, idx, value) => {
        setResumeData(prev => ({
            ...prev,
            projects: prev.projects.map(p => {
                if (p.id !== projId) return p;
                const newDesc = [...p.descriptions];
                newDesc[idx] = value;
                return { ...p, descriptions: newDesc };
            })
        }));
    };
    const addProjectDesc = (projId) => {
        setResumeData(prev => ({
            ...prev,
            projects: prev.projects.map(p => {
                if (p.id !== projId) return p;
                return { ...p, descriptions: [...p.descriptions, "New description"] };
            })
        }));
    };

    // --- Certifications Handlers ---
    const handleCertificationChange = (id, field, value) => {
        setResumeData(prev => ({
            ...prev,
            certifications: prev.certifications.map(c =>
                c.id === id ? { ...c, [field]: value } : c
            )
        }));
    };
    const addCertification = () => {
        setResumeData(prev => ({
            ...prev,
            certifications: [...prev.certifications, {
                id: Date.now().toString(),
                name: "Certification Name",
                institution: "Institution",
                date: ""
            }]
        }));
    };
    const removeCertification = (id) => {
        setResumeData(prev => ({
            ...prev,
            certifications: prev.certifications.filter(c => c.id !== id)
        }));
    };

    // --- Achievements Handlers ---
    const handleAchievementChange = (id, field, value) => {
        setResumeData(prev => ({
            ...prev,
            achievements: prev.achievements.map(a =>
                a.id === id ? { ...a, [field]: value } : a
            )
        }));
    };
    const addAchievement = () => {
        setResumeData(prev => ({
            ...prev,
            achievements: [...prev.achievements, {
                id: Date.now().toString(),
                name: "Achievement Name",
                date: ""
            }]
        }));
    };
    const removeAchievement = (id) => {
        setResumeData(prev => ({
            ...prev,
            achievements: prev.achievements.filter(a => a.id !== id)
        }));
    };

    // --- References Handlers ---
    const handleReferenceChange = (id, field, value) => {
        setResumeData(prev => ({
            ...prev,
            references: prev.references.map(r =>
                r.id === id ? { ...r, [field]: value } : r
            )
        }));
    };
    const addReference = () => {
        setResumeData(prev => ({
            ...prev,
            references: [...prev.references, {
                id: Date.now().toString(),
                name: "Reference Name",
                contact: "Contact Info",
                relationship: "Relationship"
            }]
        }));
    };
    const removeReference = (id) => {
        setResumeData(prev => ({
            ...prev,
            references: prev.references.filter(r => r.id !== id)
        }));
    };

    return (
        <div className="h-screen bg-slate-900 overflow-hidden flex flex-col pt-20">

            {/* Loading overlay — shown while restoring resume from DB on refresh */}
            {isLoadingResume && (
                <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-300 text-sm font-medium">Restoring your resume...</p>
                </div>
            )}

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
                    <button
                        onClick={() => navigate('/mock-interview')}
                        className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-2"
                    >
                        <Mic className="w-3 h-3" />
                        Mock Interview
                    </button>
                    <button
                        id="download-btn"
                        onClick={handleDownload}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-slate-700"
                    >
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <button
                        id="save-btn"
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg flex items-center gap-2 ${
                            saveStatus === 'saved'
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                                : saveStatus === 'error'
                                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 disabled:opacity-60'
                        }`}
                    >
                        {saveStatus === 'saving' && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {saveStatus === 'saved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {saveStatus === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error' : 'Save Changes'}
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
                                        <div className="flex items-center justify-between gap-2">
                                            <input
                                                value={exp.company}
                                                onChange={(e) => handleWorkExperienceChange(exp.id, 'company', e.target.value)}
                                                className="bg-transparent font-bold text-slate-200 text-sm focus:outline-none w-full border-b border-transparent focus:border-slate-600"
                                                placeholder="Company Name"
                                            />
                                            <button onClick={() => removeWorkExperience(exp.id)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-medium text-slate-500">Role</label>
                                                <input
                                                    value={exp.role}
                                                    onChange={(e) => handleWorkExperienceChange(exp.id, 'role', e.target.value)}
                                                    className="w-full bg-slate-800 text-slate-300 text-sm p-1.5 rounded border border-slate-700 focus:border-blue-500 outline-none"
                                                    placeholder="Role"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-medium text-slate-500">Duration</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        value={exp.startDate}
                                                        onChange={(e) => handleWorkExperienceChange(exp.id, 'startDate', e.target.value)}
                                                        className="w-full bg-slate-800 text-slate-300 text-xs p-1.5 rounded border border-slate-700 focus:border-blue-500 outline-none"
                                                        placeholder="Start"
                                                    />
                                                    <input
                                                        value={exp.endDate}
                                                        onChange={(e) => handleWorkExperienceChange(exp.id, 'endDate', e.target.value)}
                                                        className="w-full bg-slate-800 text-slate-300 text-xs p-1.5 rounded border border-slate-700 focus:border-blue-500 outline-none"
                                                        placeholder="End"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2 border-t border-slate-700/50">
                                            {exp.responsibilities.map((resp, idx) => (
                                                <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                                                    <span className="mt-2 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                                                    <textarea
                                                        value={resp}
                                                        onChange={(e) => handleResponsibilityChange(exp.id, idx, e.target.value)}
                                                        className="w-full bg-transparent text-slate-300 focus:outline-none resize-none overflow-hidden"
                                                        rows={1}
                                                        style={{ minHeight: '1.5em' }}
                                                        onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                                                    />
                                                </div>
                                            ))}
                                            <button onClick={() => addResponsibility(exp.id)} className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                                                <Plus className="w-3 h-3" /> Add Responsibility
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={addWorkExperience}
                                    className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-300 border border-slate-600 border-dashed rounded-lg py-2 hover:bg-slate-700 transition-colors"
                                >
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
                                    onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                                    className="w-full min-h-[120px] bg-slate-900 text-white p-3 rounded-xl border border-slate-700 focus:border-blue-500 outline-none leading-relaxed text-sm resize-y"
                                />
                                <button
                                    onClick={() => triggerAIRewrite('summary')}
                                    disabled={isBotTyping}
                                    className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg text-xs font-bold text-blue-300 hover:bg-blue-600/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isBotTyping
                                        ? <><div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" /> AI is writing...</>
                                        : <><Sparkles className="w-3.5 h-3.5" /> Rewrite with AI</>
                                    }
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
                                    <div key={edu.id} className="p-3 bg-slate-900/30 border border-slate-700 rounded-xl space-y-2 relative group">
                                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => removeEducation(edu.id)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <input
                                            value={edu.university}
                                            onChange={(e) => handleEducationChange(edu.id, 'university', e.target.value)}
                                            className="w-full bg-transparent font-medium text-slate-200 text-sm focus:outline-none border-b border-transparent focus:border-slate-600"
                                            placeholder="University"
                                        />
                                        <input
                                            value={edu.degree}
                                            onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                                            className="w-full bg-transparent text-xs text-slate-400 focus:outline-none border-b border-transparent focus:border-slate-600"
                                            placeholder="Degree"
                                        />
                                        <input
                                            value={edu.graduationDate}
                                            onChange={(e) => handleEducationChange(edu.id, 'graduationDate', e.target.value)}
                                            className="w-full bg-transparent text-[10px] text-slate-500 focus:outline-none border-b border-transparent focus:border-slate-600"
                                            placeholder="Year"
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={addEducation}
                                    className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-300 border border-slate-600 border-dashed rounded-lg py-2 hover:bg-slate-700 transition-colors"
                                >
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
                                        <div className="flex justify-between items-center group">
                                            <input
                                                value={cat.name}
                                                onChange={(e) => handleCategoryNameChange(idx, e.target.value)}
                                                className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-transparent focus:outline-none focus:text-slate-200"
                                            />
                                            <button onClick={() => removeSkillCategory(idx)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {cat.skills.map((skill, sIdx) => (
                                                <div key={sIdx} className="group px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs text-slate-300 flex items-center gap-1">
                                                    <input
                                                        value={skill}
                                                        onChange={(e) => handleSkillChange(idx, sIdx, e.target.value)}
                                                        className="bg-transparent w-auto min-w-[20px] focus:outline-none max-w-[100px]"
                                                        style={{ width: `${Math.max(skill.length, 4)}ch` }}
                                                    />
                                                    <button onClick={() => removeSkill(idx, sIdx)} className="w-0 overflow-hidden group-hover:w-auto text-slate-500 hover:text-red-400">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => addSkill(idx)}
                                                className="px-2 py-1 border border-dashed border-slate-600 rounded-md text-xs text-slate-500 hover:text-white hover:bg-slate-800"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={addSkillCategory}
                                    className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-300 border border-slate-600 border-dashed rounded-lg py-2 hover:bg-slate-700 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Category
                                </button>
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
                                        <div className="flex items-center justify-between gap-2">
                                            <input
                                                value={proj.title}
                                                onChange={(e) => handleProjectChange(proj.id, 'title', e.target.value)}
                                                className="bg-transparent font-bold text-slate-200 text-sm focus:outline-none w-full border-b border-transparent focus:border-slate-600"
                                                placeholder="Project Title"
                                            />
                                            <button onClick={() => removeProject(proj.id)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-medium text-slate-500">Duration</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        value={proj.startDate}
                                                        onChange={(e) => handleProjectChange(proj.id, 'startDate', e.target.value)}
                                                        className="w-full bg-slate-800 text-slate-300 text-xs p-1.5 rounded border border-slate-700 focus:border-blue-500 outline-none"
                                                        placeholder="Start"
                                                    />
                                                    <input
                                                        value={proj.endDate}
                                                        onChange={(e) => handleProjectChange(proj.id, 'endDate', e.target.value)}
                                                        className="w-full bg-slate-800 text-slate-300 text-xs p-1.5 rounded border border-slate-700 focus:border-blue-500 outline-none"
                                                        placeholder="End"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pt-2 border-t border-slate-700/50">
                                            {proj.descriptions?.map((desc, idx) => (
                                                <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                                                    <span className="mt-2 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                                                    <textarea
                                                        value={desc}
                                                        onChange={(e) => handleProjectDescChange(proj.id, idx, e.target.value)}
                                                        className="w-full bg-transparent text-slate-300 focus:outline-none resize-none overflow-hidden"
                                                        rows={1}
                                                        style={{ minHeight: '1.5em' }}
                                                        onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                                                    />
                                                </div>
                                            ))}
                                            <button onClick={() => addProjectDesc(proj.id)} className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                                                <Plus className="w-3 h-3" /> Add Description
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={addProject}
                                    className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-300 border border-slate-600 border-dashed rounded-lg py-2 hover:bg-slate-700 transition-colors"
                                >
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
                                    <div className="space-y-4">
                                        {resumeData.references?.map((ref) => (
                                            <div key={ref.id} className="p-3 bg-slate-900/30 border border-slate-700 rounded-xl space-y-3 relative group">
                                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => removeReference(ref.id)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <input
                                                    value={ref.name}
                                                    onChange={(e) => handleReferenceChange(ref.id, 'name', e.target.value)}
                                                    className="w-full bg-transparent font-medium text-slate-200 text-sm focus:outline-none border-b border-transparent focus:border-slate-600"
                                                    placeholder="Reference Name"
                                                />
                                                <input
                                                    value={ref.relationship}
                                                    onChange={(e) => handleReferenceChange(ref.id, 'relationship', e.target.value)}
                                                    className="w-full bg-transparent text-xs text-slate-400 focus:outline-none border-b border-transparent focus:border-slate-600"
                                                    placeholder="Relationship (e.g. Manager)"
                                                />
                                                <input
                                                    value={ref.contact}
                                                    onChange={(e) => handleReferenceChange(ref.id, 'contact', e.target.value)}
                                                    className="w-full bg-transparent text-[10px] text-slate-500 focus:outline-none border-b border-transparent focus:border-slate-600"
                                                    placeholder="Contact Info"
                                                />
                                            </div>
                                        ))}
                                        <button
                                            onClick={addReference}
                                            className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-300 border border-slate-600 border-dashed rounded-lg py-2 hover:bg-slate-700 transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Add Reference
                                        </button>
                                    </div>
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
                                    <div key={cert.id} className="p-3 bg-slate-900/30 border border-slate-700 rounded-xl space-y-2 relative group">
                                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => removeCertification(cert.id)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <input
                                            value={cert.name}
                                            onChange={(e) => handleCertificationChange(cert.id, 'name', e.target.value)}
                                            className="w-full bg-transparent font-medium text-slate-200 text-sm focus:outline-none border-b border-transparent focus:border-slate-600"
                                            placeholder="Certification Name"
                                        />
                                        <input
                                            value={cert.institution}
                                            onChange={(e) => handleCertificationChange(cert.id, 'institution', e.target.value)}
                                            className="w-full bg-transparent text-xs text-slate-400 focus:outline-none border-b border-transparent focus:border-slate-600"
                                            placeholder="Institution"
                                        />
                                        <input
                                            value={cert.date}
                                            onChange={(e) => handleCertificationChange(cert.id, 'date', e.target.value)}
                                            className="w-full bg-transparent text-[10px] text-slate-500 focus:outline-none border-b border-transparent focus:border-slate-600"
                                            placeholder="Date"
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={addCertification}
                                    className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-300 border border-slate-600 border-dashed rounded-lg py-2 hover:bg-slate-700 transition-colors"
                                >
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
                                {resumeData.achievements?.map((ach) => (
                                    <div key={ach.id} className="p-3 bg-slate-900/30 border border-slate-700 rounded-xl space-y-1 relative group">
                                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => removeAchievement(ach.id)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <input
                                            value={ach.name}
                                            onChange={(e) => handleAchievementChange(ach.id, 'name', e.target.value)}
                                            className="w-full bg-transparent font-medium text-slate-200 text-sm focus:outline-none border-b border-transparent focus:border-slate-600"
                                            placeholder="Achievement"
                                        />
                                        <input
                                            value={ach.date}
                                            onChange={(e) => handleAchievementChange(ach.id, 'date', e.target.value)}
                                            className="w-full bg-transparent text-[10px] text-slate-500 focus:outline-none border-b border-transparent focus:border-slate-600"
                                            placeholder="Date"
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={addAchievement}
                                    className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-300 border border-slate-600 border-dashed rounded-lg py-2 hover:bg-slate-700 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Achievement
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* MIDDLE: Chat Interface (4 cols) */}
                <div className="col-span-12 lg:col-span-4 h-full min-h-0 flex flex-col">
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl flex flex-col overflow-hidden relative backdrop-blur-sm flex-1 min-h-0">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-700/50 bg-slate-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">CareerLens AI</h3>
                                    <p className="text-slate-400 text-xs">{isBotTyping ? 'Thinking...' : 'Assistant'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* JD Status indicator */}
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    jdLoaded
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                }`}>
                                    <Briefcase className="w-2.5 h-2.5" />
                                    {jdLoaded ? 'JD Loaded' : 'No JD'}
                                </div>
                                <button
                                    onClick={() => setMessages([{ id: 1, text: "Hi! I'm CareerLens AI. I have access to your resume and the job description. Ask me to rewrite sections, improve bullet points, optimize for ATS, or tailor your resume for the JD!", sender: 'bot' }])}
                                    className="text-slate-400 hover:text-white text-xs transition-colors"
                                >Clear</button>
                            </div>
                        </div>

                        {/* Messages — scrollable area, grows to fill remaining space */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] space-y-1 min-w-0`}>
                                        <div className={`rounded-2xl p-3 text-sm leading-relaxed break-words whitespace-pre-wrap ${
                                            msg.sender === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-sm'
                                            : msg.isError
                                            ? 'bg-red-900/30 border border-red-500/30 text-red-300 rounded-tl-sm'
                                            : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm shadow-sm'
                                        }`}>
                                            {msg.text}
                                        </div>
                                        {msg.hasUpdates && (
                                            <div className="flex items-center gap-1.5 px-1">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                <span className="text-[10px] text-emerald-400 font-medium">Resume Updated</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {/* Bot typing indicator */}
                            {isBotTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm p-3 shadow-sm flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area — always pinned to bottom */}
                        <div className="shrink-0 p-4 bg-slate-800/50 border-t border-slate-700/50">
                            <form onSubmit={handleSendMessage} className="relative">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={isBotTyping ? "AI is thinking..." : "Ask me to improve your resume..."}
                                    disabled={isBotTyping}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isBotTyping}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isBotTyping
                                        ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <Send className="w-3.5 h-3.5" />
                                    }
                                </button>
                            </form>
                            <p className="text-center text-[10px] text-slate-600 mt-2">
                                AI has access to your resume &amp; JD. Changes are applied instantly.
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
                                        onClick={() => setIsFullScreen(true)}
                                        className="h-6 px-3 flex items-center justify-center hover:bg-slate-600 rounded-md text-slate-300 transition-all gap-1.5"
                                    >
                                        <Maximize2 className="w-3 h-3" />
                                        <span className="text-[10px] font-bold">View</span>
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
                                            <div className="origin-top transition-transform duration-200" style={{ width: containerSize.width ? containerSize.width * 0.9 : '90%' }}>
                                                {containerSize.width > 0 && (
                                                    <Page
                                                        pageNumber={pageNumber}
                                                        width={containerSize.width * 0.9}
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
                                    <div className="min-h-full flex justify-center py-8 px-4" style={{ transformOrigin: 'top center' }}>
                                        <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl origin-top" style={{ width: containerSize.width ? containerSize.width * 0.9 : '210mm' }}>
                                            <div id="resume-preview-content" className="w-full h-full bg-white">
                                                <ResumePreview data={previewData} templateId={templateId} />
                                            </div>
                                        </div>
                                    </div>
                                ) : viewMode === 'pdf' && parsedData?.formattedText ? (
                                    <div className="min-h-full flex justify-center py-8 px-4">
                                        <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-8 whitespace-pre-wrap font-mono text-[10px] text-slate-800" style={{ transformOrigin: 'top center', width: containerSize.width ? containerSize.width * 0.9 : '210mm' }}>
                                            {parsedData.formattedText}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                                            <FileText className="w-6 h-6 text-slate-600" />
                                        </div>
                                        <p className="text-xs">{templateId ? 'Template Active. Switch to Live Preview to see content.' : 'No resume uploaded'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Screen View Overlay */}
            {isFullScreen && (
                <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex flex-col justify-center items-center p-4 md:p-10">
                    <button 
                        onClick={() => setIsFullScreen(false)}
                        className="absolute top-6 right-6 p-2 bg-slate-800 text-slate-300 hover:text-white rounded-full hover:bg-slate-700 transition-colors z-50 shadow-lg border border-slate-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    
                    <div className="w-full max-w-5xl h-full bg-slate-800/50 rounded-2xl overflow-y-auto custom-scrollbar-light relative shadow-2xl flex justify-center py-10 border border-slate-700/50">
                        {viewMode === 'pdf' && fileUrl ? (
                            <Document
                                file={fileUrl}
                                loading={<div className="animate-spin text-blue-500 rounded-full border-2 border-current border-t-transparent h-8 w-8 mt-20" />}
                                className="w-full flex justify-center"
                            >
                                <Page 
                                    pageNumber={pageNumber} 
                                    width={typeof window !== 'undefined' ? window.innerWidth * 0.6 : 800} 
                                    renderTextLayer={false} 
                                    renderAnnotationLayer={false}
                                    className="shadow-2xl"
                                />
                            </Document>
                        ) : viewMode === 'template' ? (
                            <div className="w-[210mm] h-max min-h-[297mm] bg-white shadow-2xl mx-auto transform scale-[1.1] origin-top mb-10">
                                <ResumePreview data={previewData} templateId={templateId} />
                            </div>
                        ) : viewMode === 'pdf' && parsedData?.formattedText ? (
                            <div className="w-[210mm] h-max whitespace-pre-wrap font-mono text-sm text-slate-800 p-10 bg-white mx-auto shadow-2xl">
                                {parsedData.formattedText}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
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
