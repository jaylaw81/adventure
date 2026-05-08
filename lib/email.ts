import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM ?? 'StoryQuestor <noreply@storyquestor.com>'
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://www.storyquestor.com'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export async function sendSurveyReply(opts: {
  to: string
  subject: string
  message: string
  originalFeedback: { likes: string | null; dislikes: string | null; featureRequests: string | null }
}) {
  const { to, subject, message, originalFeedback } = opts

  const quoteRow = (label: string, value: string | null) =>
    value
      ? `<tr>
          <td style="padding:6px 10px;font-weight:600;color:#6d28d9;vertical-align:top;white-space:nowrap;width:130px;">${escapeHtml(label)}</td>
          <td style="padding:6px 10px;color:#374151;">${escapeHtml(value)}</td>
        </tr>`
      : ''

  await resend.emails.send({
    from: FROM,
    to,
    replyTo: 'contact@storyquestor.com',
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#111;">
          <h1 style="font-size:22px;font-weight:800;margin-bottom:4px;">
            Story<span style="color:#f59e0b;">Questor</span>
          </h1>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

          <div style="font-size:15px;line-height:1.7;color:#1e0a3c;white-space:pre-wrap;">${escapeHtml(message)}</div>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 16px;" />

          <p style="font-size:12px;color:#9ca3af;margin-bottom:8px;">Your original feedback:</p>
          <table style="width:100%;border-collapse:collapse;font-size:13px;background:#f9fafb;border-radius:8px;overflow:hidden;">
            ${quoteRow('What you liked', originalFeedback.likes)}
            ${quoteRow('What could improve', originalFeedback.dislikes)}
            ${quoteRow('Feature requests', originalFeedback.featureRequests)}
          </table>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 12px;" />
          <p style="font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} StoryQuestor &mdash; <a href="https://www.storyquestor.com" style="color:#9ca3af;">storyquestor.com</a></p>
        </body>
      </html>
    `,
  })
}

export async function sendSurveyNotification(opts: {
  userEmail: string | null
  surveyType: string
  likes: string | null
  dislikes: string | null
  featureRequests: string | null
}) {
  const { userEmail, surveyType, likes, dislikes, featureRequests } = opts

  const row = (label: string, value: string | null) =>
    value
      ? `<tr>
          <td style="padding:10px 12px;font-weight:600;color:#6d28d9;white-space:nowrap;vertical-align:top;width:140px;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;color:#1e0a3c;line-height:1.6;">${escapeHtml(value)}</td>
        </tr>`
      : ''

  await resend.emails.send({
    from: FROM,
    to: 'contact@storyquestor.com',
    subject: `New survey response (${surveyType}) — StoryQuestor`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#111;">
          <h1 style="font-size:22px;font-weight:800;margin-bottom:4px;">
            Story<span style="color:#f59e0b;">Questor</span>
          </h1>
          <p style="color:#6b7280;font-size:14px;margin-top:0;">New Survey Response</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:10px 12px;font-weight:600;color:#6d28d9;white-space:nowrap;vertical-align:top;width:140px;">From</td>
              <td style="padding:10px 12px;color:#1e0a3c;">${userEmail ? escapeHtml(userEmail) : '<em style="color:#9ca3af;">anonymous</em>'}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;font-weight:600;color:#6d28d9;white-space:nowrap;vertical-align:top;width:140px;">Type</td>
              <td style="padding:10px 12px;color:#1e0a3c;">${escapeHtml(surveyType)}</td>
            </tr>
            ${row('What they like', likes)}
            ${row('What they dislike', dislikes)}
            ${row('Feature requests', featureRequests)}
          </table>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
          <p style="font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} StoryQuestor</p>
        </body>
      </html>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  // token is hex (a-f0-9 only) — safe to embed directly in a URL
  const resetUrl = `${SITE_URL}/reset-password?token=${token}`
  const safeEmail = escapeHtml(email)

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Reset your StoryQuestor password',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px; color: #111;">
          <h1 style="font-size: 22px; font-weight: 800; margin-bottom: 4px;">
            Story<span style="color: #f59e0b;">Questor</span>
          </h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 0;">Password Reset</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

          <p style="font-size: 15px; line-height: 1.6;">
            We received a request to reset the password for your account (<strong>${safeEmail}</strong>).
            Click the button below to choose a new password.
          </p>

          <a href="${resetUrl}"
            style="display: inline-block; margin: 16px 0; padding: 12px 28px; background: #f59e0b; color: white;
                   font-weight: 700; font-size: 15px; border-radius: 10px; text-decoration: none;">
            Reset Password
          </a>

          <p style="font-size: 13px; color: #6b7280; line-height: 1.6;">
            This link expires in <strong>1 hour</strong>. If you didn't request a password reset,
            you can safely ignore this email — your password won't change.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af;">
            &copy; ${new Date().getFullYear()} StoryQuestor. All rights reserved.
          </p>
        </body>
      </html>
    `,
  })
}
