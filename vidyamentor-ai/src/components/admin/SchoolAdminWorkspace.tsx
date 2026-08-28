import React, { useEffect, useMemo, useState } from 'react';
import { Building2, FileSpreadsheet, GraduationCap, LogOut, Plus, RefreshCw, ShieldCheck, Upload } from 'lucide-react';
import {
  createStudentInvite,
  fetchAdminStudents,
  fetchLicenseSummary,
  importStudents,
  updateStudentStatus,
  type AdminStudentRow,
  type LicenseSummary,
} from '../../lib/api';
import type { AuthSession, StudentProfile, SupportedLanguage } from '../../types';

const emptyStudent = (session: AuthSession): StudentProfile => ({
  fullName: '', email: '', dateOfBirth: '', classLevel: 'Class 10', board: 'CBSE', studentId: '',
  schoolName: session.schoolName || '', schoolCode: session.schoolCode || '', section: '', languages: ['English', 'Hinglish'],
});

const normalizeHeader = (value: unknown) => String(value ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');

const parseCsv = (text: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(cell.trim()); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = '';
    } else cell += char;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
};

const tabularRows = (rows: unknown[][]) => {
  const [header = [], ...values] = rows;
  const keys = header.map(normalizeHeader);
  const cellValue = (value: unknown) => value instanceof Date
    ? value.toISOString().slice(0, 10)
    : String(value ?? '').trim();
  return values.map((row) => Object.fromEntries(keys.map((key, index) => [key, cellValue(row[index])])))
    .filter((row) => Object.values(row).some(Boolean));
};

