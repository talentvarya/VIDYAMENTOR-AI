import type { StudentProfile } from '../../src/types';
import { allowPostOnly, ApiRequest, ApiResponse, isEmail, readBody, sendError } from '../../server/http';
import { createAdminSupabase, requireAuthenticatedUser } from '../../server/supabase';

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (!allowPostOnly(request, response)) return;

  try {
    const profile = readBody<StudentProfile>(request);
    if (
      !isEmail(String(profile.email ?? ''))
      || !profile.fullName
      || !profile.dateOfBirth
      || !profile.studentId
      || !profile.languages?.[0]
      || !profile.languages?.[1]
      || profile.languages[0] === profile.languages[1]
    ) {
      return sendError(response, 400, 'Complete all required student fields.');
    }

    const { client } = await requireAuthenticatedUser(request);
    const { data: context, error: contextError } = await client.rpc('get_access_context');
    if (contextError || !context || !['school_admin', 'super_admin'].includes(String(context.role))) {
      return sendError(response, 403, 'Administrative access is required.');
    }
    if (!context.hasActiveDeviceSession) return sendError(response, 403, 'This admin device session is not active.');

    const { data: invite, error: inviteError } = await client.rpc('school_create_student_invite', {
      p_full_name: profile.fullName,
      p_email: profile.email,
      p_date_of_birth: profile.dateOfBirth,
      p_class_level: profile.classLevel,
      p_board: profile.board,
      p_student_id: profile.studentId,
      p_section: profile.section || null,
      p_language_1: profile.languages[0],
      p_language_2: profile.languages[1],
      p_school_id: context.role === 'super_admin' ? context.schoolId : null,
    });
    if (inviteError) throw inviteError;

    const admin = createAdminSupabase();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: profile.email.trim().toLowerCase(),
      email_confirm: false,
    });

    if (createError && !/already|registered|exists/i.test(createError.message)) throw createError;
    response.status(201).json({
      inviteId: invite.id,
      userId: created.user?.id ?? invite.invited_user_id ?? '',
      created: Boolean(created.user),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create the student.';
    const status = /access|required|session/i.test(message) ? 403 : /configured/i.test(message) ? 503 : 400;
    sendError(response, status, message);
  }
}
