import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  UserX, 
  Lock, 
  GraduationCap, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { SAFETY_RULES } from '../data/content';

export const SafetySection: React.FC = () => {
  const getRuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-blue-600" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-indigo-600" />;
      case 'AlertTriangle': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'UserX': return <UserX className="w-5 h-5 text-rose-600" />;
      case 'Lock': return <Lock className="w-5 h-5 text-emerald-600" />;
      default: return <ShieldCheck className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <section id="safety" className="py-12 sm:py-16 bg-[#F8FAFC] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="px-3.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Complete Student Safety Policy
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Safe. Focused. Built for Students.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            We built VIDYAMENTOR AI from day one with strict educational guardrails so parents, teachers, and students have complete confidence.
          </p>
        </div>

        {/* 5 Rules Visual Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAFETY_RULES.map((rule, idx) => (
            <div
              key={idx}
              id={`safety-rule-${idx}`}
              className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-xs">
                  {getRuleIcon(rule.icon)}
                </div>
                <span className="text-2xs font-bold text-slate-400 font-mono">
                  RULE #{idx + 1}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {rule.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {rule.description}
              </p>
            </div>
          ))}

          {/* 6th Card: Trust & Parents Assurance */}
          <div className="bg-blue-600 text-white p-6 rounded-[1.5rem] border border-blue-600 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold">100% Parent & Teacher Approved</h3>
              </div>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-normal">
                No algorithms fighting for screen addiction. VIDYAMENTOR AI exists solely to teach concepts, answer homework doubts, and prepare students for high scores.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-blue-500/80 flex items-center gap-2 text-xs font-semibold text-blue-100">
              <div className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold">✓</span>
              </div>
              <span>Zero external ads • Verified child privacy</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
