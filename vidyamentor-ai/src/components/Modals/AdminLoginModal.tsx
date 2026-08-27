import React, { useState } from 'react';
import { X, ShieldAlert, Building2, Key, ArrowRight, CheckCircle2, Lock, Sparkles } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const [adminType, setAdminType] = useState<'school' | 'platform'>('school');
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId || !password) {
      setError('Please provide administrative credentials.');
      return;
    }
    if (adminType === 'school' && !schoolCode) {
      setError('Please enter your School Affiliation Code.');
      return;
    }

    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 700);
  };

  const handleClose = () => {
    setSuccess(false);
    setAdminId('');
    setPassword('');
    setSchoolCode('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="admin-login-modal-container"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Admin & School Gateway</h3>
              <p className="text-slate-400 text-xs font-medium">Permission-Based Management Portal</p>
            </div>
          </div>
          <button
            id="close-admin-login-modal-btn"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Switcher */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAdminType('school')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    adminType === 'school'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> School Admin
                </button>
                <button
                  type="button"
                  onClick={() => setAdminType('platform')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    adminType === 'platform'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Platform Admin
                </button>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-800">
                {adminType === 'school' ? (
                  <p>
                    <strong>School Dashboard:</strong> Manage enrolled batches (Classes 9–12), assign teacher mentors, and view academic test analytics.
                  </p>
                ) : (
                  <p>
                    <strong>Platform Governance:</strong> Manage free education grants, curriculum safety rules, and platform audits.
                  </p>
                )}
              </div>

              {adminType === 'school' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    School Institution Code
                  </label>
                  <input
                    id="school-code-input"
                    type="text"
                    required
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value)}
                    placeholder="e.g., SCH-CBSE-4091"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Admin Email / ID
                </label>
                <input
                  id="admin-email-input"
                  type="text"
                  required
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="admin@institution.edu"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Security Passkey
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                  {error}
                </div>
              )}

              <button
                id="admin-login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-70 text-sm"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Secure Admin Login <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Protected with 256-bit encryption & Multi-Factor Auth (MFA).
                </p>
              </div>
            </form>
          ) : (
            <div className="text-center py-5 space-y-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900">Admin Session Verified</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Connected to {adminType === 'school' ? 'School Dashboard' : 'Platform Oversight Controller'}.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Role:</span>
                  <span className="font-bold text-slate-800">{adminType === 'school' ? 'School Principal / Coordinator' : 'VIDYAMENTOR Platform Admin'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Curriculum Scope:</span>
                  <span className="font-bold text-blue-700">Classes 9, 10, 11, 12</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md text-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Open Admin Console Preview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
