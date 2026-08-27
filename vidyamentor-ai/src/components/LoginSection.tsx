import React from 'react';
import { 
  GraduationCap, 
  ShieldAlert, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  Building2,
  Lock,
  Sparkles
} from 'lucide-react';

interface LoginSectionProps {
  onOpenStudentLogin: () => void;
  onOpenAdminLogin: () => void;
}

export const LoginSection: React.FC<LoginSectionProps> = ({
  onOpenStudentLogin,
  onOpenAdminLogin,
}) => {
  return (
    <section id="login" className="py-12 sm:py-16 bg-[#F8FAFC] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="px-3.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 mb-3">
            <Lock className="w-3.5 h-3.5" /> Secure Access Portals
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Login to VIDYAMENTOR AI
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            Select your portal to access your personalized learning cockpit or institutional administration tools.
          </p>
        </div>

        {/* Two Clear Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Card 1: Student Login */}
          <div 
            id="student-login-card"
            className="bg-white rounded-[2rem] p-7 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-extrabold text-xs">
                  Classes 9, 10, 11 & 12
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                Student Login
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                Fast and passwordless access using your registered student or parent email with instant One-Time Password (OTP) verification.
              </p>

              {/* Login Method Pills */}
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-100 space-y-2 mb-6">
                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold">Step 1: Enter Student / Parent Email</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <KeyRound className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold">Step 2: Instant 6-Digit OTP Verification</span>
                </div>
              </div>
            </div>

            <button
              id="student-login-portal-btn"
              onClick={onOpenStudentLogin}
              className="w-full py-4 px-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-sm shadow-blue-200 flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
            >
              Open Student Login <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Admin Login */}
          <div 
            id="admin-login-card"
            className="bg-white rounded-[2rem] p-7 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-6 h-6 text-blue-400" />
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                  Administrative Access
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                Admin Login
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                For Platform Admin & School Admin access with permission-based dashboard controls, student roster audits, and academic reports.
              </p>

              {/* Roles supported */}
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-100 space-y-2 mb-6">
                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <Building2 className="w-4 h-4 text-slate-700 shrink-0" />
                  <span className="font-semibold">School Admin & Principal Controls</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <Lock className="w-4 h-4 text-slate-700 shrink-0" />
                  <span className="font-semibold">Platform Governance & Aid Grants</span>
                </div>
              </div>
            </div>

            <button
              id="admin-login-portal-btn"
              onClick={onOpenAdminLogin}
              className="w-full py-4 px-5 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold text-sm sm:text-base rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
            >
              Open Admin Portal <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
