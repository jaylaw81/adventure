import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM ?? 'StoryQuestor <noreply@storyquestor.com>'
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://www.storyquestor.com'

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${SITE_URL}/reset-password?token=${token}`

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
            We received a request to reset the password for your account (<strong>${email}</strong>).
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
