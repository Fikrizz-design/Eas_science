/**
 * Sends the OTP email via the Resend API (https://resend.com) — no SMTP setup
 * needed, just one API key. Free tier: 100 emails/day, 3,000/month.
 *
 * Setup:
 *  1. Sign up at https://resend.com and grab an API key (starts with "re_").
 *  2. Verify a sending domain (Resend → Domains) OR, for quick testing, use
 *     the sandbox address "onboarding@resend.dev" as EMAIL_FROM (only sends
 *     to your own verified account email in that case — fine for dev, not
 *     for real users; verify your own domain for production).
 *  3. Set RESEND_API_KEY and EMAIL_FROM in Vercel env vars.
 */
export async function sendOtpEmail(to: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY env var is not set.');

  const from = process.env.EMAIL_FROM || 'E.A.S Command Center <onboarding@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'Your E.A.S Verification Code',
      text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes. If you did not request this, you can ignore this email.`,
      html: `
        <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: auto; color: #111;">
          <h2 style="margin-bottom: 4px;">E.A.S Verification Code</h2>
          <p style="color: #555;">Use the code below to verify your account. It expires in 10 minutes.</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 10px; margin: 24px 0; text-align: center;">${code}</p>
          <p style="color: #999; font-size: 12px;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error (${res.status}): ${text}`);
  }
}
