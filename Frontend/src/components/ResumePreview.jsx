import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Globe, Briefcase } from 'lucide-react';

const ResumePreview = ({ data, templateId = 't1' }) => {
    // Defines which underlying layout structure to use
    // 'modern' = sidebar left, 'classic' = stacked, 'balanced' = slightly wider margins 
    const getLayoutType = (id) => {
        const modern = ['t2', 't3', 't8', 't10', 't12', 't13', 't14', 't16'];
        if (modern.includes(id)) return 'modern';
        return 'classic';
    };

    const layout = getLayoutType(templateId);

    // Color and Font mapping based on Template ID
    const styles = {
        't1': { // Standard Default (Professional/ATS-Maximized)
            accent: 'text-slate-900', bg: 'bg-white', border: 'border-slate-300',
            font: 'font-serif', headerBg: 'bg-white', textTitle: 'font-bold text-2xl border-b-2 border-slate-800 pb-2 mb-2 uppercase tracking-widest'
        },
        't2': { // Modern (Clean Sidebar)
            accent: 'text-slate-800', bg: 'bg-slate-50', border: 'border-slate-300',
            font: 'font-sans', headerBg: 'bg-slate-800 text-white', textTitle: 'font-bold tracking-tight'
        },
        't3': { // Creative (Professional Accent)
            accent: 'text-teal-700', bg: 'bg-white', border: 'border-teal-100',
            font: 'font-sans', headerBg: 'bg-teal-50', textTitle: 'font-extrabold tracking-tight text-teal-800'
        },
        't4': { // Classic
            accent: 'text-slate-800', bg: 'bg-white', border: 'border-slate-800',
            font: 'font-serif', headerBg: 'bg-transparent', textTitle: 'font-bold underline'
        },
        't5': { // Balanced
            accent: 'text-indigo-700', bg: 'bg-slate-50', border: 'border-indigo-200',
            font: 'font-sans', headerBg: 'bg-white', textTitle: 'uppercase font-semibold'
        },
        't6': { // Minimalist
            accent: 'text-gray-900', bg: 'bg-white', border: 'border-gray-200',
            font: 'font-mono', headerBg: 'bg-transparent', textTitle: 'tracking-tight font-light'
        },
        't7': { // Professional
            accent: 'text-blue-900', bg: 'bg-white', border: 'border-blue-900',
            font: 'font-serif', headerBg: 'bg-slate-100', textTitle: 'uppercase font-bold'
        },
        't8': { // Corporate
            accent: 'text-sky-700', bg: 'bg-white', border: 'border-sky-700',
            font: 'font-sans', headerBg: 'bg-sky-800 text-white', textTitle: 'font-bold'
        },
        't9': { // Bold
            accent: 'text-rose-600', bg: 'bg-white', border: 'border-rose-600',
            font: 'font-sans', headerBg: 'bg-transparent', textTitle: 'font-black uppercase text-xl'
        },
        't10': { // Slate
            accent: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-400',
            font: 'font-sans', headerBg: 'bg-slate-800 text-white', textTitle: 'font-medium uppercase'
        },
        't11': { // Professional Compact
            accent: 'text-teal-700', bg: 'bg-white', border: 'border-teal-700',
            font: 'font-sans', headerBg: 'bg-transparent', textTitle: 'uppercase font-bold text-center border-b-2'
        },
        't12': { // Executive
            accent: 'text-violet-800', bg: 'bg-violet-50', border: 'border-violet-300',
            font: 'font-serif', headerBg: 'bg-white', textTitle: 'border-l-4 pl-2 font-bold'
        },
        't13': { // Insight
            accent: 'text-indigo-900', bg: 'bg-white', border: 'border-indigo-900',
            font: 'font-sans', headerBg: 'bg-indigo-900 text-white', textTitle: 'uppercase tracking-wider font-bold'
        },
        't14': { // Atelier
            accent: 'text-amber-700', bg: 'bg-stone-50', border: 'border-amber-700',
            font: 'font-serif', headerBg: 'bg-stone-200', textTitle: 'italic font-serif'
        },
        't15': { // Elegant
            accent: 'text-cyan-800', bg: 'bg-white', border: 'border-cyan-800',
            font: 'font-serif', headerBg: 'bg-transparent', textTitle: 'uppercase text-center border-t border-b py-1'
        },
        't16': { // Aqua
            accent: 'text-cyan-600', bg: 'bg-cyan-50/30', border: 'border-cyan-200',
            font: 'font-sans', headerBg: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white', textTitle: 'font-bold'
        }
    };

    const currentStyle = styles[templateId || 't1'] || styles['t1'];

    // --- Modern Sidebar Layout ---
    if (layout === 'modern') {
        const isHeaderDark = ['t8', 't10', 't13', 't16'].includes(templateId);
        const sidebarBg = isHeaderDark ? 'bg-slate-100' : 'bg-slate-50';

        return (
            <div className={`w-full h-full bg-white text-slate-800 ${currentStyle.font} flex text-[11px] leading-relaxed shadow-lg overflow-hidden`}>

                {/* Sidebar */}
                <div className={`w-[32%] ${sidebarBg} flex flex-col border-r ${currentStyle.border.replace('text', 'border')} border-opacity-20`}>

                    {/* Sidebar Header (Photo/Name if styled that way) */}
                    <div className={`p-6 pb-2 ${templateId === 't13' ? 'bg-indigo-900 text-white' : ''}`}>
                        {data.personalInfo.photo && (
                            <img src={data.personalInfo.photo} className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-sm" alt="Profile" />
                        )}
                        {templateId === 't13' && (
                            <div className="text-center">
                                <h1 className="text-xl font-bold uppercase">{data.personalInfo.name}</h1>
                                <p className="text-indigo-200 text-xs mt-1">{data.personalInfo.title}</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 pt-0 flex-1 flex flex-col gap-8">
                        {/* Contact - Sidebar */}
                        <div className="space-y-3 mt-6">
                            <h3 className={`text-xs font-bold uppercase ${currentStyle.accent} border-b ${currentStyle.border} pb-1 mb-2`}>Contact</h3>
                            <div className="space-y-2.5 opacity-90">
                                <ContactItem icon={Mail} text={data.personalInfo.email} />
                                <ContactItem icon={Phone} text={data.personalInfo.phone} />
                                <ContactItem icon={MapPin} text={data.personalInfo.city} />
                                <ContactItem icon={Linkedin} text={data.personalInfo.linkedin} />
                                <ContactItem icon={Globe} text={data.personalInfo.website} />
                            </div>
                        </div>

                        {/* Education - Sidebar */}
                        <div className="space-y-3">
                            <h3 className={`text-xs font-bold uppercase ${currentStyle.accent} border-b ${currentStyle.border} pb-1 mb-2`}>Education</h3>
                            <div className="space-y-4">
                                {data.education.map(edu => (
                                    <div key={edu.id}>
                                        <div className="font-bold text-slate-800">{edu.university}</div>
                                        <div className="text-slate-600">{edu.degree}</div>
                                        <div className="text-[10px] text-slate-500 italic mt-0.5">{edu.graduationDate}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Skills - Sidebar */}
                        <div className="space-y-3">
                            <h3 className={`text-xs font-bold uppercase ${currentStyle.accent} border-b ${currentStyle.border} pb-1 mb-2`}>Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.skills.categories.flatMap(cat => cat.skills).map((skill, i) => (
                                    <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 font-medium text-[10px] shadow-sm">{skill}</span>
                                ))}
                            </div>
                        </div>

                        {/* Certifications - Sidebar */}
                        {data.certifications && data.certifications.length > 0 && (
                            <div className="space-y-3">
                                <h3 className={`text-xs font-bold uppercase ${currentStyle.accent} border-b ${currentStyle.border} pb-1 mb-2`}>Certifications</h3>
                                <div className="space-y-2">
                                    {data.certifications.map(cert => (
                                        <div key={cert.id}>
                                            <div className="font-bold text-slate-800">{cert.name}</div>
                                            <div className="text-[10px] text-slate-500 italic">{cert.institution}, {cert.date}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Achievements - Sidebar */}
                        {data.achievements && data.achievements.length > 0 && (
                            <div className="space-y-3">
                                <h3 className={`text-xs font-bold uppercase ${currentStyle.accent} border-b ${currentStyle.border} pb-1 mb-2`}>Achievements</h3>
                                <div className="space-y-2">
                                    {data.achievements.map(ach => (
                                        <div key={ach.id}>
                                            <div className="font-bold text-slate-800">{ach.name}</div>
                                            <div className="text-[10px] text-slate-500 italic">{ach.date}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    {/* Header Area (if not in sidebar) */}
                    {templateId !== 't13' && (
                        <div className={`px-8 py-8 ${currentStyle.headerBg} ${isHeaderDark ? 'text-white' : ''}`}>
                            <h1 className={`text-3xl font-bold mb-2 ${!isHeaderDark ? currentStyle.accent : ''} uppercase tracking-tight`}>{data.personalInfo.name}</h1>
                            <p className={`text-sm font-medium ${!isHeaderDark ? 'text-slate-500' : 'text-slate-200'} tracking-wide uppercase`}>{data.personalInfo.title}</p>
                        </div>
                    )}

                    <div className="p-8 pt-4 flex-1 flex flex-col gap-6">
                        {/* Summary */}
                        <div className="space-y-2">
                            <h3 className={`text-xs font-bold uppercase ${currentStyle.accent} border-b ${currentStyle.border} pb-1`}>Profile</h3>
                            <p className="text-slate-600 leading-relaxed text-justify">{data.summary}</p>
                        </div>

                        {/* Experience */}
                        <div className="space-y-4">
                            <h3 className={`text-xs font-bold uppercase ${currentStyle.accent} border-b ${currentStyle.border} pb-1`}>Experience</h3>
                            {data.workExperience.map(exp => (
                                <div key={exp.id} className="space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <div className="font-bold text-slate-800 text-sm">{exp.role}</div>
                                        <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium">{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                    <div className={`font-semibold ${currentStyle.accent} text-xs uppercase tracking-wide opacity-90`}>{exp.company}</div>
                                    <ul className="list-disc list-outside ml-4 text-slate-600 space-y-1 mt-2">
                                        {exp.responsibilities.map((resp, i) => (
                                            <li key={i} className="pl-1 marker:text-slate-400">{resp}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Projects */}
                        <div className="space-y-4">
                            <h3 className={`text-xs font-bold uppercase ${currentStyle.accent} border-b ${currentStyle.border} pb-1`}>Projects</h3>
                            {data.projects.map(proj => (
                                <div key={proj.id} className="space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <div className="font-bold text-slate-800 text-sm">{proj.title}</div>
                                        <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium">{proj.startDate} - {proj.endDate}</span>
                                    </div>
                                    <ul className="list-disc list-outside ml-4 text-slate-600 space-y-1 mt-2">
                                        {proj.descriptions?.map((desc, i) => (
                                            <li key={i} className="pl-1 marker:text-slate-400">{desc}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Classic Single Column Layout ---
    return (
        <div className={`w-full h-full bg-white text-slate-800 ${currentStyle.font} p-10 md:p-14 text-[11px] leading-relaxed shadow-lg`}>

            {/* Header */}
            <header className={`mb-8 border-b-2 ${currentStyle.border} pb-6 ${templateId === 't11' || templateId === 't15' ? 'text-center' : ''}`}>
                <h1 className={`text-4xl font-bold ${currentStyle.accent} ${currentStyle.textTitle} mb-3`}>{data.personalInfo.name}</h1>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-widest mb-4">{data.personalInfo.title}</p>

                <div className={`flex flex-wrap gap-x-6 gap-y-2 text-slate-500 font-sans text-[10px] ${templateId === 't11' || templateId === 't15' ? 'justify-center' : ''}`}>
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {data.personalInfo.email}</span>
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {data.personalInfo.phone}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {data.personalInfo.city}</span>
                    {data.personalInfo.linkedin && <span className="flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5" /> {data.personalInfo.linkedin}</span>}
                </div>
            </header>

            <div className="space-y-7">
                {/* Summary */}
                <section>
                    <h2 className={`text-sm font-bold uppercase tracking-widest border-b ${currentStyle.border} pb-1.5 mb-3 ${currentStyle.accent}`}>Professional Summary</h2>
                    <p className="text-justify text-slate-700">{data.summary}</p>
                </section>

                {/* Experience */}
                <section>
                    <h2 className={`text-sm font-bold uppercase tracking-widest border-b ${currentStyle.border} pb-1.5 mb-4 ${currentStyle.accent}`}>Experience</h2>
                    <div className="space-y-6">
                        {data.workExperience.map(exp => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-slate-900 text-sm">{exp.role}</h3>
                                    <span className="font-semibold text-slate-600 text-xs">{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <div className={`mb-2 font-medium ${currentStyle.accent} italic`}>{exp.company}</div>
                                <ul className="list-disc list-outside ml-5 space-y-1 text-slate-700">
                                    {exp.responsibilities.map((resp, i) => (
                                        <li key={i}>{resp}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Projects */}
                <section>
                    <h2 className={`text-sm font-bold uppercase tracking-widest border-b ${currentStyle.border} pb-1.5 mb-4 ${currentStyle.accent}`}>Key Projects</h2>
                    <div className="space-y-5">
                        {data.projects.map(proj => (
                            <div key={proj.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-slate-900 text-sm">{proj.title}</h3>
                                    <span className="font-semibold text-slate-600 text-xs">{proj.startDate} - {proj.endDate}</span>
                                </div>
                                <ul className="list-disc list-outside ml-5 space-y-1 text-slate-700 mt-2">
                                    {proj.descriptions?.map((desc, i) => (
                                        <li key={i}>{desc}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Education */}
                    <section>
                        <h2 className={`text-sm font-bold uppercase tracking-widest border-b ${currentStyle.border} pb-1.5 mb-4 ${currentStyle.accent}`}>Education</h2>
                        <div className="space-y-4">
                            {data.education.map(edu => (
                                <div key={edu.id}>
                                    <div className="font-bold text-slate-900">{edu.university}</div>
                                    <div className="text-slate-700">{edu.degree}</div>
                                    <div className="text-slate-500 italic text-[10px] mt-0.5">{edu.graduationDate}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Skills */}
                    <section>
                        <h2 className={`text-sm font-bold uppercase tracking-widest border-b ${currentStyle.border} pb-1.5 mb-4 ${currentStyle.accent}`}>Technical Skills</h2>
                        <div className="space-y-3">
                            {data.skills.categories.map((cat, i) => (
                                <div key={i}>
                                    <div className="font-bold text-slate-700 text-xs mb-1">{cat.name}</div>
                                    <div className="text-slate-600 leading-snug">{cat.skills.join(", ")}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
                    {/* Certifications */}
                    {data.certifications && data.certifications.length > 0 && (
                        <section>
                            <h2 className={`text-sm font-bold uppercase tracking-widest border-b ${currentStyle.border} pb-1.5 mb-4 ${currentStyle.accent}`}>Certifications</h2>
                            <div className="space-y-2">
                                {data.certifications.map(cert => (
                                    <div key={cert.id}>
                                        <div className="font-bold text-slate-900">{cert.name}</div>
                                        <div className="text-slate-600 italic text-[10px]">{cert.institution} | {cert.date}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Achievements */}
                    {data.achievements && data.achievements.length > 0 && (
                        <section>
                            <h2 className={`text-sm font-bold uppercase tracking-widest border-b ${currentStyle.border} pb-1.5 mb-4 ${currentStyle.accent}`}>Achievements</h2>
                            <div className="space-y-2">
                                {data.achievements.map(ach => (
                                    <div key={ach.id}>
                                        <div className="font-bold text-slate-900">{ach.name}</div>
                                        <div className="text-slate-600 italic text-[10px]">{ach.date}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

const ContactItem = ({ icon: Icon, text }) => {
    if (!text) return null;
    return (
        <div className="flex items-center gap-2.5 text-[10px]">
            <Icon className="w-3.5 h-3.5 opacity-80 shrink-0" />
            <span className="truncate">{text.replace(/https?:\/\//, '')}</span>
        </div>
    );
};

export default ResumePreview;
