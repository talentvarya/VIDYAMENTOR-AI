import { allowPostOnly, ApiRequest, ApiResponse, readBody, sendError } from '../../server/http';
import { createAdminSupabase, requireAuthenticatedUser } from '../../server/supabase';

interface ImportBody {
  filename?: string;
  rows?: Record<string, string>[];
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (!allowPostOnly(request, response)) return;

  try {
    const body = readBody<ImportBody>(request);
    const filename = String(body.filename ?? '').trim();
    const rows = Array.isArray(body.rows) ? body.rows.slice(0, 1000) : [];
    if (!filename || !rows.length) return sendError(response, 400, 'Choose a CSV or XLSX file with student rows.');

    const { client } = await requireAuthenticatedUser(request);
    const { data: context, error: contextError } = await client.rpc('get_access_context');
    if (contextError || context?.role !== 'school_admin' || !context.hasActiveDeviceSession) {
      return sendError(response, 403, 'An active School Admin session is required.');
    }

    const sourceFormat = filename.toLowerCase().endsWith('.xlsx') ? 'xlsx' : 'csv';
    const { data: importId, error: importError } = await client.rpc('school_create_bulk_import', {
      p_filename: filename,
      p_source_format: sourceFormat,
      p_rows: rows,
    });
    if (importError) throw importError;

    const admin = createAdminSupabase();
    let createdCount = 0;
    let failedCount = 0;

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      try {
        const { data: invite, error: inviteError } = await client.rpc('school_create_student_invite', {
          p_full_name: row.full_name,
          p_email: row.email,
          p_date_of_birth: row.date_of_birth,
          p_class_level: row.class_level,
          p_board: row.board,
          p_student_id: row.student_id,
          p_section: row.section || null,
          p_language_1: row.language_1 || 'English',
          p_language_2: row.language_2 || 'Hinglish',
          p_school_id: null,
        });
        if (inviteError) throw inviteError;

        const { data: created, error: createError } = await admin.auth.admin.createUser({
          email: row.email.trim().toLowerCase(),
          email_confirm: false,
        });
        if (createError) throw createError;

        await admin
          .from('bulk_student_import_rows')
          .update({ status: 'created', student_invite_id: invite.id, validation_errors: [] })
          .eq('import_id', importId)
          .eq('row_number', index + 1);
        createdCount += created.user ? 1 : 0;
      } catch (rowError) {
        failedCount += 1;
        await admin
          .from('bulk_student_import_rows')
          .update({
            status: 'failed',
            validation_errors: [rowError instanceof Error ? rowError.message : 'Student could not be created'],
          })
          .eq('import_id', importId)
          .eq('row_number', index + 1);
      }
    }

    await admin.from('bulk_student_imports').update({
      status: failedCount ? 'completed_with_errors' : 'completed',
      created_rows: createdCount,
      invalid_rows: failedCount,
    }).eq('id', importId);

    response.status(201).json({ importId, total: rows.length, created: createdCount, failed: failedCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to import students.';
    sendError(response, /access|required|session/i.test(message) ? 403 : /configured/i.test(message) ? 503 : 400, message);
  }
}
