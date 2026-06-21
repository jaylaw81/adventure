import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM ?? 'StoryQuestor <noreply@storyquestor.com>'
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://www.storyquestor.com'
const CANONICAL_URL = 'https://www.storyquestor.com'

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
  const unsubscribeUrl = `${CANONICAL_URL}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`

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

export async function sendWaitlistNotification(opts: {
  email: string
  name: string | null
  school: string | null
  role: string | null
}) {
  const { email, name, school, role } = opts

  const row = (label: string, value: string | null) =>
    value
      ? `<tr>
          <td style="padding:10px 12px;font-weight:600;color:#6d28d9;white-space:nowrap;vertical-align:top;width:140px;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;color:#1e0a3c;">${escapeHtml(value)}</td>
        </tr>`
      : ''

  await resend.emails.send({
    from: FROM,
    to: ['contact@storyquestor.com', 'jaylaw81@gmail.com'],
    subject: 'New organization waitlist signup — StoryQuestor',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#111;">
          <h1 style="font-size:22px;font-weight:800;margin-bottom:4px;">
            Story<span style="color:#f59e0b;">Questor</span>
          </h1>
          <p style="color:#6b7280;font-size:14px;margin-top:0;">New Organization Waitlist Signup</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:10px 12px;font-weight:600;color:#6d28d9;white-space:nowrap;vertical-align:top;width:140px;">Email</td>
              <td style="padding:10px 12px;color:#1e0a3c;">${escapeHtml(email)}</td>
            </tr>
            ${row('Name', name)}
            ${row('Organization', school)}
            ${row('Role', role)}
          </table>
          <div style="margin:24px 0;">
            <a href="${SITE_URL}/admin/waitlist"
              style="display:inline-block;padding:10px 22px;background:#7c3aed;color:#fff;font-weight:700;font-size:14px;border-radius:8px;text-decoration:none;">
              View in Admin
            </a>
          </div>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
          <p style="font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} StoryQuestor</p>
        </body>
      </html>
    `,
  })
}

export async function sendConsentDeclined(opts: {
  to: string
  orgName: string
  memberEmail: string
}) {
  const { to, orgName, memberEmail } = opts
  await resend.emails.send({
    from: FROM,
    to,
    replyTo: 'contact@storyquestor.com',
    subject: `A member declined your consent form: ${escapeHtml(orgName)}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#111;">
          <h1 style="font-size:22px;font-weight:800;margin-bottom:4px;">
            Story<span style="color:#f59e0b;">Questor</span>
          </h1>
          <p style="color:#6b7280;font-size:14px;margin-top:0;">Consent Form Declined</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
          <p style="font-size:15px;line-height:1.7;color:#1e0a3c;">
            A member of <strong>${escapeHtml(orgName)}</strong> has declined your consent form.
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
            <tr>
              <td style="padding:10px 12px;font-weight:600;color:#6d28d9;white-space:nowrap;width:120px;">Member</td>
              <td style="padding:10px 12px;color:#1e0a3c;">${escapeHtml(memberEmail)}</td>
            </tr>
          </table>
          <p style="font-size:14px;color:#374151;line-height:1.6;">
            This member does not have access to the platform until they accept the consent form.
            You can reset their consent status from your organization's Members page.
          </p>
          <div style="margin:20px 0;">
            <a href="${SITE_URL}/org/members"
              style="display:inline-block;padding:10px 22px;background:#7c3aed;color:#fff;font-weight:700;font-size:14px;border-radius:8px;text-decoration:none;">
              View Members
            </a>
          </div>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
          <p style="font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} StoryQuestor</p>
        </body>
      </html>
    `,
  })
}

export async function sendWelcomeEmail(opts: {
  to: string
  displayName: string | null
  trialEndsAt: Date
  unsubscribeToken: string
}) {
  const { to, displayName, trialEndsAt, unsubscribeToken } = opts
  const greeting = displayName ? escapeHtml(displayName) : 'there'
  const trialDate = trialEndsAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const unsubscribeUrl = `${CANONICAL_URL}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`

  await resend.emails.send({
    from: FROM,
    to,
    replyTo: 'contact@storyquestor.com',
    subject: 'Welcome to StoryQuestor — start your first story',
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
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
            Welcome to StoryQuestor! You can now create branching choose-your-own-adventure stories
            where every reader choice leads somewhere different.
          </p>

          <div style="margin:24px 0;padding:18px 22px;background:#fffbeb;border-radius:12px;border:1px solid #fde68a;">
            <p style="font-size:13px;font-weight:700;color:#92400e;margin:0 0 4px;">Your 7-day free trial</p>
            <p style="font-size:13px;color:#78350f;margin:0;">
              Create and publish as many stories as you like. Your trial ends on <strong>${trialDate}</strong>.
            </p>
          </div>

          <p style="font-size:14px;font-weight:700;color:#1e0a3c;margin-bottom:8px;">Here's what you can do:</p>
          <ul style="font-size:14px;line-height:1.9;color:#374151;padding-left:20px;margin:0 0 24px;">
            <li>Build stories with a visual node canvas or a linear block editor</li>
            <li>Add scenes, branching choices, images, and ambient sound</li>
            <li>Share a link so anyone can read your story for free</li>
            <li>Publish to the public explore page to reach new readers</li>
          </ul>

          <a href="${CANONICAL_URL}"
            style="display:inline-block;padding:13px 30px;background:linear-gradient(135deg,#f59e0b,#f97316);
                   color:#1a1a1a;font-weight:700;font-size:15px;border-radius:10px;text-decoration:none;">
            Start Creating
          </a>

          <p style="font-size:13px;color:#6b7280;line-height:1.6;margin-top:24px;">
            Questions? Just reply to this email — we read everything.
          </p>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 12px;" />
          <p style="font-size:12px;color:#9ca3af;line-height:1.6;">
            &copy; ${new Date().getFullYear()} StoryQuestor &mdash;
            <a href="${CANONICAL_URL}" style="color:#9ca3af;">storyquestor.com</a>
            &nbsp;&middot;&nbsp;
            <a href="${unsubscribeUrl}" style="color:#9ca3af;">Unsubscribe</a>
          </p>
        </body>
      </html>
    `,
  })
}

