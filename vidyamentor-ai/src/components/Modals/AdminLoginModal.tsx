import React, { useState } from 'react';
import { ArrowRight, Building2, KeyRound, Laptop, Lock, ShieldAlert, X } from 'lucide-react';
import { finishAuthentication, requestAdminOtp, verifyAdminOtp } from '../../lib/api';
import type { AppRole, AuthSession } from '../../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (session: AuthSession) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onAuthenticated }) => {
  const [adminType, setAdminType] = useState<'school' | 'platform'>('school');
  const [email, setEmail] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'email' | 'otp' | 'device'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;
  const role: Extract<AppRole, 'school_admin' | 'super_admin'> = adminType === 'school' ? 'school_admin' : 'super_admin';

  const close = () => {
    setStep('email');
    setOtp(['', '', '', '', '', '']);
    setError('');
    onClose();
  };

  const sendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.includes('@') || (adminType === 'school' && !schoolCode.trim())) {
      setError('Enter the registered admin email and school code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await requestAdminOtp(email);
      setStep('otp');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send admin OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await verifyAdminOtp(email, otp.join(''), role, adminType === 'school' ? schoolCode : undefined);
      if (result.conflict) setStep('device');
      else onAuthenticated(result.session);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to verify admin access.');
    } finally {
      setLoading(false);
    }
  };

  const replaceDevice = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await finishAuthentication(true);
      if (!result.session || result.session.role !== role) throw new Error('Administrative role verification failed.');
      onAuthenticated(result.session);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to continue on this device.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs" role="dialog" aria-modal="true">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-slate-900 px-6 py-5 text-white">
          <div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/20"><Lock className="h-5 w-5 text-blue-400" /></div><div><h3 className="text-lg font-bold">Admin & School Gateway</h3><p className="text-xs text-slate-400">Database-backed permissions</p></div></div>
          <button onClick={close} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">
          {step === 'email' && (
            <form onSubmit={sendOtp} className="space-y-4">
              <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                <button type="button" onClick={() => setAdminType('school')} className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${adminType === 'school' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}`}><Building2 className="h-3.5 w-3.5" /> School Admin</button>
                <button type="button" onClick={() => setAdminType('platform')} className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${adminType === 'platform' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}`}><ShieldAlert className="h-3.5 w-3.5" /> Super Admin</button>
              </div>
              <p className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-800">Role and school scope are verified from protected database records. Email metadata is never trusted for authorization.</p>
              {adminType === 'school' && <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">School Code</span><input value={schoolCode} onChange={(e) => setSchoolCode(e.target.value.toUpperCase())} className="input font-mono" placeholder="SCH-CBSE-4091" required /></label>}
              <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">Registered Admin Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="admin@institution.edu" required /></label>
              {error && <ErrorMessage message={error} />}
              <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60">{loading ? <Spinner /> : <>Send Secure OTP <ArrowRight className="h-4 w-4" /></>}</button>
            </form>
          )}
          {step === 'otp' && (
            <form onSubmit={verify} className="space-y-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600"><KeyRound className="h-6 w-6" /></div>
              <div><h4 className="text-xl font-bold text-slate-900">Verify administrator</h4><p className="mt-1 text-sm text-slate-500">Enter the code sent to {email}.</p></div>
              <div className="flex justify-center gap-2">{otp.map((value, index) => <input key={index} id={`admin-otp-${index}`} inputMode="numeric" maxLength={1} value={value} onChange={(e) => { const next = [...otp]; next[index] = e.target.value.replace(/\D/g, '').slice(-1); setOtp(next); if (next[index]) document.getElementById(`admin-otp-${index + 1}`)?.focus(); }} className="h-12 w-11 rounded-xl border border-slate-200 text-center text-lg font-bold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />)}</div>
              {error && <ErrorMessage message={error} />}
              <button disabled={loading || otp.join('').length !== 6} className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60">{loading ? <Spinner /> : 'Open Admin Workspace'}</button>
            </form>
          )}
          {step === 'device' && (
            <div className="space-y-4 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600"><Laptop className="h-7 w-7" /></div><div><h4 className="text-xl font-bold text-slate-900">Another session is active</h4><p className="mt-2 text-sm text-slate-500">End that session before opening this privileged workspace.</p></div>{error && <ErrorMessage message={error} />}<button onClick={replaceDevice} disabled={loading} className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white disabled:opacity-60">{loading ? <Spinner /> : 'Logout Other Device & Continue'}</button></div>
          )}
        </div>
      </div>
    </div>
  );
};

const ErrorMessage = ({ message }: { message: string }) => <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-left text-xs font-medium text-red-600">{message}</div>;
const Spinner = () => <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />;
