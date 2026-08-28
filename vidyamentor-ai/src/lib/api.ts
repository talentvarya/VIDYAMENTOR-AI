import type { Session } from '@supabase/supabase-js';
import type {
  AccessContext,
  AppRole,
  AuthSession,
  DeviceConflict,
  StudentProfile,
  StudentStatus,
  CurriculumSubject,
} from '../types';
import { requireSupabase } from './supabase';

interface ApiErrorBody {
  error?: string;
}

export type AuthenticationResult =
  | { session: AuthSession; conflict?: never }
  | { session?: never; conflict: DeviceConflict };

const parseResponse = async <T>(response: Response): Promise<T> => {
  const body = (await response.json().catch(() => ({}))) as T & ApiErrorBody;
  if (!response.ok) throw new Error(body.error || 'Something went wrong. Please try again.');
  return body;
};

const deviceId = () => {
  const key = 'vidyamentor.device-id';
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
};

const deviceName = () => {
  const mobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  return `${mobile ? 'Mobile' : 'Computer'} · ${navigator.platform || 'Browser'}`;
};

const toAuthSession = (session: Session, context: AccessContext): AuthSession => {
  const student = context.student;
  const language1 = student?.language1 ?? 'English';
  const language2 = student?.language2 && student.language2 !== language1 ? student.language2 : 'Hinglish';
  return {
    token: session.access_token,
    expiresAt: (session.expires_at ?? Math.floor(Date.now() / 1000) + 3600) * 1000,
    role: context.role,
    schoolId: context.schoolId,
    schoolName: context.schoolName,
    schoolCode: context.schoolCode,
    workspace: context.workspace,
    studentStatus: student?.status ?? null,
    canAccessLearning: context.canAccessLearning,
    profile: student
      ? {
          fullName: student.fullName,
          email: context.email,
          dateOfBirth: student.dateOfBirth,
          classLevel: student.classLevel,
          board: student.board,
          studentId: student.studentId,
          schoolName: student.schoolName,
          schoolCode: context.schoolCode ?? undefined,
          section: student.section ?? undefined,
          languages: [language1, language2],
        }
      : null,
  };
};

const currentSession = async () => {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  if (!data.session) throw new Error('Your session is missing. Please sign in again.');
  return data.session;
};

export const finishAuthentication = async (forceOtherDevice = false): Promise<AuthenticationResult> => {
  const client = requireSupabase();
  const session = await currentSession();
  const { data: claim, error: claimError } = await client.rpc('claim_device_session', {
    p_device_id: deviceId(),
    p_device_name: deviceName(),
    p_force: forceOtherDevice,
  });
  if (claimError) throw claimError;
  if (!claim?.ok) {
    return {
      conflict: {
        conflict: true,
        otherDeviceName: claim?.otherDeviceName ?? undefined,
        lastSeenAt: claim?.lastSeenAt ?? undefined,
      },
    };
  }

  const { data: context, error: contextError } = await client.rpc('get_access_context');
  if (contextError) throw contextError;
  if (!context) throw new Error('Your access profile is not configured yet.');
  return { session: toAuthSession(session, context as AccessContext) };
};

export const restoreAuthSession = async (): Promise<AuthenticationResult | null> => {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  if (!data.session) return null;
  return finishAuthentication(false);
};

export const requestStudentOtp = async (email: string) => {
  const client = requireSupabase();
  const { error } = await client.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
  return { delivery: 'email' };
};

export const verifyStudentOtp = async (
  email: string,
  code: string,
  profile: StudentProfile,
): Promise<AuthenticationResult> => {
  const client = requireSupabase();
  const { error } = await client.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: code,
    type: 'email',
  });
  if (error) throw error;

  const { error: profileError } = await client.rpc('submit_student_profile', {
    p_full_name: profile.fullName,
    p_email: profile.email,
    p_date_of_birth: profile.dateOfBirth,
    p_class_level: profile.classLevel,
    p_board: profile.board,
    p_student_id: profile.studentId,
    p_school_name: profile.schoolName,
    p_school_code: profile.schoolCode || null,
    p_section: profile.section || null,
    p_language_1: profile.languages[0],
    p_language_2: profile.languages[1],
  });
  if (profileError) {
    await client.auth.signOut();
    throw profileError;
  }
  return finishAuthentication(false);
};

export const requestAdminOtp = async (email: string) => {
  const client = requireSupabase();
  const { error } = await client.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: false },
  });
  if (error) throw error;
};

export const verifyAdminOtp = async (
  email: string,
  code: string,
  expectedRole: Extract<AppRole, 'school_admin' | 'super_admin'>,
  schoolCode?: string,
): Promise<AuthenticationResult> => {
  const client = requireSupabase();
  const { error } = await client.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code, type: 'email' });
  if (error) throw error;
  const result = await finishAuthentication(false);
  if (!result.session) return result;
  if (result.session.role !== expectedRole) {
    await client.auth.signOut();
    throw new Error('This account does not have the selected administrative role.');
  }
  if (
    expectedRole === 'school_admin'
    && schoolCode
    && result.session.schoolCode?.toLowerCase() !== schoolCode.trim().toLowerCase()
  ) {
    await client.auth.signOut();
    throw new Error('This administrator is not assigned to that school code.');
  }
  return result;
};

export const signOut = async () => {
  const client = requireSupabase();
  await client.auth.signOut();
};

