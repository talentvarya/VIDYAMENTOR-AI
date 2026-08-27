import React from 'react';
import { Building2, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SchoolSectionProps {
  onOpenSchoolEnquiry: () => void;
}

export const SchoolSection: React.FC<SchoolSectionProps> = ({ onOpenSchoolEnquiry }) => {
  return (
    <section id="schools" className="py-12 sm:py-16 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-[#F8FAFC] rounded-[2rem] border border-slate-200/80 p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-10">
          
          {/* Left Content */}
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              Institutional Partnerships
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Are You a School?
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Schools can manage students through a dedicated School Admin dashboard with permission-based access.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-slate-700">
              <span className="flex items-center gap-1.5 font-medium">
                <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold">✓</span>
                </div>
                Batch-wise student onboarding
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold">✓</span>
                </div>
                Class 9 to 12 curriculum sync
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-2.5 h-2.5" />
                </div>
                Role-based teacher permissions
              </span>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="shrink-0 w-full md:w-auto text-center">
            <button
              id="school-enquiry-section-btn"
              onClick={onOpenSchoolEnquiry}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold text-sm sm:text-base rounded-2xl shadow-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
            >
              School Enquiry
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
