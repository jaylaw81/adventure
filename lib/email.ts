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

export async function sendWaitlistAccepted(opts: {
  to: string
  name: string | null
  inviteToken: string
  expiresAt: Date
}) {
  const { to, name, inviteToken, expiresAt } = opts
  const setupUrl = `${SITE_URL}/org/setup?token=${encodeURIComponent(inviteToken)}`
  const greeting = name ? escapeHtml(name) : 'there'
  const expiryDate = expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  await resend.emails.send({
    from: FROM,
    to,
    replyTo: 'contact@storyquestor.com',
    subject: "You're invited to join the StoryQuestor Organization beta",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:32px 16px;color:#111;">
          <h1 style="font-size:22px;font-weight:800;margin-bottom:4px;">
            Story<span style="color:#f59e0b;">Questor</span>
          </h1>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

          <p style="font-size:15px;line-height:1.7;color:#1e0a3c;">Hi ${greeting},</p>
          <p style="font-size:15px;line-height:1.7;color:#1e0a3c;">
            Great news — you&apos;ve been accepted into the <strong>StoryQuestor Organization beta</strong>!
            You can now create your school or organization account and start managing stories, members, and groups.
          </p>

          <div style="margin:28px 0;padding:20px 24px;background:#faf5ff;border-radius:12px;border:1px solid #e9d5ff;">
            <p style="font-size:13px;font-weight:700;color:#6d28d9;margin:0 0 8px;">Your personal invite link</p>
            <a href="${setupUrl}"
              style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;
                     font-weight:700;font-size:15px;border-radius:10px;text-decoration:none;margin-bottom:12px;">
              Set Up My Organization
            </a>
            <p style="font-size:12px;color:#7c3aed;margin:8px 0 0;">
              This link is valid until <strong>${expiryDate}</strong> and can only be used with this email address
              (<strong>${escapeHtml(to)}</strong>). Do not share it with others.
            </p>
          </div>

          <p style="font-size:14px;font-weight:700;color:#1e0a3c;margin-bottom:8px;">How it works:</p>
          <ol style="font-size:14px;line-height:1.8;color:#374151;padding-left:20px;margin:0 0 20px;">
            <li>Click the button above to go to the setup page.</li>
            <li>Sign in or create a StoryQuestor account using <strong>${escapeHtml(to)}</strong>.</li>
            <li>Enter your organization name and complete setup.</li>
            <li>You&apos;ll immediately have access to the full Organization dashboard.</li>
          </ol>

          <p style="font-size:13px;color:#6b7280;line-height:1.6;">
            The invite link is tied specifically to <strong>${escapeHtml(to)}</strong> and cannot be used with a
            different email address. If you have any trouble, reply to this email and we&apos;ll help you out.
          </p>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 12px;" />
          <p style="font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} StoryQuestor &mdash; <a href="${SITE_URL}" style="color:#9ca3af;">${SITE_URL.replace('https://', '')}</a></p>
        </body>
      </html>
    `,
  })
}

export async function sendWaitlistDenied(opts: { to: string; name: string | null }) {
  const { to, name } = opts
  const greeting = name ? escapeHtml(name) : 'there'

  await resend.emails.send({
    from: FROM,
    to,
    replyTo: 'contact@storyquestor.com',
    subject: 'Update on your StoryQuestor Organization application',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:32px 16px;color:#111;">
          <h1 style="font-size:22px;font-weight:800;margin-bottom:4px;">
            Story<span style="color:#f59e0b;">Questor</span>
          </h1>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

          <p style="font-size:15px;line-height:1.7;color:#1e0a3c;">Hi ${greeting},</p>
          <p style="font-size:15px;line-height:1.7;color:#1e0a3c;">
            Thank you for your interest in the StoryQuestor Organization beta. After reviewing your application,
            we&apos;re not able to offer access at this time. We have limited capacity during the beta period and
            are being selective about who we onboard.
          </p>
          <p style="font-size:15px;line-height:1.7;color:#1e0a3c;">
            You&apos;re welcome to continue using StoryQuestor as an individual creator, and we may reach out again
            as the Organization tier opens up more broadly. If you have questions, just reply to this email.
          </p>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 12px;" />
          <p style="font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} StoryQuestor &mdash; <a href="${SITE_URL}" style="color:#9ca3af;">${SITE_URL.replace('https://', '')}</a></p>
        </body>
      </html>
    `,
  })
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

export async function sendAdminMessage(opts: {
  to: string
  displayName: string | null
  subject: string
  message: string
}) {
  const { to, displayName, subject, message } = opts
  const greeting = displayName ? escapeHtml(displayName) : 'there'

  await resend.emails.send({
    from: FROM,
    to,
    replyTo: 'contact@storyquestor.com',
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:32px 16px;color:#111;">
          <h1 style="font-size:22px;font-weight:800;margin-bottom:4px;">
            Story<span style="color:#f59e0b;">Questor</span>
          </h1>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

          <p style="font-size:15px;line-height:1.7;color:#1e0a3c;">Hi ${greeting},</p>
          <div style="font-size:15px;line-height:1.7;color:#1e0a3c;white-space:pre-wrap;">${escapeHtml(message)}</div>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 12px;" />
          <p style="font-size:12px;color:#9ca3af;">
            You received this message from the StoryQuestor team. Reply directly to this email to respond.
            &copy; ${new Date().getFullYear()} StoryQuestor &mdash;
            <a href="${SITE_URL}" style="color:#9ca3af;">${SITE_URL.replace('https://', '')}</a>
          </p>
        </body>
      </html>
    `,
  })
}

export async function sendEmailBlast(opts: {
  to: string
  displayName: string | null
  subject: string
  bodyHtml: string
  unsubscribeToken: string
}): Promise<string> {
  const { to, displayName, subject, bodyHtml, unsubscribeToken } = opts
  const greeting = displayName ? escapeHtml(displayName) : 'there'
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    replyTo: 'contact@storyquestor.com',
    subject,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;color:#111;">
          <h1 style="font-size:22px;font-weight:800;margin-bottom:4px;">
            Story<span style="color:#f59e0b;">Questor</span>
          </h1>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

          <p style="font-size:15px;line-height:1.7;color:#1e0a3c;">Hi ${greeting},</p>

          <div style="font-size:15px;line-height:1.7;color:#1e0a3c;">${bodyHtml}</div>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;" />
          <p style="font-size:12px;color:#9ca3af;line-height:1.6;">
            You're receiving this because you have a StoryQuestor account.
            &copy; ${new Date().getFullYear()} StoryQuestor &mdash;
            <a href="${SITE_URL}" style="color:#9ca3af;">${SITE_URL.replace('https://', '')}</a>
            &nbsp;&middot;&nbsp;
            <a href="${unsubscribeUrl}" style="color:#9ca3af;">Unsubscribe</a>
          </p>
        </body>
      </html>
    `,
  })
  if (error || !data?.id) throw new Error(error?.message ?? 'Resend returned no email ID')
  return data.id
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
