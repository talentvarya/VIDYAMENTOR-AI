import React from 'react';
import { Check, Clock3, LockKeyhole, LogOut, ShieldAlert } from 'lucide-react';
import type { AuthSession, StudentStatus } from '../../types';

const stages: { statuses: StudentStatus[]; label: string }[] = [
  { statuses: ['created_draft'], label: 'Profile created / draft' },
  { statuses: ['pending_verification'], label: 'Verification review' },
  { statuses: ['pending_payment'], label: 'Payment confirmation' },
  { statuses: ['pending_activation'], label: 'Admin / school activation' },
  { statuses: ['active_normal', 'active_advanced'], label: 'Learning access active' },
];

export const AccessPendingScreen: React.FC<{ session: AuthSession; onLogout: () => void }> = ({ session, onLogout }) => {
  const status = session.studentStatus ?? 'created_draft';
  const currentIndex = Math.max(0, stages.findIndex((stage) => stage.statuses.includes(status)));
  const blocked = ['suspended', 'banned', 'expired'].includes(status);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-7 text-white sm:p-9">
          <div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">VIDYAMENTOR AI</p><h1 className="mt-2 text-2xl font-extrabold">{blocked ? 'Account access is restricted' : 'Your application is in progress'}</h1><p className="mt-2 text-sm leading-6 text-blue-100">{session.profile?.fullName || session.profile?.email || 'Student'} · {status.replaceAll('_', ' ')}</p></div><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">{blocked ? <ShieldAlert className="h-6 w-6" /> : <Clock3 className="h-6 w-6" />}</div></div>
        </div>
        <div className="p-6 sm:p-9">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" /><p><strong>Learning is securely locked.</strong> Courses, AI Tutor, tests, notes, community and every protected LMS route return no data until the database status becomes Active.</p></div></div>
          {!blocked && <div className="mt-7 space-y-3">{stages.map((stage, index) => { const complete = index < currentIndex; const current = index === currentIndex; return <div key={stage.label} className={`flex items-center gap-3 rounded-xl border p-3.5 ${current ? 'border-blue-200 bg-blue-50' : 'border-slate-100'}`}><span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${complete ? 'bg-emerald-100 text-emerald-700' : current ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{complete ? <Check className="h-4 w-4" /> : index + 1}</span><span className={`text-sm font-semibold ${current ? 'text-blue-900' : 'text-slate-600'}`}>{stage.label}</span></div>; })}</div>}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-slate-500">Status updates are controlled by authorized school/platform administrators and recorded in the audit log.</p><button onClick={onLogout} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><LogOut className="h-4 w-4" /> Sign out</button></div>
        </div>
      </div>
    </main>
  );
};

export const DeviceConflictScreen: React.FC<{ onContinue: () => void; onLogout: () => void; loading: boolean; error?: string }> = ({ onContinue, onLogout, loading, error }) => (
  <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4"><div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600"><LockKeyhole className="h-7 w-7" /></div><h1 className="mt-5 text-xl font-extrabold text-slate-900">One active device allowed</h1><p className="mt-2 text-sm leading-6 text-slate-500">This account is active elsewhere. You can securely end that session and continue here.</p>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-600">{error}</p>}<button onClick={onContinue} disabled={loading} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Securing session…' : 'Logout Other Device & Continue'}</button><button onClick={onLogout} className="mt-3 text-xs font-semibold text-slate-500 hover:text-slate-900">Cancel and sign out</button></div></main>
);
