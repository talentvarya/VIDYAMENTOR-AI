import React, { useState } from 'react';
import { X, Building2, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SchoolEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolEnquiryModal: React.FC<SchoolEnquiryModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    institutionName: '',
    contactPerson: '',
    designation: 'Principal / Vice Principal',
    officialEmail: '',
    phoneNumber: '',
    cityState: '',
    board: 'CBSE',
    studentStrength: '250 - 500 Students',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 700);
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({
      institutionName: '',
      contactPerson: '',
      designation: 'Principal / Vice Principal',
      officialEmail: '',
      phoneNumber: '',
      cityState: '',
      board: 'CBSE',
      studentStrength: '250 - 500 Students',
      notes: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="school-enquiry-modal-container"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Institutional School Enquiry</h3>
              <p className="text-slate-400 text-xs font-medium">Classes 9 to 12 School Administration</p>
            </div>
          </div>
          <button
            id="close-school-enquiry-modal-btn"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-slate-700 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  Connect your school with VIDYAMENTOR AI. Empower your teachers with structured batch management and student doubt insights.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  School / Institution Name *
                </label>
                <input
                  id="school-name-input"
                  type="text"
                  required
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  placeholder="e.g. St. Xavier's Senior Secondary School"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    id="contact-person-input"
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Verma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Designation *
                  </label>
                  <select
                    id="designation-select"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Principal / Vice Principal">Principal / Vice Principal</option>
                    <option value="Academic Director">Academic Director</option>
                    <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                    <option value="Senior School Coordinator">Senior School Coordinator</option>
                    <option value="School Trustee / Management">School Trustee / Management</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Official School Email *
                  </label>
                  <input
                    id="official-email-input"
                    type="email"
                    required
                    value={formData.officialEmail}
                    onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                    placeholder="principal@school.edu"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Phone / Mobile *
                  </label>
                  <input
                    id="school-phone-input"
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+91 98111 22334"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Affiliation Board *
                  </label>
                  <select
                    id="board-select"
                    value={formData.board}
                    onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CBSE">CBSE (Central Board)</option>
                    <option value="ICSE / ISC">ICSE / ISC (CISCE)</option>
                    <option value="State Board">State Board</option>
                    <option value="Multiple Boards">Multiple Boards</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Classes 9–12 Student Count
                  </label>
                  <select
                    id="student-strength-select"
                    value={formData.studentStrength}
                    onChange={(e) => setFormData({ ...formData, studentStrength: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="100 - 250 Students">100 - 250 Students</option>
                    <option value="250 - 500 Students">250 - 500 Students</option>
                    <option value="500 - 1000 Students">500 - 1,000 Students</option>
                    <option value="1000+ Students">1,000+ Students</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  City & State *
                </label>
                <input
                  id="school-location-input"
                  type="text"
                  required
                  value={formData.cityState}
                  onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
                  placeholder="e.g. Pune, Maharashtra"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                id="school-enquiry-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-70 text-sm"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Request School Admin Demonstration <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border-2 border-blue-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-900">Enquiry Received!</h4>
                <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                  Thank you, <strong className="text-slate-800">{formData.contactPerson}</strong> ({formData.institutionName}).
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Institution:</span>
                  <span className="font-bold text-slate-800">{formData.institutionName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Board Alignment:</span>
                  <span className="font-bold text-blue-700">{formData.board} (Classes 9 to 12)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Demo Coordinator:</span>
                  <span className="font-semibold text-emerald-600">Dedicated School Partner Manager</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md text-sm transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
