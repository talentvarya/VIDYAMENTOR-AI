import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, GraduationCap, KeyRound, Laptop, Mail, Shield, X } from 'lucide-react';
import { finishAuthentication, requestStudentOtp, verifyStudentOtp } from '../../lib/api';
import type { AuthSession, StudentProfile, SupportedLanguage } from '../../types';

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (session: AuthSession) => void;
  initialClass?: string;
}

const languages: SupportedLanguage[] = ['English', 'Hinglish', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati'];
const boards = ['CBSE', 'ICSE', 'State Board', 'Other'];

const ageLimitDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 21);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  initialClass = 'Class 10',
}) => {
  const [mode, setMode] = useState<'existing' | 'new'>('new');
  const [step, setStep] = useState<'details' | 'otp' | 'device' | 'success'>('details');
  const [profile, setProfile] = useState<StudentProfile>({
    fullName: '',
    email: '',
    dateOfBirth: '',
    classLevel: initialClass,
    board: 'CBSE',
    studentId: '',
    schoolName: '',
    schoolCode: '',
    section: '',
    languages: ['English', 'Hinglish'],
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifiedSession, setVerifiedSession] = useState<AuthSession | null>(null);
  const [otherDeviceName, setOtherDeviceName] = useState('another device');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const minimumDob = useMemo(ageLimitDate, []);

  useEffect(() => {
    if (isOpen) setProfile((current) => ({ ...current, classLevel: initialClass }));
  }, [initialClass, isOpen]);

  if (!isOpen) return null;

  const update = <K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const reset = () => {
    setMode('new');
    setStep('details');
    setOtp(['', '', '', '', '', '']);
    setVerifiedSession(null);
    setError('');
    onClose();
  };

  const sendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile.email.includes('@')) {
      setError('Enter the email address linked to the student account.');
      return;
    }
    if (mode === 'new' && (!profile.fullName.trim() || !profile.dateOfBirth || !profile.studentId.trim() || !profile.schoolName.trim())) {
      setError('Please complete all required student profile fields.');
      return;
    }
    if (mode === 'new' && (profile.dateOfBirth < minimumDob || profile.dateOfBirth > new Date().toISOString().slice(0, 10))) {
      setError('Normal Phase is available only to students aged 20 or younger.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await requestStudentOtp(profile.email, mode === 'new');
      setStep('otp');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send the OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Enter the complete 6-digit OTP.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await verifyStudentOtp(profile.email, code, mode === 'new' ? profile : undefined);
      if (result.conflict) {
        setOtherDeviceName(result.conflict.otherDeviceName || 'another device');
        setStep('device');
      } else {
        setVerifiedSession(result.session);
        setStep('success');
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to verify the OTP.');
    } finally {
      setLoading(false);
    }
  };

  const replaceDevice = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await finishAuthentication(true);
      if (!result.session) throw new Error('The other session could not be replaced.');
      setVerifiedSession(result.session);
      setStep('success');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to continue on this device.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="student-login-title">
      <div className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-blue-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><GraduationCap className="h-5 w-5" /></div>
            <div><h3 id="student-login-title" className="text-lg font-bold">Student Portal</h3><p className="text-xs font-medium text-blue-100">Secure email OTP · Normal Phase</p></div>
          </div>
          <button onClick={reset} className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-100 hover:bg-white/10 hover:text-white" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6">
          {step === 'details' && (
            <form onSubmit={sendOtp} className="space-y-5">
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"><Shield className="h-3.5 w-3.5" /> Verified student profile</span>
                <h4 className="mt-2 text-xl font-bold text-slate-900">Create or access your profile</h4>
                <p className="mt-1 text-sm text-slate-500">Your learning access remains locked until verification, payment and activation are complete.</p>
              </div>

              <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-bold">
                <button type="button" onClick={() => { setMode('new'); setError(''); }} className={`rounded-lg px-3 py-2.5 ${mode === 'new' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>New student</button>
                <button type="button" onClick={() => { setMode('existing'); setError(''); }} className={`rounded-lg px-3 py-2.5 ${mode === 'existing' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>Existing student</button>
              </div>

              {mode === 'existing' ? (
                <div className="mx-auto max-w-md space-y-3">
                  <Field label="Email"><div className="relative"><Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="email" value={profile.email} onChange={(e) => update('email', e.target.value)} required className="input pl-10" placeholder="student@example.com" /></div></Field>
                  <p className="text-xs leading-5 text-slate-500">Your saved profile will be used as-is and will not be resubmitted or changed.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" required><input value={profile.fullName} onChange={(e) => update('fullName', e.target.value)} required className="input" placeholder="Student full name" /></Field>
                  <Field label="Email"><div className="relative"><Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="email" value={profile.email} onChange={(e) => update('email', e.target.value)} required className="input pl-10" placeholder="student@example.com" /></div></Field>
                  <Field label="Date of Birth"><input type="date" min={minimumDob} max={new Date().toISOString().slice(0, 10)} value={profile.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} required className="input" /></Field>
                  <Field label="Student ID"><input value={profile.studentId} onChange={(e) => update('studentId', e.target.value)} required className="input" placeholder="School roll / student ID" /></Field>
                  <Field label="Class"><select value={profile.classLevel} onChange={(e) => update('classLevel', e.target.value)} className="input">{['Class 9', 'Class 10', 'Class 11', 'Class 12'].map((value) => <option key={value}>{value}</option>)}</select></Field>
                  <Field label="Board"><select value={profile.board} onChange={(e) => update('board', e.target.value)} className="input">{boards.map((value) => <option key={value}>{value}</option>)}</select></Field>
                  <Field label="School"><input value={profile.schoolName} onChange={(e) => update('schoolName', e.target.value)} required className="input" placeholder="School name" /></Field>
                  <Field label="Section"><input value={profile.section} onChange={(e) => update('section', e.target.value)} className="input" placeholder="e.g. A" /></Field>
                  <Field label="School Code (if registered)"><input value={profile.schoolCode} onChange={(e) => update('schoolCode', e.target.value.toUpperCase())} className="input font-mono" placeholder="Optional" /></Field>
                  <Field label="Learning Languages"><div className="grid grid-cols-2 gap-2"><select value={profile.languages[0]} onChange={(e) => update('languages', [e.target.value as SupportedLanguage, profile.languages[1]])} className="input">{languages.filter((item) => item !== profile.languages[1]).map((item) => <option key={item}>{item}</option>)}</select><select value={profile.languages[1]} onChange={(e) => update('languages', [profile.languages[0], e.target.value as SupportedLanguage])} className="input">{languages.filter((item) => item !== profile.languages[0]).map((item) => <option key={item}>{item}</option>)}</select></div></Field>
                </div>
              )}
              {error && <ErrorMessage message={error} />}
              <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-60">{loading ? <Spinner /> : <>{mode === 'new' ? 'Create Profile & Send OTP' : 'Send Login OTP'} <ArrowRight className="h-4 w-4" /></>}</button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={verifyOtp} className="mx-auto max-w-md space-y-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600"><KeyRound className="h-6 w-6" /></div>
              <div><h4 className="text-xl font-bold text-slate-900">Check your email</h4><p className="mt-1 text-sm text-slate-500">Enter the 6-digit code sent to <strong>{profile.email}</strong>.{mode === 'existing' ? ' Your saved profile will not be changed.' : ''}</p></div>
              <div className="flex justify-center gap-2">{otp.map((value, index) => <input key={index} id={`student-otp-${index}`} inputMode="numeric" maxLength={1} value={value} onChange={(e) => { const next = [...otp]; next[index] = e.target.value.replace(/\D/g, '').slice(-1); setOtp(next); if (next[index]) document.getElementById(`student-otp-${index + 1}`)?.focus(); }} className="h-12 w-11 rounded-xl border border-slate-200 text-center text-lg font-bold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />)}</div>
              {error && <ErrorMessage message={error} />}
              <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{loading ? <Spinner /> : 'Verify Securely'}</button>
              <button type="button" onClick={() => setStep('details')} className="text-xs font-semibold text-slate-500 hover:text-blue-600">Edit profile details</button>
            </form>
          )}

          {step === 'device' && (
            <div className="mx-auto max-w-md space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600"><Laptop className="h-7 w-7" /></div>
              <div><h4 className="text-xl font-bold text-slate-900">Already active on another device</h4><p className="mt-2 text-sm leading-6 text-slate-500">Your account is active on {otherDeviceName}. Continue here to securely end that device session.</p></div>
              {error && <ErrorMessage message={error} />}
              <button onClick={replaceDevice} disabled={loading} className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60">{loading ? <Spinner /> : 'Logout Other Device & Continue'}</button>
            </div>
          )}

          {step === 'success' && verifiedSession && (
            <div className="mx-auto max-w-md space-y-4 py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-7 w-7" /></div>
              <div><h4 className="text-xl font-bold text-slate-900">Email verified</h4><p className="mt-1 text-sm text-slate-500">Your current application status is <strong>{verifiedSession.studentStatus?.replaceAll('_', ' ')}</strong>.</p></div>
              <button onClick={() => onAuthenticated(verifiedSession)} className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-blue-700">Continue</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">{label}{required ? ' *' : ''}</span>{children}</label>
);

const ErrorMessage = ({ message }: { message: string }) => <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-left text-xs font-medium text-red-600">{message}</div>;
const Spinner = () => <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />;
