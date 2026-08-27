import React, { useState } from 'react';
import { X, HeartHandshake, FileCheck, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface FreeEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FreeEducationModal: React.FC<FreeEducationModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    classLevel: 'Class 10',
    schoolName: '',
    state: '',
    reason: '',
    preferredLanguages: 'English + Hindi',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setApplicationId(`VM-AID-${Math.floor(100000 + Math.random() * 900000)}`);
      setSubmitted(true);
    }, 700);
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({
      studentName: '',
      email: '',
      phone: '',
      classLevel: 'Class 10',
      schoolName: '',
      state: '',
      reason: '',
      preferredLanguages: 'English + Hindi',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="free-education-modal-container"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Apply for Free Education</h3>
              <p className="text-blue-100 text-xs font-medium">100% Free Normal Access Grant</p>
            </div>
          </div>
          <button
            id="close-free-education-modal-btn"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <strong>VIDYAMENTOR AI Social Impact Promise:</strong> Any Class 9, 10, 11, or 12 student facing genuine financial difficulty can apply. Every request is directly reviewed by VIDYAMENTOR AI Platform Admin.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Student Full Name *
                  </label>
                  <input
                    id="aid-student-name-input"
                    type="text"
                    required
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Class Level *
                  </label>
                  <select
                    id="aid-class-select"
                    value={formData.classLevel}
                    onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Student / Parent Email *
                  </label>
                  <input
                    id="aid-email-input"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Contact / WhatsApp Phone *
                  </label>
                  <input
                    id="aid-phone-input"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    School Name *
                  </label>
                  <input
                    id="aid-school-input"
                    type="text"
                    required
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    placeholder="Government / Private School Name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    State / Union Territory *
                  </label>
                  <input
                    id="aid-state-input"
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Uttar Pradesh, Maharashtra"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Brief Reason for Financial Assistance *
                </label>
                <textarea
                  id="aid-reason-textarea"
                  required
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Explain your situation in simple words (e.g., family income, school background, why VIDYAMENTOR AI will help your studies)..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="aid-declaration" required className="w-4 h-4 text-blue-600 rounded-sm" />
                <label htmlFor="aid-declaration" className="text-xs text-slate-600">
                  I confirm that all details provided are truthful and for my school education only.
                </label>
              </div>

              <button
                id="aid-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 text-sm"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Submit Free Education Application <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-100">
                <FileCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-900">Application Submitted!</h4>
                <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                  Thank you, <strong className="text-slate-800">{formData.studentName}</strong>. Your request has been queued for VIDYAMENTOR AI Admin verification.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tracking Reference ID:</span>
                  <span className="font-mono font-bold text-blue-700">{applicationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested Class:</span>
                  <span className="font-bold text-slate-800">{formData.classLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Review Window:</span>
                  <span className="font-bold text-emerald-600">Within 24–48 Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Notification Sent To:</span>
                  <span className="font-semibold text-slate-700">{formData.email}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl text-xs text-blue-800 border border-blue-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Once approved, you will receive an instant 100% Free OTP activation login link!</span>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md text-sm transition-all"
              >
                Back to Homepage
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
