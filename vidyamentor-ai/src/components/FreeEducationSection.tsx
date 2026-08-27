import React from 'react';
import { 
  HeartHandshake, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Users2, 
  FileCheck2,
  Lock
} from 'lucide-react';

interface FreeEducationSectionProps {
  onOpenFreeEducation: () => void;
}

export const FreeEducationSection: React.FC<FreeEducationSectionProps> = ({ onOpenFreeEducation }) => {
  return (
    <section id="free-education" className="py-12 sm:py-16 bg-[#F8FAFC] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Impact Card (Clean Utility Card) */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-5 text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest">
                <HeartHandshake className="w-3.5 h-3.5" />
                VIDYAMENTOR AI Equal Opportunity Initiative
              </div>

              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Can't Afford the Fee?
              </h2>

              {/* Body Text */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                Students who genuinely need financial support can apply for free Normal access. Approval is controlled by VIDYAMENTOR AI Admin.
              </p>

              {/* 3 Pillars of Free Education */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-left">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900">Simple Application</h4>
                  </div>
                  <p className="text-2xs text-slate-500">Quick 1-minute form with basic student & school details.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900">Admin Approved</h4>
                  </div>
                  <p className="text-2xs text-slate-500">Directly reviewed & activated by Platform Admin team.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900">100% Confidential</h4>
                  </div>
                  <p className="text-2xs text-slate-500">Respectful, private processing with full dignity for learners.</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  id="apply-free-education-btn"
                  onClick={onOpenFreeEducation}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-sm shadow-blue-200 transition-all inline-flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
                >
                  Apply for Free Education
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Right Visual Summary */}
            <div className="lg:col-span-4">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xl shadow-xs">
                    0₹
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Zero Fee Barrier</h4>
                    <p className="text-2xs text-slate-500">Every deserving student gets top AI mentorship</p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-200/80 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold">✓</span>
                    </div>
                    <span>Full Normal Access to Class 9–12 Subjects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold">✓</span>
                    </div>
                    <span>24/7 AI Doubt Resolution in 2 Languages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold">✓</span>
                    </div>
                    <span>Chapter Tests & Weak Topic Detection</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-100 text-2xs text-slate-500 italic text-center">
                  "Education is the most powerful weapon to change your future."
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
