import React, { useState } from 'react';
import { X, Mail, KeyRound, ArrowRight, CheckCircle2, Shield, Sparkles, GraduationCap } from 'lucide-react';

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClass?: string;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen,
  onClose,
  initialClass = 'Class 10',
}) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [selectedLangs, setSelectedLangs] = useState<[string, string]>(['English', 'Hinglish']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid student or parent email address.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 600);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 700);
  };

  const handleReset = () => {
    setStep('email');
    setEmail('');
    setOtp(['', '', '', '', '', '']);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="student-login-modal-container"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Student Portal</h3>
              <p className="text-blue-100 text-xs font-medium">Classes 9, 10, 11 & 12</p>
            </div>
          </div>
          <button
            id="close-student-login-modal-btn"
            onClick={handleReset}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="text-center mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                  <Shield className="w-3.5 h-3.5" /> Passwordless Secure Login
                </span>
                <h4 className="text-xl font-bold text-slate-900 mt-2">Welcome Back, Learner!</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Enter your email to receive a 6-digit one-time access code.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Student / Parent Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="student-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@school.edu or yourname@gmail.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Your Class
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['Class 9', 'Class 10', 'Class 11', 'Class 12'].map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedClass(cls)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedClass === cls
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                  {error}
                </div>
              )}

              <button
                id="student-send-otp-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 text-sm"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Send 6-Digit OTP <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  New student? Entering your email automatically creates your study profile.
                </p>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 border border-blue-100">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Enter Verification Code</h4>
                <p className="text-sm text-slate-500 mt-1">
                  We sent a 6-digit OTP code to <strong className="text-slate-800">{email}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-xs text-blue-600 hover:underline font-semibold mt-1"
                >
                  Change Email Address
                </button>
              </div>

              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-11 h-13 text-center text-xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 transition-all"
                  />
                ))}
              </div>

              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-xs text-slate-600 flex items-center justify-between">
                <span>Demo instant code: <strong className="text-blue-700 font-mono">1 2 3 4 5 6</strong></span>
                <button
                  type="button"
                  onClick={() => setOtp(['1', '2', '3', '4', '5', '6'])}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Auto-fill
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                  {error}
                </div>
              )}

              <button
                id="student-verify-otp-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 text-sm"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Verify & Enter Study Cockpit <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-100 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-900">Welcome to VIDYAMENTOR!</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Logged in as <strong className="text-slate-800">{email}</strong>
                </p>
              </div>

              {/* Verified Student Badge */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Assigned Level</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">{selectedClass}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Active Languages</span>
                  <span className="font-bold text-slate-800">{selectedLangs.join(' + ')}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">AI Safety Guard</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Active & Verified
                  </span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Start Today's Study Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