export const askTutor = async (
  token: string,
  payload: { question: string; classLevel: string; subject: string; language: string; chapter?: string },
) => {
  const response = await fetch('/api/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return parseResponse<{ answer: string; sourceLabel: string }>(response);
};

export const fetchStudentCurriculum = async (classLevel: string, board: string): Promise<CurriculumSubject[]> => {
  const client = requireSupabase();
  const classCode = classLevel.replace(/\D+/g, '');
  const boardCode = board.toUpperCase().includes('CBSE') ? 'CBSE' : board.toUpperCase().includes('ICSE') ? 'ICSE' : 'STATE';
  const { data, error } = await client
    .from('kb_chapters')
    .select(`
      id,title,description,duration_minutes,objectives,sort_order,
      kb_subjects!inner(
        id,name,
        kb_classes!inner(
          code,
          kb_academic_years!inner(
            kb_boards!inner(code)
          )
        )
      )
    `)
    .eq('is_published', true)
    .eq('kb_subjects.kb_classes.code', classCode)
    .eq('kb_subjects.kb_classes.kb_academic_years.kb_boards.code', boardCode)
    .order('sort_order');
  if (error) throw error;

  const colors = ['blue', 'emerald', 'amber', 'violet', 'indigo', 'lime', 'rose'];
  const grouped = new Map<string, CurriculumSubject>();
  for (const row of data ?? []) {
    const subject = row.kb_subjects as unknown as { id: string; name: string };
    const current = grouped.get(subject.id) ?? {
      id: subject.id,
      name: subject.name,
      color: colors[grouped.size % colors.length],
      chapters: [],
    };
    current.chapters.push({
      id: row.id,
      title: row.title,
      description: row.description || '',
      durationMinutes: row.duration_minutes,
      objectives: Array.isArray(row.objectives) ? row.objectives.map(String) : [],
    });
    grouped.set(subject.id, current);
  }
  return [...grouped.values()];
};

export const submitLead = async (type: 'free-education' | 'school-enquiry', data: Record<string, string>) => {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, data }),
  });
  return parseResponse<{ referenceId: string }>(response);
};

export interface AdminStudentRow {
  user_id: string;
  full_name: string;
  email: string;
  class_level: string;
  section: string | null;
  student_id: string;
  status: StudentStatus;
  school_id: string | null;
  created_at: string;
}

export const fetchAdminStudents = async () => {
  const client = requireSupabase();
  const { data, error } = await client
    .from('student_profiles')
    .select('user_id,full_name,email,class_level,section,student_id,status,school_id,created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as AdminStudentRow[];
};

export const updateStudentStatus = async (studentUserId: string, status: StudentStatus, reason?: string) => {
  const client = requireSupabase();
  const { data, error } = await client.rpc('admin_set_student_status', {
    p_student_user_id: studentUserId,
    p_status: status,
    p_reason: reason || null,
  });
  if (error) throw error;
  return data;
};

export interface LicenseSummary {
  pool_id: string;
  school_id: string;
  workspace: 'normal' | 'advanced';
  purchased: number;
  assigned: number;
  available: number;
  valid_from: string;
  valid_until: string;
}

export const fetchLicenseSummary = async () => {
  const client = requireSupabase();
  const { data, error } = await client.from('school_license_summary').select('*').order('valid_until');
  if (error) throw error;
  return (data ?? []) as LicenseSummary[];
};

export interface FreeEducationRequestRow {
  id: string;
  full_name: string;
  email: string;
  class_level: string | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'more_info_requested';
  created_at: string;
}

export const fetchFreeEducationRequests = async () => {
  const client = requireSupabase();
  const { data, error } = await client
    .from('free_education_requests')
    .select('id,full_name,email,class_level,reason,status,created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as FreeEducationRequestRow[];
};

export const reviewFreeEducationRequest = async (
  requestId: string,
  status: FreeEducationRequestRow['status'],
  notes?: string,
) => {
  const client = requireSupabase();
  const { data, error } = await client.rpc('admin_review_free_education', {
    p_request_id: requestId,
    p_status: status,
    p_notes: notes || null,
  });
  if (error) throw error;
  return data;
};

export const setAdminWorkspace = async (workspace: 'normal' | 'advanced') => {
  const client = requireSupabase();
  const { data, error } = await client.rpc('set_admin_workspace', { p_workspace: workspace });
  if (error) throw error;
  return data;
};

export const createStudentInvite = async (token: string, profile: StudentProfile) => {
  const response = await fetch('/api/admin/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(profile),
  });
  return parseResponse<{ inviteId: string; userId: string; created: boolean }>(response);
};

export const createBulkImport = async (filename: string, rows: Record<string, string>[]) => {
  const client = requireSupabase();
  const sourceFormat = filename.toLowerCase().endsWith('.xlsx') ? 'xlsx' : 'csv';
  const { data, error } = await client.rpc('school_create_bulk_import', {
    p_filename: filename,
    p_source_format: sourceFormat,
    p_rows: rows,
  });
  if (error) throw error;
  return data as string;
};

export const importStudents = async (token: string, filename: string, rows: Record<string, string>[]) => {
  const response = await fetch('/api/admin/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ filename, rows }),
  });
  return parseResponse<{ importId: string; total: number; created: number; failed: number }>(response);
};

export interface AuditLogRow {
  id: number;
  action: string;
  target_type: string;
  target_id: string | null;
  reason: string | null;
  created_at: string;
}

export const fetchAuditLogs = async () => {
  const client = requireSupabase();
  const { data, error } = await client
    .from('admin_audit_logs')
    .select('id,action,target_type,target_id,reason,created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as AuditLogRow[];
};

export interface DatabasePricingPlan {
  code: string;
  name: string;
  workspace: 'normal' | 'advanced';
  amount_minor: number;
  currency: string;
  billing_period: string;
  is_active: boolean;
}

export const fetchPricingPlans = async () => {
  const client = requireSupabase();
  const { data, error } = await client
    .from('pricing_plans')
    .select('code,name,workspace,amount_minor,currency,billing_period,is_active')
    .order('display_order');
  if (error) throw error;
  return (data ?? []) as DatabasePricingPlan[];
};
