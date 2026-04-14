import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  useLocalParticipant,
  BarVisualizer,
  useRoomContext,
} from '@livekit/components-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Mic, MicOff, AlertCircle, FileText,
  Briefcase, ChevronRight, ChevronLeft, Check, Loader2,
  User, Sparkles, MessageSquare, Phone,
  RefreshCw, Plus, Search
} from 'lucide-react';
import axios from 'axios';
import '@livekit/components-styles';

/* ─────────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────────── */
const StepIndicator = ({ currentStep, steps }) => (
  <div className="flex items-center justify-center gap-2 mb-10">
    {steps.map((step, idx) => {
      const isComplete = idx < currentStep;
      const isActive = idx === currentStep;
      return (
        <React.Fragment key={idx}>
          <div className="flex items-center gap-2">
            <motion.div
              initial={false}
              animate={{
                backgroundColor: isComplete ? '#3b82f6' : isActive ? '#6366f1' : '#1e293b',
                borderColor: isComplete ? '#3b82f6' : isActive ? '#6366f1' : '#334155',
                scale: isActive ? 1.1 : 1,
              }}
              className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all"
            >
              {isComplete ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <span className={isActive ? 'text-white' : 'text-slate-500'}>{idx + 1}</span>
              )}
            </motion.div>
            <span className={`text-xs font-semibold hidden sm:block ${isActive ? 'text-white' : isComplete ? 'text-blue-400' : 'text-slate-500'}`}>
              {step}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`h-0.5 w-8 sm:w-16 rounded-full transition-colors duration-500 ${idx < currentStep ? 'bg-blue-500' : 'bg-slate-700'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ─────────────────────────────────────────────
   STEP 1: RESUME SELECTOR
───────────────────────────────────────────── */
const ResumeStep = ({ onNext, selectedResume, setSelectedResume }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manualText, setManualText] = useState('');
  const [useManual, setUseManual] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/v1/resumes', { withCredentials: true });
        const data = res.data?.data || [];
        setResumes(data);
        if (data.length === 0) setUseManual(true);
      } catch (_) {
        setUseManual(true);
        setError('Could not load saved resumes. Please paste your resume text manually.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredResumes = resumes.filter(r =>
    r.personalInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleResumeSelect = (resume) => {
    setSelectedResume(resume);
    setUseManual(false);
    setManualText('');
  };

  const canProceed = useManual ? manualText.trim().length > 50 : !!selectedResume;

  const handleNext = () => {
    if (useManual) {
      setSelectedResume({ _manualText: manualText.trim() });
    }
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Select Your Resume</h2>
        <p className="text-slate-400 text-sm">The AI interviewer will tailor questions based on your resume.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-amber-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : (
        <>
          {!useManual && resumes.length > 0 && (
            <>
              {resumes.length > 3 && (
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search resumes..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              )}

              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1 mb-4">
                {filteredResumes.map((resume) => {
                  const isSelected = selectedResume?._id === resume._id;
                  return (
                    <motion.button
                      key={resume._id}
                      onClick={() => handleResumeSelect(resume)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500/50 ring-1 ring-blue-500/30'
                          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? 'bg-blue-500' : 'bg-slate-700'}`}>
                            {isSelected ? <Check className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-slate-400" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-sm truncate">{resume.personalInfo?.name || 'Unnamed Resume'}</p>
                            {resume.summary && (
                              <p className="text-slate-400 text-xs mt-1 line-clamp-2">{resume.summary}</p>
                            )}
                            {resume.skills && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {(resume.skills?.languages || resume.skills?.frameworks || []).slice(0, 4).map((s, i) => (
                                  <span key={i} className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">{s}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <button
                onClick={() => { setUseManual(true); setSelectedResume(null); }}
                className="w-full py-3 border border-dashed border-slate-600 rounded-2xl text-slate-400 text-sm hover:border-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Or paste resume text manually
              </button>
            </>
          )}

          {useManual && (
            <div className="space-y-3">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Paste Resume Text
                  </span>
                  {resumes.length > 0 && (
                    <button
                      onClick={() => setUseManual(false)}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      ← Back to saved resumes
                    </button>
                  )}
                </div>
                <textarea
                  className="w-full h-48 bg-transparent text-slate-200 placeholder-slate-600 p-4 text-sm leading-relaxed resize-none focus:outline-none"
                  placeholder="Paste your full resume text here (name, skills, experience, projects, education)..."
                  value={manualText}
                  onChange={e => setManualText(e.target.value)}
                />
                <div className="px-4 py-2 border-t border-slate-700/50 flex justify-end">
                  <span className="text-xs text-slate-500">{manualText.length} chars (min 50)</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <motion.button
        onClick={handleNext}
        disabled={!canProceed}
        whileHover={{ scale: canProceed ? 1.02 : 1 }}
        whileTap={{ scale: canProceed ? 0.98 : 1 }}
        className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
      >
        Continue <ChevronRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   STEP 2: JD SELECTOR
───────────────────────────────────────────── */
const JDStep = ({ onNext, onBack, selectedJD, setSelectedJD }) => {
  const [savedJD, setSavedJD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jdText, setJdText] = useState('');
  const [useSaved, setUseSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/v1/job-descriptions/latest', { withCredentials: true });
        const jd = res.data?.data;
        if (jd?.text) {
          setSavedJD(jd);
          // Preload the saved JD text
          setJdText(jd.text);
          setUseSaved(true);
          setSelectedJD(jd.text);
        }
      } catch (_) {
        setError('Could not load saved job description.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleToggleSaved = () => {
    if (!useSaved && savedJD) {
      setJdText(savedJD.text);
      setSelectedJD(savedJD.text);
    } else {
      setJdText('');
      setSelectedJD('');
    }
    setUseSaved(v => !v);
  };

  const handleTextChange = (text) => {
    setJdText(text);
    setSelectedJD(text);
    if (useSaved && text !== savedJD?.text) setUseSaved(false);
  };

  const canProceed = jdText.trim().length > 30 || selectedJD;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Select Job Description</h2>
        <p className="text-slate-400 text-sm">The AI will ask questions tailored to this specific role.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-amber-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : (
        <>
          {savedJD && (
            <div
              onClick={handleToggleSaved}
              className={`mb-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                useSaved
                  ? 'bg-purple-600/15 border-purple-500/50 ring-1 ring-purple-500/30'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${useSaved ? 'bg-purple-500' : 'bg-slate-700'}`}>
                  {useSaved ? <Check className="w-4 h-4 text-white" /> : <Briefcase className="w-4 h-4 text-slate-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white text-sm">{savedJD.title || 'Saved Job Description'}</p>
                  <p className="text-slate-400 text-xs mt-1 line-clamp-3">{savedJD.text}</p>
                  <span className="text-xs text-purple-400 mt-1 inline-block">✓ From your profile</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" />
                {savedJD ? 'Or paste a different JD' : 'Paste Job Description'}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" /> AI will tailor questions
              </span>
            </div>
            <textarea
              className="w-full h-52 bg-transparent text-slate-200 placeholder-slate-600 p-4 text-sm leading-relaxed resize-none focus:outline-none"
              placeholder="Paste the job description here (role title, requirements, responsibilities, tech stack)..."
              value={jdText}
              onChange={e => handleTextChange(e.target.value)}
            />
            <div className="px-4 py-2 border-t border-slate-700/50 flex justify-end">
              <span className="text-xs text-slate-500">{jdText.length} chars</span>
            </div>
          </div>
        </>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all border border-slate-700"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <motion.button
          onClick={() => { setSelectedJD(jdText); onNext(); }}
          disabled={!canProceed}
          whileHover={{ scale: canProceed ? 1.02 : 1 }}
          whileTap={{ scale: canProceed ? 0.98 : 1 }}
          className="flex-2 flex-grow py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20"
        >
          Start Interview <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   LIVE INTERVIEW — INNER COMPONENTS
───────────────────────────────────────────── */

function InterviewActiveView({ onLeave, onSummaryReceived, resumeName, jdPreview }) {
  const { state, audioTrack } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();

  // Listen for summary data from agent
  useEffect(() => {
    const handleData = (payload, participant, kind, topic) => {
      if (topic === 'interview_summary') {
        try {
          const decoder = new TextDecoder();
          const str = decoder.decode(payload);
          const data = JSON.parse(str);
          console.log('Summary received via data packet:', data);
          if (onSummaryReceived) onSummaryReceived(data);
        } catch (err) {
          console.error('Failed to parse summary data:', err);
        }
      }
    };

    room.on('dataReceived', handleData);
    return () => {
      room.off('dataReceived', handleData);
    };
  }, [room, onSummaryReceived]);

  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);

  // Start timer
  useEffect(() => {
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleMic = async () => {
    await localParticipant.setMicrophoneEnabled(isMuted);
    setIsMuted(!isMuted);
  };

  const agentIsSpeaking = state === 'speaking';
  const agentIsThinking = state === 'thinking';
  const agentIsListening = state === 'listening' || state === undefined;

  const stateColor = agentIsSpeaking
    ? { glow: 'bg-blue-500', ring: 'ring-blue-500/40', border: 'border-blue-500/50', text: 'text-blue-400', label: 'Speaking...' }
    : agentIsThinking
    ? { glow: 'bg-purple-500', ring: 'ring-purple-500/40', border: 'border-purple-500/50', text: 'text-purple-400', label: 'Thinking...' }
    : { glow: 'bg-emerald-500', ring: 'ring-emerald-500/40', border: 'border-emerald-500/50', text: 'text-emerald-400', label: 'Listening...' };

  return (
    <div className="flex flex-col items-center w-full h-full relative">
      {/* Context pills */}
      <div className="flex items-center gap-2 mb-8 flex-wrap justify-center">
        {resumeName && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-300 font-medium">
            <FileText className="w-3 h-3" /> {resumeName}
          </div>
        )}
        {jdPreview && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-300 font-medium">
            <Briefcase className="w-3 h-3" /> {jdPreview}
          </div>
        )}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 border border-slate-600/50 rounded-full text-xs text-slate-300 font-mono">
          {formatTime(duration)}
        </div>
      </div>

      {/* Central visualizer */}
      <div className="relative flex items-center justify-center mb-10">
        {/* Outer animated rings */}
        <motion.div
          className={`absolute rounded-full ${stateColor.glow} opacity-10 blur-3xl`}
          animate={{ scale: agentIsSpeaking ? [1, 1.4, 1] : 1, opacity: agentIsSpeaking ? [0.10, 0.20, 0.10] : 0.08 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 300, height: 300 }}
        />
        <motion.div
          className={`absolute w-56 h-56 rounded-full border-2 ${stateColor.border} opacity-30`}
          animate={{ scale: agentIsSpeaking ? [1, 1.08, 1] : 1 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Main circle */}
        <motion.div
          className={`relative w-44 h-44 rounded-full bg-slate-900 border-2 ${stateColor.border} ring-4 ${stateColor.ring} flex items-center justify-center overflow-hidden shadow-2xl`}
          animate={{ scale: agentIsSpeaking ? [1, 1.03, 1] : 1 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        >
          {audioTrack ? (
            <BarVisualizer
              trackRef={audioTrack}
              className="w-full h-24 px-4"
              style={{ '--lk-fg': agentIsSpeaking ? '#60a5fa' : agentIsThinking ? '#c084fc' : '#34d399' }}
            />
          ) : (
            <Bot className="w-16 h-16 text-slate-600" />
          )}
        </motion.div>
      </div>

      {/* Agent state text */}
      <div className="text-center mb-10">
        <motion.div
          key={stateColor.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-1"
        >
          <motion.div
            className={`w-2 h-2 rounded-full ${stateColor.glow}`}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className={`text-lg font-bold ${stateColor.text}`}>{stateColor.label}</span>
        </motion.div>
        <p className="text-slate-500 text-sm">
          {!isMuted ? 'Speak clearly into your microphone' : 'Microphone is muted'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Mic Toggle */}
        <motion.button
          onClick={toggleMic}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isMuted
              ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
              : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </motion.button>

        {/* End Call Button */}
        <motion.button
          onClick={onLeave}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
        >
          <Phone className="w-6 h-6" />
        </motion.button>
      </div>

      <p className="mt-6 text-xs text-slate-600">Click the phone icon to end the call</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STEP 3: LIVE INTERVIEW VIEW (LiveKitRoom wrapper)
───────────────────────────────────────────── */
const LiveInterviewStep = ({ selectedResume, selectedJD, onLeave, onSummaryReceived }) => {
  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);

  // Build a clean resume summary for the agent
  const buildResumeSummary = useCallback((resume) => {
    if (!resume) return '';
    if (resume._manualText) return resume._manualText;

    const lines = [];
    if (resume.personalInfo) {
      const pi = resume.personalInfo;
      lines.push(`Name: ${pi.name || ''}`);
      if (pi.email) lines.push(`Email: ${pi.email}`);
      if (pi.phone) lines.push(`Phone: ${pi.phone}`);
      if (pi.linkedin) lines.push(`LinkedIn: ${pi.linkedin}`);
      if (pi.github) lines.push(`GitHub: ${pi.github}`);
    }
    if (resume.summary) lines.push(`\nSummary: ${resume.summary}`);
    if (resume.skills) {
      const s = resume.skills;
      const allSkills = [
        ...(s.languages || []),
        ...(s.frameworks || []),
        ...(s.databases || []),
        ...(s.tools || []),
      ].filter(Boolean);
      if (allSkills.length) lines.push(`\nSkills: ${allSkills.join(', ')}`);
    }
    if (resume.workExperience?.length) {
      lines.push('\nWork Experience:');
      resume.workExperience.forEach(w => {
        lines.push(`- ${w.role || w.title || 'Role'} at ${w.company || 'Company'} (${w.duration || ''}): ${w.description || ''}`);
      });
    }
    if (resume.projects?.length) {
      lines.push('\nProjects:');
      resume.projects.forEach(p => {
        lines.push(`- ${p.name || 'Project'}: ${p.description || ''} [Tech: ${(p.technologies || []).join(', ')}]`);
      });
    }
    if (resume.education?.length) {
      lines.push('\nEducation:');
      resume.education.forEach(e => {
        lines.push(`- ${e.degree || ''} at ${e.institution || e.school || ''} (${e.year || e.duration || ''})`);
      });
    }
    if (resume.certifications?.length) {
      lines.push(`\nCertifications: ${resume.certifications.map(c => c.name || c).join(', ')}`);
    }
    return lines.join('\n');
  }, []);

  useEffect(() => {
    (async () => {
      setConnecting(true);
      setError('');
      try {
        const resumeText = buildResumeSummary(selectedResume);
        const resumeName = selectedResume?._manualText
          ? 'Manual Resume'
          : (selectedResume?.personalInfo?.name || 'Candidate');

        const response = await axios.post('/api/interview/livekit-token', {
          resume_data: { text: resumeText, name: resumeName },
          jd_text: selectedJD,
          room: `interview-${Date.now()}`,
          identity: `interviewee_${Math.random().toString(36).substring(2, 8)}`
        });

        const { token: tkn, livekit_url, server_url } = response.data;
        setToken(tkn);
        setServerUrl(server_url || livekit_url || import.meta.env.VITE_LIVEKIT_URL || 'wss://interview-euncju1i.livekit.cloud');
        setConnected(true);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to connect. Make sure the Python agent and FastAPI are running.');
      } finally {
        setConnecting(false);
      }
    })();
  }, [selectedResume, selectedJD, buildResumeSummary]);

  const resumeName = selectedResume?._manualText
    ? 'Manual Resume'
    : (selectedResume?.personalInfo?.name || 'Your Resume');

  const jdPreview = selectedJD
    ? selectedJD.slice(0, 40) + (selectedJD.length > 40 ? '...' : '')
    : '';

  if (connecting) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="relative">
          <motion.div
            className="w-20 h-20 rounded-full border-4 border-blue-500/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-0 w-20 h-20 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <Bot className="absolute inset-0 m-auto w-8 h-8 text-blue-400" />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-lg">Connecting to AI Interviewer</p>
          <p className="text-slate-500 text-sm mt-1">Preparing your personalized interview session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <div className="text-center max-w-md">
          <p className="text-white font-semibold text-lg mb-2">Connection Failed</p>
          <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onLeave}
            className="px-6 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Go Back
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {connected && token && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          className="w-full h-full flex items-center justify-center"
        >
          <LiveKitRoom
            token={token}
            serverUrl={serverUrl}
            connect={true}
            audio={true}
            video={false}
            className="w-full flex flex-col items-center justify-center"
            onDisconnected={() => {
              setConnected(false);
              onLeave();
            }}
          >
            <RoomAudioRenderer />
            <InterviewActiveView
              onLeave={onLeave}
              onSummaryReceived={onSummaryReceived}
              resumeName={resumeName}
              jdPreview={jdPreview}
            />
          </LiveKitRoom>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─────────────────────────────────────────────
   END SCREEN
───────────────────────────────────────────── */
const EndScreen = ({ summary, onRestart }) => {
  if (!summary) return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-10 text-center max-w-md mx-auto"
    >
      <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-6 mx-auto">
        <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Processing Assessment...</h2>
      <p className="text-slate-400 leading-relaxed mb-8">
        The AI is finalizing your interview results. This will only take a moment.
      </p>
    </motion.div>
  );

  const data = summary?.summary || {};
  const overall = data.summary || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto space-y-8 pb-20"
    >
      {/* Header */}
      <div className="text-center">
        <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 mx-auto">
          <Check className="w-12 h-12 text-emerald-400" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-2">Interview Complete!</h2>
        <p className="text-slate-400 text-lg">Here's your overall performance feedback</p>
      </div>

      {/* Overall Recommendation Badge */}
      <div className="bg-gradient-to-r from-slate-800/60 to-slate-800/30 border border-slate-700/50 p-8 rounded-3xl text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`w-4 h-4 rounded-full ${overall.recommendation === 'HIRE' ? 'bg-emerald-400' : overall.recommendation === 'REJECT' ? 'bg-red-400' : 'bg-amber-400'}`} />
          <span className={`text-sm font-bold uppercase tracking-wider ${overall.recommendation === 'HIRE' ? 'text-emerald-400' : overall.recommendation === 'REJECT' ? 'text-red-400' : 'text-amber-400'}`}>
            Recommendation: {overall.recommendation || 'PENDING'}
          </span>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          {overall.recommendationReason || 'Assessment based on your interview performance.'}
        </p>
      </div>

      {/* Overall Feedback Section */}
      <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-blue-400" />
          Your Performance
        </h3>
        <p className="text-slate-300 text-lg leading-relaxed mb-8">
          {overall.overallFeedback || 'Assessment generated based on your interview session.'}
        </p>

        {/* Key Strengths */}
        <div className="mb-8">
          <h4 className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Check className="w-5 h-5" /> Key Strengths
          </h4>
          <ul className="space-y-3">
            {(overall.keyStrengths || []).map((s, i) => (
              <li key={i} className="flex items-start gap-4 bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span className="text-base leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div>
          <h4 className="text-amber-400 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Areas for Improvement
          </h4>
          <ul className="space-y-3">
            {(overall.areasForImprovement || []).map((a, i) => (
              <li key={i} className="flex items-start gap-4 bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl text-slate-300">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span className="text-base leading-relaxed">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Scores - Optional Reference */}
      {data.technicalSkills || data.communication || data.problemSolving ? (
        <div className="bg-slate-800/20 border border-slate-700/30 p-8 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-6">Performance Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.technicalSkills && (
              <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-slate-400 text-sm font-medium mb-2">Technical Skills</p>
                <p className="text-3xl font-bold text-blue-400">{data.technicalSkills?.score || '--'}%</p>
              </div>
            )}
            {data.communication && (
              <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl text-center">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-slate-400 text-sm font-medium mb-2">Communication</p>
                <p className="text-3xl font-bold text-purple-400">{data.communication?.score || '--'}%</p>
              </div>
            )}
            {data.problemSolving && (
              <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl text-center">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-slate-400 text-sm font-medium mb-2">Problem Solving</p>
                <p className="text-3xl font-bold text-emerald-400">{data.problemSolving?.score || '--'}%</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Action Button */}
      <div className="text-center pt-8">
        <button
          onClick={onRestart}
          className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all flex items-center gap-2 mx-auto shadow-lg shadow-blue-600/20"
        >
          <RefreshCw className="w-5 h-5" /> Return to Dashboard
        </button>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const STEPS = ['Resume', 'Job Role', 'Interview'];

export default function MockInterview() {
  const [step, setStep] = useState(0); // 0=resume, 1=jd, 2=interview, 3=end
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedJD, setSelectedJD] = useState('');
  const [interviewSummary, setInterviewSummary] = useState(null);

  const handleRestart = () => {
    setStep(0);
    setSelectedResume(null);
    setSelectedJD('');
    setInterviewSummary(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top header */}
      <div className="w-full px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">CareerLens Interview AI</h1>
            <p className="text-xs text-slate-500 mt-0.5">Powered by LiveKit + GPT-4.1</p>
          </div>
        </div>
        {step < 3 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-semibold">AI Ready</span>
          </div>
        )}
      </div>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/3 rounded-full blur-[80px]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 pt-10">
        {/* Step indicator (only for steps 0,1,2) */}
        {step < 3 && <StepIndicator currentStep={step} steps={STEPS} />}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <ResumeStep
              key="resume"
              selectedResume={selectedResume}
              setSelectedResume={setSelectedResume}
              onNext={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <JDStep
              key="jd"
              selectedJD={selectedJD}
              setSelectedJD={setSelectedJD}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <motion.div
              key="interview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl mx-auto min-h-[500px] flex flex-col items-center justify-center"
            >
              <LiveInterviewStep
                selectedResume={selectedResume}
                selectedJD={selectedJD}
                onLeave={() => setStep(3)}
                onSummaryReceived={(data) => {
                  setInterviewSummary(data);
                  setStep(3);
                }}
              />
            </motion.div>
          )}
          {step === 3 && (
            <EndScreen key="end" summary={interviewSummary} onRestart={handleRestart} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
