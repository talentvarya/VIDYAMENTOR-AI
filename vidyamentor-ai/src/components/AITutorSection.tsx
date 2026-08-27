import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Languages, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle,
  PencilLine,
  FileCheck2,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { AI_TUTOR_SAMPLES } from '../data/content';

interface AITutorSectionProps {
  onOpenStudentLogin: () => void;
}

export const AITutorSection: React.FC<AITutorSectionProps> = ({ onOpenStudentLogin }) => {
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<'hinglish' | 'english' | 'hindi'>('hinglish');
  const [activeTab, setActiveTab] = useState<'explain' | 'practice' | 'check' | 'doubt'>('explain');
  const [userQuery, setUserQuery] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [customResponse, setCustomResponse] = useState<string | null>(null);

  const currentSample = AI_TUTOR_SAMPLES[selectedSampleIndex];

  const handleQuickAction = (action: 'explain' | 'practice' | 'check' | 'doubt') => {
    setActiveTab(action);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    setIsAnswering(true);
    setTimeout(() => {
      setIsAnswering(false);
      // Generate educational scoped answer
      setCustomResponse(
        `VIDYAMENTOR AI (Class 9-12 Education Guard): Here is the step-by-step concept breakdown for "${userQuery}". Remember to practice the related NCERT chapter examples and revise the core formulas daily in your study cockpit!`
      );
    }, 600);
  };

  return (
    <section id="ai-tutor" className="py-12 sm:py-16 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="px-3.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 mb-3">
            <Bot className="w-3.5 h-3.5 text-blue-600" />
            Classes 9–12 Education-Only AI
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ask VIDYAMENTOR AI
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            Our AI is strictly programmed and fine-tuned for high school and senior secondary curricula. Ask questions in simple language and receive curriculum-aligned explanations with verified textbook references.
          </p>
        </div>

        {/* Main Interactive Demo Container */}
        <div className="bg-[#F8FAFC] rounded-[2rem] shadow-sm border border-slate-200/80 overflow-hidden max-w-5xl mx-auto">
          
          {/* Top Bar: Pre-selected Question Chips */}
          <div className="bg-white px-5 py-4 border-b border-slate-200/80">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Try Sample Board Doubts:
              </span>
              <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                100% Curriculum Safe
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {AI_TUTOR_SAMPLES.map((sample, idx) => (
                <button
                  key={sample.id}
                  onClick={() => {
                    setSelectedSampleIndex(idx);
                    setCustomResponse(null);
                    setActiveTab('explain');
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                    selectedSampleIndex === idx && !customResponse
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <span className="opacity-80 text-2xs block">{sample.classLevel} • {sample.subject}</span>
                  <span>"{sample.prompt.slice(0, 32)}..."</span>
                </button>
              ))}
            </div>
          </div>

          {/* Body: Live interactive Tutor Panel */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Student Prompt Banner */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    Q
                  </div>
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Student Prompt
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                    {currentSample.classLevel}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
                    {currentSample.subject}
                  </span>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                “{currentSample.prompt}”
              </h3>
            </div>

            {/* Quick Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="tutor-explain-simply-btn"
                onClick={() => handleQuickAction('explain')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  activeTab === 'explain'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" /> Explain Simply
              </button>

              <button
                id="tutor-ask-doubt-btn"
                onClick={() => handleQuickAction('doubt')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  activeTab === 'doubt'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" /> Ask a Doubt
              </button>

              <button
                id="tutor-practice-me-btn"
                onClick={() => handleQuickAction('practice')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  activeTab === 'practice'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <PencilLine className="w-3.5 h-3.5" /> Practice Me
              </button>

              <button
                id="tutor-check-answer-btn"
                onClick={() => handleQuickAction('check')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  activeTab === 'check'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" /> Check My Answer
              </button>
            </div>

            {/* AI Answer Panel */}
            <div className="bg-white rounded-[1.5rem] border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              
              {/* Answer Metadata Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    {currentSample.classLevel}
                  </span>
                  <span className="font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    {currentSample.subject}
                  </span>
                  <span className="font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    {currentSample.chapter}
                  </span>
                </div>

                {/* Multilingual Switcher */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200 self-start sm:self-auto">
                  <span className="text-2xs font-bold text-slate-400 pl-2 uppercase tracking-wider flex items-center gap-1">
                    <Languages className="w-3 h-3 text-blue-600" /> Explain in:
                  </span>
                  <button
                    onClick={() => setSelectedLanguage('hinglish')}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                      selectedLanguage === 'hinglish'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Hinglish
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('english')}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                      selectedLanguage === 'english'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('hindi')}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                      selectedLanguage === 'hindi'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    हिन्दी
                  </button>
                </div>
              </div>

              {/* Dynamic Content based on Active Action Tab */}
              {activeTab === 'explain' && (
                <div className="space-y-4">
                  <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80">
                    {selectedLanguage === 'hinglish' && currentSample.explanationHinglish}
                    {selectedLanguage === 'english' && currentSample.explanationEnglish}
                    {selectedLanguage === 'hindi' && currentSample.explanationHindi}
                  </div>

                  <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
                    <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Quick Summary:</strong> {currentSample.keyTakeaway}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'practice' && (
                <div className="space-y-3 bg-[#F8FAFC] p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Recommended Practice Questions for {currentSample.chapter}:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {currentSample.practiceQuestions.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xs shrink-0">
                          {idx + 1}
                        </span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-2xs text-slate-500 italic">
                    Log in to solve these questions in timed exam mode with step-by-step AI marking!
                  </p>
                </div>
              )}

              {activeTab === 'check' && (
                <div className="space-y-3 bg-[#F8FAFC] p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Instant Step-by-Step Answer Checking
                  </h4>
                  <p className="text-xs text-slate-600">
                    Write or upload your attempted solution. VIDYAMENTOR AI checks line-by-line working, detects sign errors in derivations, and awards step marks aligned with CBSE/State Board guidelines.
                  </p>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold">✓</span>
                    </div>
                    <span>Scoring Rubric: Step 1 (Formula), Step 2 (Substitution), Step 3 (Final Result + Units).</span>
                  </div>
                </div>
              )}

              {activeTab === 'doubt' && (
                <div className="space-y-3 bg-[#F8FAFC] p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Ask a Follow-Up Doubt on {currentSample.subject}
                  </h4>
                  <form onSubmit={handleCustomSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="e.g. Can discriminant D be negative? What happens then?"
                      className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isAnswering}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isAnswering ? 'Thinking...' : 'Ask AI'}
                    </button>
                  </form>
                  {customResponse && (
                    <div className="p-3 bg-blue-50 rounded-lg text-xs text-slate-800 border border-blue-100">
                      {customResponse}
                    </div>
                  )}
                </div>
              )}

              {/* Source Used & Safety Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-2xs text-slate-500">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span><strong>Source Used:</strong> {currentSample.source}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Curriculum Verified • Non-Education Queries Blocked</span>
                </div>
              </div>

            </div>

            {/* Bottom CTA for full access */}
            <div className="text-center pt-2">
              <button
                onClick={onOpenStudentLogin}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm shadow-blue-200 transition-all cursor-pointer"
              >
                Access Full 24/7 AI Doubt Solver <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
