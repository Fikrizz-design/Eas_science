import { adminDb, adminAuth } from './_firebaseAdmin.js';
import { sendOtpEmail } from './_email.js';

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { uid, email } = req.body || {};
    if (!uid || !email) return res.status(400).json({ error: 'uid and email are required.' });

    // Defense in depth: make sure this uid actually owns this email.
    const userRecord = await adminAuth.getUser(uid);
    if (userRecord.email !== email) {
      return res.status(403).json({ error: 'Email does not match this account.' });
    }
    if (userRecord.emailVerified) {
      return res.status(400).json({ error: 'This email is already verified.' });
    }

    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    await adminDb.collection('otps').doc(uid).set({ code, email, expiresAt, attempts: 0 });
    await sendOtpEmail(email, code);

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('send-otp error', err);
    return res.status(500).json({ error: 'Failed to send verification code. Please try again later.' });
  }
}