export async function sendTrialExpiryReminder(opts: {
  to: string
  displayName: string | null
  trialEndsAt: Date
  unsubscribeToken: string
}) {
  const { to, displayName, trialEndsAt, unsubscribeToken } = opts
  const greeting = displayName ? escapeHtml(displayName) : 'there'
  const daysLeft = Math.max(1, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86_400_000))
  const trialDate = trialEndsAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const unsubscribeUrl = `${CANONICAL_URL}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`

  await resend.emails.send({
    from: FROM,
    to,
    replyTo: 'contact@storyquestor.com',
    subject: `Your StoryQuestor trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
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
            Your free trial expires on <strong>${trialDate}</strong> — that's
            ${daysLeft === 1 ? '<strong>tomorrow</strong>' : `<strong>${daysLeft} days away</strong>`}.
            After that you won't be able to create or edit stories until you subscribe.
          </p>

          <div style="margin:24px 0;padding:18px 22px;background:#fef2f2;border-radius:12px;border:1px solid #fecaca;">
            <p style="font-size:13px;font-weight:700;color:#991b1b;margin:0 0 4px;">Don't lose your work</p>
            <p style="font-size:13px;color:#7f1d1d;margin:0;">
              Subscribe now to keep full access. Plans start at $2/week — cancel any time.
            </p>
          </div>

          <a href="${CANONICAL_URL}/subscribe"
            style="display:inline-block;padding:13px 30px;background:linear-gradient(135deg,#f59e0b,#f97316);
                   color:#1a1a1a;font-weight:700;font-size:15px;border-radius:10px;text-decoration:none;">
            Subscribe Now
          </a>

          <p style="font-size:13px;color:#6b7280;margin-top:20px;line-height:1.6;">
            Your stories are saved and won't be deleted if your trial ends — you just won't be able
            to edit them until you subscribe.
          </p>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 12px;" />
          <p style="font-size:12px;color:#9ca3af;line-height:1.6;">
            &copy; ${new Date().getFullYear()} StoryQuestor &mdash;
            <a href="${CANONICAL_URL}" style="color:#9ca3af;">storyquestor.com</a>
            &nbsp;&middot;&nbsp;
            <a href="${unsubscribeUrl}" style="color:#9ca3af;">Unsubscribe</a>
          </p>
        </body>
      </html>
    `,
  })
}

export async function sendReEngagementEmail(opts: {
  to: string
  displayName: string | null
  storyCount: number
  unsubscribeToken: string
}) {
  const { to, displayName, storyCount, unsubscribeToken } = opts
  const greeting = displayName ? escapeHtml(displayName) : 'there'
  const storyWord = storyCount === 1 ? 'story' : 'stories'
  const unsubscribeUrl = `${CANONICAL_URL}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`

  await resend.emails.send({
    from: FROM,
    to,
    replyTo: 'contact@storyquestor.com',
    subject: `Your ${storyCount === 1 ? 'story is' : 'stories are'} waiting for you`,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
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
            It's been a while since you've worked on your ${storyWord}. You have
            <strong>${storyCount} ${storyWord}</strong> on StoryQuestor waiting to be continued —
            or shared with the world.
          </p>
          <p style="font-size:15px;line-height:1.7;color:#1e0a3c;">
            Even finishing a single story and publishing it gives readers something to discover.
            Pick up where you left off.
          </p>

          <a href="${CANONICAL_URL}"
            style="display:inline-block;margin:8px 0 24px;padding:13px 30px;
                   background:linear-gradient(135deg,#f59e0b,#f97316);
                   color:#1a1a1a;font-weight:700;font-size:15px;border-radius:10px;text-decoration:none;">
            Continue Creating
          </a>

          <p style="font-size:13px;color:#6b7280;line-height:1.6;">
            If you've moved on, no worries — you can
            <a href="${unsubscribeUrl}" style="color:#6b7280;">unsubscribe</a> and we won't
            bother you again.
          </p>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 12px;" />
          <p style="font-size:12px;color:#9ca3af;line-height:1.6;">
            &copy; ${new Date().getFullYear()} StoryQuestor &mdash;
            <a href="${CANONICAL_URL}" style="color:#9ca3af;">storyquestor.com</a>
            &nbsp;&middot;&nbsp;
            <a href="${unsubscribeUrl}" style="color:#9ca3af;">Unsubscribe</a>
          </p>
        </body>
      </html>
    `,
  })
}

export function isQuotaError(reason: unknown): boolean {
  return String(reason).toLowerCase().includes('daily email sending quota')
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
