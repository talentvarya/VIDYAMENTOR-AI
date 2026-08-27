import React, { useState } from 'react';
import { 
  GraduationCap, 
  Menu, 
  X, 
  Sparkles, 
  User, 
  ShieldAlert, 
  ArrowRight,
  HeartHandshake
} from 'lucide-react';

interface NavbarProps {
  onOpenStudentLogin: () => void;
  onOpenAdminLogin: () => void;
  onOpenFreeEducation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenStudentLogin,
  onOpenAdminLogin,
  onOpenFreeEducation,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Free Education', href: '#free-education', special: true },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 transition-all">
      {/* Top micro announcement bar */}
      <div className="bg-slate-900 text-white text-xs font-semibold py-1.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 bg-blue-600/90 text-white px-2 py-0.5 rounded-full text-2xs uppercase tracking-wider font-bold">
            <Sparkles className="w-3 h-3 text-amber-300" /> Classes 9–12
          </span>
          <span className="text-slate-300">Education-only AI • Learn in your language (English, Hinglish, Hindi)</span>
          <button 
            onClick={onOpenFreeEducation}
            className="text-blue-400 hover:text-white underline font-bold ml-1 transition-colors text-2xs cursor-pointer"
          >
            Need Fee Support? Apply Free →
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand Name */}
          <a 
            href="#home" 
            id="brand-logo-link"
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-xs">
              <div className="w-4 h-4 border-2 border-white rounded-xs flex items-center justify-center">
                <GraduationCap className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">
                VIDYAMENTOR <span className="text-blue-600">AI</span>
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-500">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`transition-colors hover:text-blue-600 ${
                  link.special
                    ? 'text-blue-600 font-semibold flex items-center gap-1'
                    : 'hover:text-slate-900'
                }`}
              >
                {link.special && <HeartHandshake className="w-3.5 h-3.5 text-blue-600" />}
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Student Login */}
            <button
              id="header-student-login-btn"
              onClick={onOpenStudentLogin}
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Student Login
            </button>

            {/* Admin Login */}
            <button
              id="header-admin-login-btn"
              onClick={onOpenAdminLogin}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Platform & School Admin Gateway"
            >
              Admin Login
            </button>

            {/* Primary CTA */}
            <a
              id="header-start-learning-cta"
              href="#pricing"
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm shadow-blue-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Start Learning
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="header-mobile-student-login-btn"
              onClick={onOpenStudentLogin}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"
            >
              Login
            </button>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-menu-drawer" className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                  link.special
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  {link.special && <HeartHandshake className="w-4 h-4 text-blue-600" />}
                  {link.label}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenStudentLogin();
              }}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-blue-600 text-white flex items-center justify-center gap-2 shadow-xs"
            >
              <User className="w-4 h-4" />
              Student Login (Email + OTP)
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminLogin();
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-slate-500" />
              Admin Login (School & Platform)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
