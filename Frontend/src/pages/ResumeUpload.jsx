/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, Loader2, ArrowRight } from 'lucide-react';

import { FadeIn, ScaleIn } from '../components/Animations';
import Magnetic from '../components/Magnetic';

// Configure PDF.js worker
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const extractTextFromPDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument(arrayBuffer).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            let lastY, text = '';
            for (let item of textContent.items) {
                if (lastY == item.transform[5] || !lastY) {
                    text += item.str + "  "; // Same line (or first item): add space
                } else {
                    text += '\n' + item.str + "  "; // New line: add newline
                }
                lastY = item.transform[5];
            }
            fullText += text + '\n';
        }
        return fullText;
    } catch (error) {
        console.error("Error parsing PDF:", error);
        return "";
    }
};

const parseResumeText = (text) => {
    // Helper to clean text
    const clean = (str) => str ? str.trim() : "";

    // 1. Basic Regex for Contact Info
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const phoneRegex = /([+]?\d{1,2}[.-\s]?)?(\d{3}[.-\s]?){2}\d{4}/;
    const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9-]+/;
    const githubRegex = /github\.com\/[a-zA-Z0-9-]+/;

    const emailMatch = text.match(emailRegex);
    const phoneMatch = text.match(phoneRegex);
    const linkedinMatch = text.match(linkedinRegex);
    const githubMatch = text.match(githubRegex);

    // 2. Identify Name (First non-empty line with words)
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let name = "Your Name";
    let title = "";

    if (lines.length > 0) {
        // Assume first line is name
        name = lines[0];
        // Assume second line might be title if it's short and not a contact info
        if (lines.length > 1 && lines[1].length < 50 && !lines[1].match(emailRegex) && !lines[1].match(phoneRegex)) {
            title = lines[1];
        }
    }

    // 3. Section Keyword Mapping
    const SECTIONS = {
        WORK: ['experience', 'work history', 'employment', 'professional experience', 'work experience', 'professional background'],
        EDUCATION: ['education', 'academic', 'qualifications', 'education & qualifications'],
        SKILLS: ['skills', 'technologies', 'technical skills', 'core competencies', 'skills & expertise', 'technical proficiencies'],
        PROJECTS: ['projects', 'key projects', 'academic projects', 'personal projects'],
        SUMMARY: ['summary', 'professional summary', 'profile', 'objective', 'about me']
    };

    let currentSection = null;
    const parsedSections = {
        SUMMARY: [],
        WORK: [],
        EDUCATION: [],
        SKILLS: [],
        PROJECTS: []
    };

    // 4. Iterate and bucket lines
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();

        // Skip name/contact lines from processing into sections if we are at top
        if (i < 3 && (line === name || line === title || line.includes(emailMatch?.[0]))) continue;

        // Check for Header
        let isHeader = false;
        if (line.length < 50) {
            for (const [sectionKey, keywords] of Object.entries(SECTIONS)) {
                if (keywords.some(k => lowerLine === k || lowerLine.startsWith(k + " ") || lowerLine === k + ":")) {
                    currentSection = sectionKey;
                    isHeader = true;
                    break;
                }
            }
        }

        if (!isHeader && currentSection) {
            parsedSections[currentSection].push(line);
        } else if (!isHeader && !currentSection && i > 3) {
            // If strictly no section found yet, maybe it's summary?
            // Only add to summary if it's not looking like a header
            if (lines.length > 0 && parsedSections.SUMMARY.length < 6) {
                // Heuristic: Don't add if it looks like garbage
                if (line.length > 3) parsedSections.SUMMARY.push(line);
            }
        }
    }

    // 5. Structure the Data for Editor

    // --- Process Work Experience ---
    // Try to split by lines containing dates (e.g. "Jan 2020", "2020 - 2021", "Present")
    // Also include "MM/YYYY" format
    const datePattern = /((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?[\s-]?\d{4})|(\d{1,2}\/\d{4})|(\d{4}\s?-\s?(present|current|\d{4}))|(\d{4}\s?to\s?(present|current|\d{4}))/i;

    const workExperience = [];
    if (parsedSections.WORK.length > 0) {
        let currentJob = { id: 1, company: "Experience Details", role: "", startDate: "", endDate: "", responsibilities: [] };

        parsedSections.WORK.forEach(line => {
            // If line has a date, assume it's a metadata line for a new job or current job
            if (line.match(datePattern)) {
                if (currentJob.responsibilities.length > 0 || currentJob.role) {
                    workExperience.push({ ...currentJob, id: workExperience.length + 1 });
                    currentJob = { id: workExperience.length + 2, company: "Previous Role", role: "", startDate: "", endDate: "", responsibilities: [] };
                }
                // Try to extract date
                const match = line.match(datePattern);
                currentJob.startDate = match ? match[0] : "";
                // Guess role is what's left
                let possibleRole = line.replace(match ? match[0] : "", "").trim();
                if (possibleRole.length > 3) currentJob.role = possibleRole;
                else currentJob.role = "Role / Title";
            } else {
                // Heuristic: UPPERCASE line could be Company
                if (line === line.toUpperCase() && line.length > 3 && line.length < 50 && !currentJob.role) {
                    currentJob.company = line;
                } else if (line.toLowerCase().includes('engineer') || line.toLowerCase().includes('developer') || line.toLowerCase().includes('manager')) {
                    if (!currentJob.role || currentJob.role === "Role / Title") currentJob.role = line;
                } else {
                    currentJob.responsibilities.push(line);
                }
            }
        });
        if (currentJob.responsibilities.length > 0 || currentJob.role) workExperience.push(currentJob);
    }

    // --- Process Education ---
    const education = [];
    if (parsedSections.EDUCATION.length > 0) {
        let currentEdu = { id: 1, university: "", degree: "", graduationDate: "" };
        parsedSections.EDUCATION.forEach((line, idx) => {
            // Heuristic: Look for "Bachelor", "Master", "B.Tech", "Degree"
            if (line.match(/(bachelor|master|b\.?tech|degree|diploma|phd|m\.?tech)/i)) {
                if (currentEdu.degree) {
                    education.push({ ...currentEdu, id: education.length + 1 });
                    currentEdu = { id: education.length + 2, university: "", degree: "", graduationDate: "" };
                }
                currentEdu.degree = line;
            } else if (line.match(datePattern) || line.match(/\d{4}/)) {
                currentEdu.graduationDate = line;
            } else {
                if (!currentEdu.university) currentEdu.university = line;
            }
        });
        if (currentEdu.university || currentEdu.degree) education.push(currentEdu);
    }

    // --- Process Skills ---
    // Often comma separated or bulleted
    let allSkills = [];
    parsedSections.SKILLS.forEach(line => {
        if (line.includes(',') && line.length > 20) {
            allSkills = [...allSkills, ...line.split(',').map(s => s.trim())];
        } else if (line.includes('|')) {
            allSkills = [...allSkills, ...line.split('|').map(s => s.trim())];
        } else {
            // Remove bullets and trim
            // eslint-disable-next-line no-useless-escape
            const cleaned = line.replace(/^[•\-\*]\s*/, "").trim();
            if (cleaned) allSkills.push(cleaned);
        }
    });

    // Dynamic Categorization
    const SKILL_CATEGORIES = {
        "AI & Machine Learning": ['python', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'nlp', 'computer vision', 'rag', 'langchain', 'llamaindex', 'openai', 'agentic ai', 'deep learning'],
        "Frontend Development": ['react', 'javascript', 'typescript', 'html', 'css', 'tailwind', 'redux', 'next.js', 'vue', 'angular', 'bootstrap', 'figma'],
        "Backend & Database": ['node', 'express', 'mongodb', 'sql', 'postgresql', 'mysql', 'firebase', 'aws', 'docker', 'kubernetes', 'api', 'rest', 'graphql', 'fastapi', 'flask', 'django', 'java', 'c++'],
        "Tools & Platforms": ['git', 'github', 'jira', 'postman', 'vscode', 'linux', 'azure', 'gcp', 'jenkins', 'ci/cd']
    };

    let categorizedSkills = [];
    let usedSkills = new Set();

    // 1. Try to find categories for skills
    for (const [category, keywords] of Object.entries(SKILL_CATEGORIES)) {
        const skillsInThisCategory = allSkills.filter(skill => {
            const s = skill.toLowerCase();
            return keywords.some(k => s.includes(k));
        });

        if (skillsInThisCategory.length > 0) {
            // Filter out duplicates within the category loop just in case, though filter handles it
            const unique = [...new Set(skillsInThisCategory)];
            categorizedSkills.push({ name: category, skills: unique });
            unique.forEach(s => usedSkills.add(s));
        }
    }

    // 2. Add remaining skills to "Other Skills" or "Technical Skills" if not categorized
    const remainingSkills = allSkills.filter(s => !usedSkills.has(s));
    if (remainingSkills.length > 0) {
        categorizedSkills.push({ name: "Technical Skills", skills: [...new Set(remainingSkills)] });
    }

    // Fallback if no categorization happened (e.g. niche skills)
    if (categorizedSkills.length === 0 && allSkills.length > 0) {
        categorizedSkills.push({ name: "Key Skills", skills: [...new Set(allSkills)] });
    }
    // --- Process Projects ---
    const projects = [];
    if (parsedSections.PROJECTS.length > 0) {
        let currentProj = { id: 1, title: "", startDate: "", endDate: "", descriptions: [] };
        parsedSections.PROJECTS.forEach(line => {
            // Heuristic: Header-like lines
            if (line.length < 60 && (line === line.toUpperCase() || line.endsWith(':') || line.match(/project/i))) {
                if (currentProj.descriptions.length > 0 || currentProj.title) {
                    projects.push({ ...currentProj, id: projects.length + 1 });
                    currentProj = { id: projects.length + 2, title: line.replace(':', ''), startDate: "", endDate: "", descriptions: [] };
                } else {
                    currentProj.title = line.replace(':', '');
                }
            } else {
                if (line.length > 3) currentProj.descriptions.push(line);
            }
        });
        if (currentProj.title || currentProj.descriptions.length > 0) {
            if (!currentProj.title) currentProj.title = "Project";
            projects.push(currentProj);
        }
    }

    return {
        personalInfo: {
            name: clean(name),
            title: clean(title),
            email: emailMatch ? emailMatch[0] : "",
            phone: phoneMatch ? phoneMatch[0] : "",
            city: "",
            linkedin: linkedinMatch ? linkedinMatch[0] : "",
            website: githubMatch ? githubMatch[0] : "",
            photo: null
        },
        summary: parsedSections.SUMMARY.join(' ') || "Summary not automatically detected.",
        workExperience: workExperience.length ? workExperience : [],
        education: education.length ? education : [],
        skills: {
            categories: categorizedSkills
        },
        projects: projects.length ? projects : [],
        references: [],
        certifications: [],
        achievements: [],
        referencesHidden: true,
        isParsed: true,
        formattedText: text
    };
};