export const SchoolAdminWorkspace: React.FC<{ session: AuthSession; onLogout: () => void }> = ({ session, onLogout }) => {
  const [students, setStudents] = useState<AdminStudentRow[]>([]);
  const [licenses, setLicenses] = useState<LicenseSummary[]>([]);
  const [student, setStudent] = useState<StudentProfile>(() => emptyStudent(session));
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const [studentRows, licenceRows] = await Promise.all([fetchAdminStudents(), fetchLicenseSummary()]);
      setStudents(studentRows);
      setLicenses(licenceRows);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load the school workspace.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void refresh(); }, []);

  const totals = useMemo(() => licenses.reduce((sum, item) => ({ purchased: sum.purchased + item.purchased, assigned: sum.assigned + item.assigned, available: sum.available + item.available }), { purchased: 0, assigned: 0, available: 0 }), [licenses]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault(); setWorking(true); setError(''); setNotice('');
    try {
      const result = await createStudentInvite(session.token, student);
      setNotice(result.created ? 'Student account created. They can now sign in by email OTP.' : 'Invite recorded for the existing email.');
      setStudent(emptyStudent(session)); setShowCreate(false); await refresh();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to create student.'); }
    finally { setWorking(false); }
  };

  const importFile = async (file?: File) => {
    if (!file) return;
    setWorking(true); setError(''); setNotice('');
    try {
      const matrix = file.name.toLowerCase().endsWith('.xlsx')
        ? ((await (await import('read-excel-file/browser')).default(file))[0]?.data ?? [])
        : parseCsv(await file.text());
      const rows = tabularRows(matrix);
      if (!rows.length) throw new Error('The file has no student rows. Use the required template headers.');
      const result = await importStudents(session.token, file.name, rows);
      setNotice(`Import ${result.importId.slice(0, 8)}: ${result.created} created, ${result.failed} failed.`);
      await refresh();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Import failed.'); }
    finally { setWorking(false); }
  };

  const activate = async (row: AdminStudentRow) => {
    setWorking(true); setError('');
    try { await updateStudentStatus(row.user_id, 'active_normal', 'Activated by School Admin'); await refresh(); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Activation failed.'); }
    finally { setWorking(false); }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white"><Building2 className="h-5 w-5" /></div><div><p className="font-extrabold text-slate-900">{session.schoolName || 'School Admin'}</p><p className="text-xs text-slate-500">{session.schoolCode} · tenant-isolated workspace</p></div></div><button onClick={onLogout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold hover:bg-slate-50"><LogOut className="h-4 w-4" /> Sign out</button></div></header>
      <div className="mx-auto max-w-7xl space-y-6 px-5 py-7">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">School Administration</p><h1 className="mt-1 text-2xl font-extrabold text-slate-900">Students & licences</h1></div><div className="flex flex-wrap gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold hover:bg-slate-50"><Upload className="h-4 w-4" /> CSV / Excel import<input type="file" accept=".csv,.xlsx" className="hidden" disabled={working} onChange={(event) => { void importFile(event.target.files?.[0]); event.target.value = ''; }} /></label><button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Add student</button><button onClick={() => void refresh()} className="rounded-xl border border-slate-200 bg-white p-2.5" aria-label="Refresh"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button></div></section>
        {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{notice}</div>}
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Students" value={students.length} icon={<GraduationCap className="h-5 w-5" />} /><Stat label="Purchased" value={totals.purchased} /><Stat label="Assigned" value={totals.assigned} /><Stat label="Available" value={totals.available} highlight /></section>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-extrabold text-slate-900">School students</h2><p className="text-xs text-slate-500">RLS returns only this school’s records.</p></div><ShieldCheck className="h-5 w-5 text-emerald-600" /></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Student</th><th className="px-5 py-3">Class</th><th className="px-5 py-3">Student ID</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100">{students.map((row) => <tr key={row.user_id}><td className="px-5 py-4"><p className="font-bold text-slate-900">{row.full_name}</p><p className="text-xs text-slate-500">{row.email}</p></td><td className="px-5 py-4">{row.class_level}{row.section ? ` · ${row.section}` : ''}</td><td className="px-5 py-4 font-mono text-xs">{row.student_id}</td><td className="px-5 py-4"><StatusBadge status={row.status} /></td><td className="px-5 py-4 text-right">{row.status === 'pending_activation' && <button disabled={working} onClick={() => void activate(row)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">Activate</button>}</td></tr>)}{!students.length && <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">No students are visible in this school yet.</td></tr>}</tbody></table></div></section>
        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-blue-900"><strong>Import headers:</strong> full_name, email, date_of_birth (YYYY-MM-DD), class_level, board, student_id, section, language_1, language_2. Maximum 1,000 rows per CSV/XLSX file.</section>
      </div>

      {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"><form onSubmit={create} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><h2 className="text-xl font-extrabold text-slate-900">Create school student</h2><p className="text-xs text-slate-500">An OTP-ready auth account and pending profile will be created.</p></div><button type="button" onClick={() => setShowCreate(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-slate-500">Close</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Input label="Full name" value={student.fullName} onChange={(value) => setStudent({ ...student, fullName: value })} /><Input label="Email" type="email" value={student.email} onChange={(value) => setStudent({ ...student, email: value })} /><Input label="Date of birth" type="date" value={student.dateOfBirth} onChange={(value) => setStudent({ ...student, dateOfBirth: value })} /><Input label="Student ID" value={student.studentId} onChange={(value) => setStudent({ ...student, studentId: value })} /><Select label="Class" value={student.classLevel} options={['Class 9', 'Class 10', 'Class 11', 'Class 12']} onChange={(value) => setStudent({ ...student, classLevel: value })} /><Select label="Board" value={student.board} options={['CBSE', 'ICSE', 'State Board']} onChange={(value) => setStudent({ ...student, board: value })} /><Input label="Section" value={student.section || ''} onChange={(value) => setStudent({ ...student, section: value })} /><Select label="Language 1" value={student.languages[0]} options={['English', 'Hinglish', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati']} onChange={(value) => setStudent({ ...student, languages: [value as SupportedLanguage, student.languages[1]] })} /><Select label="Language 2" value={student.languages[1]} options={['English', 'Hinglish', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati'].filter((item) => item !== student.languages[0])} onChange={(value) => setStudent({ ...student, languages: [student.languages[0], value as SupportedLanguage] })} /></div>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-600">{error}</p>}<button disabled={working} className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{working ? 'Creating…' : 'Create Student Account'}</button></form></div>}
    </main>
  );
};

const Stat = ({ label, value, icon, highlight }: { label: string; value: number; icon?: React.ReactNode; highlight?: boolean }) => <div className={`rounded-2xl border p-5 shadow-sm ${highlight ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>{icon}</div><p className={`mt-2 text-3xl font-extrabold ${highlight ? 'text-emerald-700' : 'text-slate-900'}`}>{value}</p></div>;
const StatusBadge = ({ status }: { status: string }) => <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${status.startsWith('active') ? 'bg-emerald-100 text-emerald-700' : status.includes('pending') ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{status.replaceAll('_', ' ')}</span>;
const Input = ({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) => <label><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span><input required type={type} value={value} onChange={(event) => onChange(event.target.value)} className="input" /></label>;
const Select = ({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) => <label><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="input">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
