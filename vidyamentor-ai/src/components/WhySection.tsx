import React from 'react';
import { 
  Languages, 
  ShieldCheck, 
  GitFork, 
  Coins, 
  ArrowRight, 
  Check, 
  Sparkles,
  BookOpenCheck
} from 'lucide-react';

interface WhySectionProps {
  onOpenFreeEducation: () => void;
}

export const WhySection: React.FC<WhySectionProps> = ({ onOpenFreeEducation }) => {
  const structuredFlow = [
    { label: 'Board', sub: 'CBSE / ICSE / State' },
    { label: 'Class', sub: 'Class 9, 10, 11, 12' },
    { label: 'Subject', sub: 'Maths, Science, etc.' },
    { label: 'Chapter', sub: 'Curriculum-Aligned' },
    { label: 'Topic', sub: 'Core Concepts' },
    { label: 'Lesson', sub: 'Interactive Step' },
  ];

  return (
    <section id="why" className="py-12 sm:py-16 bg-[#F8FAFC] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="px-3.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Built Exclusively For School Success
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why VIDYAMENTOR AI?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            Unlike generic AI chatbots that provide confusing or unsafe answers, VIDYAMENTOR AI is dedicated 100% to school education for Classes 9 to 12.
          </p>
        </div>

        {/* 4 Benefits Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Benefit 1: Learn in 2 Languages */}
          <div 
            id="benefit-card-languages"
            className="bg-white rounded-[1.5rem] p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                <Languages className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                Multilingual
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              Learn in 2 Languages
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Students can choose any two supported languages. Switch between English, Hinglish, Hindi, or regional languages anytime to understand difficult concepts naturally.
            </p>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-center justify-between flex-wrap gap-2">
              <span className="font-semibold text-slate-500">Supported Combos:</span>
              <div className="flex gap-1.5 flex-wrap">
                <span className="bg-white text-blue-600 font-bold px-2 py-0.5 rounded border border-slate-200 shadow-2xs">English + Hinglish</span>
                <span className="bg-white text-blue-600 font-bold px-2 py-0.5 rounded border border-slate-200 shadow-2xs">English + Hindi</span>
              </div>
            </div>
          </div>

          {/* Benefit 2: Education-Only AI */}
          <div 
            id="benefit-card-education-only"
            className="bg-white rounded-[1.5rem] p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
                100% Safe
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              Education-Only AI
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              The AI answers only school education-related questions. Non-educational questions, social gossip, and adult content are strictly blocked to keep students laser-focused.
            </p>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <span className="text-green-600 text-[10px] font-bold">✓</span>
              </div>
              <span>Zero distractions • Aligned to official NCERT & State Board syllabus</span>
            </div>
          </div>

          {/* Benefit 3: Structured Learning */}
          <div 
            id="benefit-card-structured"
            className="bg-white rounded-[1.5rem] p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all shadow-xs">
                <GitFork className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-bold">
                Step-by-Step Flow
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              Structured Learning
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Clear learning path that guides the student step-by-step from board selection all the way to individual lesson mastery without confusion.
            </p>

            {/* Visual Hierarchy Flow */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-2xs sm:text-xs">
                {structuredFlow.map((item, idx) => (
                  <React.Fragment key={item.label}>
                    <div className="flex flex-col items-center text-center shrink-0">
                      <span className="font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
                        {item.label}
                      </span>
                    </div>
                    {idx < structuredFlow.length - 1 && (
                      <span className="text-slate-400 font-bold shrink-0">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Benefit 4: Affordable Learning */}
          <div 
            id="benefit-card-affordable"
            className="bg-white rounded-[1.5rem] p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                <Coins className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                From ₹89/mo
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              Affordable Learning
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Low-cost plans starting from just ₹89/month, plus our Admin-approved free education program for students who cannot afford tuition fees.
            </p>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
              <span className="text-slate-600 font-medium">Need financial support?</span>
              <button
                onClick={onOpenFreeEducation}
                className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
              >
                Apply for Free Education <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
