import React, { useEffect, useMemo, useState } from 'react';
import { Activity, BadgeCheck, CircleDollarSign, ClipboardCheck, LogOut, RefreshCw, ShieldCheck, Sparkles, Users } from 'lucide-react';
import {
  fetchAdminStudents,
  fetchAuditLogs,
  fetchFreeEducationRequests,
  fetchPricingPlans,
  reviewFreeEducationRequest,
  setAdminWorkspace,
  updateStudentStatus,
  type AdminStudentRow,
  type AuditLogRow,
  type DatabasePricingPlan,
  type FreeEducationRequestRow,
} from '../../lib/api';
import type { AdminWorkspace, AuthSession, StudentStatus } from '../../types';

const nextStatus = (current: StudentStatus, workspace: AdminWorkspace): StudentStatus | null => {
  if (current === 'pending_verification') return 'pending_payment';
  if (current === 'pending_payment') return 'pending_activation';
  if (current === 'pending_activation') return workspace === 'advanced' ? 'active_advanced' : 'active_normal';
  return null;
};

export const SuperAdminWorkspace: React.FC<{ session: AuthSession; onLogout: () => void; onSessionChange: (session: AuthSession) => void }> = ({ session, onLogout, onSessionChange }) => {
  const [students, setStudents] = useState<AdminStudentRow[]>([]);
  const [requests, setRequests] = useState<FreeEducationRequestRow[]>([]);
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [pricing, setPricing] = useState<DatabasePricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = async () => {
    setLoading(true); setError('');
    try {
      const [studentRows, requestRows, auditRows, priceRows] = await Promise.all([
        fetchAdminStudents(), fetchFreeEducationRequests(), fetchAuditLogs(), fetchPricingPlans(),
      ]);
      setStudents(studentRows); setRequests(requestRows); setLogs(auditRows); setPricing(priceRows);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load the Super Admin workspace.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void refresh(); }, []);
  const pendingStudents = useMemo(() => students.filter((student) => student.status.startsWith('pending')), [students]);
  const pendingRequests = useMemo(() => requests.filter((request) => request.status === 'pending' || request.status === 'more_info_requested'), [requests]);

  const chooseWorkspace = async (workspace: AdminWorkspace) => {
    setWorking(true); setError('');
    try { await setAdminWorkspace(workspace); onSessionChange({ ...session, workspace }); setNotice(`Switched to ${workspace} workspace.`); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to switch workspace.'); }
    finally { setWorking(false); }
  };

  const progressStudent = async (student: AdminStudentRow) => {
    const target = nextStatus(student.status, session.workspace);
    if (!target) return;
    setWorking(true); setError('');
    try { await updateStudentStatus(student.user_id, target, `Approved in ${session.workspace} workspace`); setNotice(`${student.full_name} moved to ${target.replaceAll('_', ' ')}.`); await refresh(); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Student approval failed.'); }
    finally { setWorking(false); }
  };

  const reviewRequest = async (request: FreeEducationRequestRow, status: FreeEducationRequestRow['status']) => {
    setWorking(true); setError('');
    try { await reviewFreeEducationRequest(request.id, status, `Reviewed in ${session.workspace} workspace`); setNotice(`Free Education request marked ${status.replaceAll('_', ' ')}.`); await refresh(); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Request review failed.'); }
    finally { setWorking(false); }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600"><ShieldCheck className="h-5 w-5" /></div><div><p className="font-extrabold">VIDYAMENTOR Super Admin</p><p className="text-xs text-slate-400">Platform governance · audited actions</p></div></div><button onClick={onLogout} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm font-bold hover:bg-slate-900"><LogOut className="h-4 w-4" /> Sign out</button></div></header>
      <div className="mx-auto max-w-7xl space-y-6 px-5 py-7">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Phase 1 control plane</p><h1 className="mt-1 text-2xl font-extrabold">Approvals & governance</h1></div><div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-1"><button disabled={working} onClick={() => void chooseWorkspace('normal')} className={`rounded-lg px-4 py-2 text-xs font-bold ${session.workspace === 'normal' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Normal</button><button disabled={working} onClick={() => void chooseWorkspace('advanced')} className={`rounded-lg px-4 py-2 text-xs font-bold ${session.workspace === 'advanced' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}>Advanced</button></div></section>
        {notice && <div className="rounded-xl border border-emerald-800 bg-emerald-950/60 p-3 text-sm text-emerald-300">{notice}</div>}
        {error && <div className="rounded-xl border border-red-800 bg-red-950/60 p-3 text-sm text-red-300">{error}</div>}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><DarkStat label="All students" value={students.length} icon={<Users className="h-5 w-5" />} /><DarkStat label="Pending students" value={pendingStudents.length} icon={<ClipboardCheck className="h-5 w-5" />} /><DarkStat label="Aid reviews" value={pendingRequests.length} icon={<BadgeCheck className="h-5 w-5" />} /><DarkStat label="Audit events" value={logs.length} icon={<Activity className="h-5 w-5" />} /></section>
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Student activation queue" icon={<Users className="h-5 w-5 text-blue-400" />}><div className="divide-y divide-slate-800">{pendingStudents.map((student) => { const target = nextStatus(student.status, session.workspace); return <div key={student.user_id} className="flex items-center justify-between gap-4 py-4"><div className="min-w-0"><p className="truncate text-sm font-bold">{student.full_name}</p><p className="truncate text-xs text-slate-400">{student.email} · {student.class_level} · {student.status.replaceAll('_', ' ')}</p></div>{target && <button disabled={working} onClick={() => void progressStudent(student)} className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Move to {target.replaceAll('_', ' ')}</button>}</div>; })}{!pendingStudents.length && <Empty text="No pending student approvals." />}</div></Panel>
          <Panel title="Free Education requests" icon={<BadgeCheck className="h-5 w-5 text-emerald-400" />}><div className="divide-y divide-slate-800">{pendingRequests.map((request) => <div key={request.id} className="py-4"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold">{request.full_name}</p><p className="text-xs text-slate-400">{request.email} · {request.class_level || 'Class not supplied'}</p></div><span className="rounded-full bg-amber-950 px-2.5 py-1 text-[11px] font-bold text-amber-300">{request.status.replaceAll('_', ' ')}</span></div><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{request.reason}</p><div className="mt-3 flex flex-wrap gap-2"><Action label="Approve" onClick={() => void reviewRequest(request, 'approved')} tone="green" disabled={working} /><Action label="More info" onClick={() => void reviewRequest(request, 'more_info_requested')} disabled={working} /><Action label="Reject" onClick={() => void reviewRequest(request, 'rejected')} tone="red" disabled={working} /></div></div>)}{!pendingRequests.length && <Empty text="No pending Free Education reviews." />}</div></Panel>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          <Panel title="Database pricing" icon={<CircleDollarSign className="h-5 w-5 text-amber-400" />}><div className="space-y-2">{pricing.filter((plan) => plan.workspace === session.workspace).map((plan) => <div key={plan.code} className="flex items-center justify-between rounded-xl border border-slate-800 p-3"><div><p className="text-sm font-bold">{plan.name}</p><p className="text-[11px] text-slate-500">{plan.code}</p></div><div className="text-right"><p className="font-extrabold text-amber-300">₹{(plan.amount_minor / 100).toLocaleString('en-IN')}</p><p className="text-[11px] text-slate-500">{plan.billing_period}</p></div></div>)}</div></Panel>
          <Panel title="Sensitive action audit" icon={<Activity className="h-5 w-5 text-violet-400" />}><div className="space-y-2">{logs.slice(0, 12).map((log) => <div key={log.id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-800 p-3"><div><p className="text-sm font-bold">{log.action}</p><p className="text-[11px] text-slate-500">{log.target_type}{log.target_id ? ` · ${log.target_id.slice(0, 12)}` : ''}</p></div><time className="shrink-0 text-[11px] text-slate-500">{new Date(log.created_at).toLocaleString()}</time></div>)}{!logs.length && <Empty text="Audit events will appear after sensitive actions." />}</div></Panel>
        </div>
        <button onClick={() => void refresh()} className="inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-bold text-slate-300 hover:bg-slate-900"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh workspace</button>
      </div>
    </main>
  );
};

const Panel = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl"><div className="mb-3 flex items-center gap-2">{icon}<h2 className="font-extrabold">{title}</h2></div>{children}</section>;
const DarkStat = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="flex items-center justify-between text-slate-400"><p className="text-xs font-bold uppercase tracking-wider">{label}</p>{icon}</div><p className="mt-2 text-3xl font-extrabold text-white">{value}</p></div>;
const Empty = ({ text }: { text: string }) => <div className="py-8 text-center text-sm text-slate-500"><Sparkles className="mx-auto mb-2 h-5 w-5" />{text}</div>;
const Action = ({ label, onClick, tone = 'slate', disabled }: { label: string; onClick: () => void; tone?: 'slate' | 'green' | 'red'; disabled?: boolean }) => <button onClick={onClick} disabled={disabled} className={`rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-50 ${tone === 'green' ? 'bg-emerald-900 text-emerald-200' : tone === 'red' ? 'bg-red-950 text-red-300' : 'bg-slate-800 text-slate-300'}`}>{label}</button>;