const ResumeUpload = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const handleUpload = async (file) => {
        setFile(file);
        setUploading(true);

        // Improve UX: Wait a bit to show loading state if parsing is fast
        setTimeout(() => {
            setUploading(false);
            setUploaded(true);
        }, 1500);
    };

    const handleContinue = async () => {
        if (file) {
            setUploading(true);

            // Read file as Data URL (Base64) for persistence across navigation
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const fileUrl = reader.result; // Base64 string
                let parsedData;

                if (file.type === "application/pdf") {
                    const text = await extractTextFromPDF(file);
                    parsedData = parseResumeText(text);
                } else {
                    parsedData = {
                        personalInfo: { name: "User" },
                        summary: "Content could not be parsed automatically.",
                        workExperience: [],
                        education: [],
                        skills: { categories: [] }
                    };
                }

                setUploading(false);

                // Navigate to Templates page
                navigate('/resume-templates', {
                    state: {
                        mode: 'preview',
                        fileUrl, // Now a specific Base64 string
                        fileName: file.name,
                        parsedData
                    }
                });
            };
        }
    };

    const [isDragging, setIsDragging] = useState(false);

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".docx"))) {
            handleUpload(droppedFile);
        }
    };

    const onFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            handleUpload(selectedFile);
        }
    };

    return (
        <div
            className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center p-4"
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

            <ScaleIn>
                <div className="relative w-full max-w-xl bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-8 md:p-12 rounded-3xl shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-blue-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Upload Your Resume</h2>
                        <p className="text-slate-400">
                            Upload your CV to auto-fill templates and get AI analysis.
                        </p>
                    </div>

                    {!file ? (
                        <div className="relative group">
                            <label
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group-hover:scale-[1.02] ${isDragging
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/50'
                                    }`}
                            >
                                <input
                                    type="file"
                                    accept=".pdf,.docx"
                                    className="hidden"
                                    onChange={onFileSelect}
                                />
                                <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                                    <UploadCloud className={`w-6 h-6 transition-colors ${isDragging ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'}`} />
                                </div>
                                <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
                                <p className="text-slate-500 text-sm">PDF or DOCX (max 5MB)</p>
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{file.name}</p>
                                        <p className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <div>
                                    {uploading ? (
                                        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                                    )}
                                </div>
                            </motion.div>

                            {uploaded && (
                                <FadeIn delay={0.2}>
                                    <Magnetic>
                                        <button
                                            onClick={handleContinue}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
                                        >
                                            Next: Select Template
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Magnetic>
                                </FadeIn>
                            )}
                        </div>
                    )}
                </div>
            </ScaleIn>
        </div>
    );
};

export default ResumeUpload;
