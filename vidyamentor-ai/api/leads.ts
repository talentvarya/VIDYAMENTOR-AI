import { escapeHtml, sendEmail } from '../server/email';
import { allowPostOnly, ApiRequest, ApiResponse, isEmail, normalizeEmail, readBody, sendError } from '../server/http';
import { createAdminSupabase } from '../server/supabase';

interface LeadBody {
  type?: 'free-education' | 'school-enquiry';
  data?: Record<string, unknown>;
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (!allowPostOnly(request, response)) return;

  try {
    const body = readBody<LeadBody>(request);
    const type = body.type;
    const data = body.data ?? {};
    if (!['free-education', 'school-enquiry'].includes(String(type))) {
      return sendError(response, 400, 'Invalid enquiry type.');
    }

    const emailKey = type === 'free-education' ? 'email' : 'officialEmail';
    const replyTo = normalizeEmail(data[emailKey]);
    if (!isEmail(replyTo)) return sendError(response, 400, 'Enter a valid contact email.');

    const admin = createAdminSupabase();
    let referenceId = '';
    if (type === 'free-education') {
      const { data: stored, error: storeError } = await admin
        .from('free_education_requests')
        .insert({
          full_name: String(data.studentName ?? '').trim(),
          email: replyTo,
          phone: String(data.phone ?? '').trim() || null,
          class_level: String(data.classLevel ?? '').trim() || null,
          school_name: String(data.schoolName ?? '').trim() || null,
          reason: String(data.reason ?? '').trim(),
          supporting_documents: [],
          status: 'pending',
        })
        .select('id')
        .single();
      if (storeError) throw storeError;
      referenceId = `VM-AID-${stored.id.slice(0, 8).toUpperCase()}`;
    } else {
      const strength = Number.parseInt(String(data.studentStrength ?? '').replace(/\D+/g, ''), 10);
      const { data: stored, error: storeError } = await admin
        .from('school_enquiries')
        .insert({
          school_name: String(data.institutionName ?? '').trim(),
          contact_name: String(data.contactPerson ?? '').trim(),
          email: replyTo,
          phone: String(data.phoneNumber ?? '').trim() || null,
          city: String(data.cityState ?? '').trim() || null,
          student_count: Number.isFinite(strength) ? strength : null,
          message: JSON.stringify({ designation: data.designation, board: data.board, notes: data.notes }),
        })
        .select('id')
        .single();
      if (storeError) throw storeError;
      referenceId = `VM-SCHOOL-${stored.id.slice(0, 8).toUpperCase()}`;
    }

    const recipient = process.env.LEADS_TO_EMAIL;

    const rows = Object.entries(data)
      .slice(0, 20)
      .map(([key, value]) => `<tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:700">${escapeHtml(key)}</td><td style="padding:8px;border:1px solid #e2e8f0">${escapeHtml(String(value).slice(0, 2000))}</td></tr>`)
      .join('');

    if (recipient && process.env.RESEND_API_KEY) {
      await sendEmail({
        to: recipient,
        replyTo,
        subject: `${type === 'free-education' ? 'Free education application' : 'School partnership enquiry'} — ${referenceId}`,
        html: `<div style="font-family:Arial,sans-serif;color:#0f172a"><h2>VIDYAMENTOR AI enquiry</h2><p>Reference: <strong>${referenceId}</strong></p><table style="border-collapse:collapse;width:100%">${rows}</table></div>`,
      });
    }

    response.status(202).json({ referenceId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to submit the enquiry.';
    sendError(response, message.includes('configured') ? 503 : 500, message);
  }
}
