import React from 'react';
import { 
  GraduationCap, 
  HeartHandshake, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin,
  Lock,
  ArrowUp
} from 'lucide-react';

interface FooterProps {
  onOpenStudentLogin: () => void;
  onOpenAdminLogin: () => void;
  onOpenSchoolEnquiry: () => void;
  onOpenFreeEducation: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenStudentLogin,
  onOpenAdminLogin,
  onOpenSchoolEnquiry,
  onOpenFreeEducation,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-700">
      
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand & Purpose Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                VIDYAMENTOR <span className="text-blue-600">AI</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm font-normal">
              Education-only AI learning platform purpose-built for students in Classes 9, 10, 11 and 12. Learn complex school concepts simply in your chosen languages with zero distractions.
            </p>

            {/* Platform Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-2xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Classes 9–12 Aligned
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-2xs font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Safe Student AI
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#home" className="text-slate-600 hover:text-blue-600 transition-colors">Home</a>
              </li>
              <li>
                <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">Features</a>
              </li>
              <li>
                <a href="#pricing" className="text-slate-600 hover:text-blue-600 transition-colors">Pricing Plans</a>
              </li>
              <li>
                <button onClick={onOpenFreeEducation} className="text-blue-600 hover:underline font-bold text-left cursor-pointer">
                  Free Education
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="text-slate-600 hover:text-blue-600 transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#faq" className="text-slate-600 hover:text-blue-600 transition-colors">FAQ</a>
              </li>
            </ul>
          </div>

          {/* Portals & Schools */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  id="footer-student-login-link"
                  onClick={onOpenStudentLogin}
                  className="text-slate-600 hover:text-blue-600 transition-colors text-left cursor-pointer font-medium"
                >
                  Student Login
                </button>
              </li>
              <li>
                <button
                  id="footer-admin-login-link"
                  onClick={onOpenAdminLogin}
                  className="text-slate-600 hover:text-blue-600 transition-colors text-left cursor-pointer font-medium"
                >
                  Admin Login
                </button>
              </li>
              <li>
                <button
                  id="footer-school-enquiry-link"
                  onClick={onOpenSchoolEnquiry}
                  className="text-slate-600 hover:text-blue-600 transition-colors text-left cursor-pointer font-medium"
                >
                  School Enquiry
                </button>
              </li>
              <li>
                <a href="#safety" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Safety Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Policies & Support */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Support & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" className="text-slate-600 hover:text-blue-600 transition-colors">About VIDYAMENTOR</a>
              </li>
              <li>
                <a href="#contact" className="text-slate-600 hover:text-blue-600 transition-colors">Contact Support</a>
              </li>
              <li>
                <a href="#help" className="text-slate-600 hover:text-blue-600 transition-colors">Help Center</a>
              </li>
              <li>
                <a href="#privacy" className="text-slate-600 hover:text-blue-600 transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" className="text-slate-600 hover:text-blue-600 transition-colors">Terms & Conditions</a>
              </li>
              <li>
                <a href="#refund" className="text-slate-600 hover:text-blue-600 transition-colors">Refund Policy</a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Brand Note & Bottom Bar */}
      <div className="border-t border-slate-200 bg-[#F8FAFC] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          
          <div>
            <p className="text-xs font-bold text-slate-900">
              VIDYAMENTOR AI — Learn in Your Language. Master Your Future.
            </p>
            <p className="text-2xs text-slate-500 mt-0.5">
              © {new Date().getFullYear()} VIDYAMENTOR AI. All rights reserved. Exclusively for Classes 9, 10, 11 and 12.
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-xs"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" /> Top
          </button>

        </div>
      </div>

    </footer>
  );
};
