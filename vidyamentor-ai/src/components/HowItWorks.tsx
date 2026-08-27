import React, { useState } from 'react';
import { 
  Mail, 
  KeyRound, 
  GraduationCap, 
  Languages, 
  BookOpenCheck, 
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '../data/content';

interface HowItWorksProps {
  onOpenStudentLogin: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenStudentLogin }) => {
  const [activeStep, setActiveStep] = useState(1);

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mail': return <Mail className="w-5 h-5" />;
      case 'KeyRound': return <KeyRound className="w-5 h-5" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
      case 'Languages': return <Languages className="w-5 h-5" />;
      case 'BookOpenCheck': return <BookOpenCheck className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <section id="how-it-works" className="py-12 sm:py-16 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="px-3.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Simple 6-Step Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How VIDYAMENTOR AI Works
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            Get started in less than 2 minutes. No complicated passwords or confusing menus — just straight to focused studying.
          </p>
        </div>

        {/* 6 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOW_IT_WORKS_STEPS.map((item) => {
            const isCurrent = activeStep === item.step;
            return (
              <div
                key={item.step}
                id={`how-it-works-step-${item.step}`}
                onClick={() => setActiveStep(item.step)}
                className={`p-6 rounded-[1.5rem] border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-600/10'
                    : 'bg-[#F8FAFC] border-slate-200/90 hover:border-blue-300 hover:bg-white'
                }`}
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-blue-600 border border-slate-200'
                      }`}>
                        {item.step}
                      </span>
                      <div className={`p-2 rounded-lg ${isCurrent ? 'bg-blue-50 text-blue-600' : 'bg-slate-200/60 text-slate-600'}`}>
                        {getStepIcon(item.icon)}
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-2xs font-bold">
                        Active Step
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold">✓</span>
                    </div>
                    {item.tip}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action CTA */}
        <div className="mt-10 text-center">
          <button
            onClick={onOpenStudentLogin}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-sm shadow-blue-200 transition-all cursor-pointer hover:-translate-y-0.5"
          >
            Start Step 1: Instant Login with Email <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
