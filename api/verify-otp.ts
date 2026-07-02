import { adminDb, adminAuth } from './_firebaseAdmin.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { uid, code } = req.body || {};
    if (!uid || !code) return res.status(400).json({ error: 'uid and code are required.' });

    const ref = adminDb.collection('otps').doc(uid);
    const snap = await ref.get();
    if (!snap.exists) {
      return res.status(400).json({ error: 'No verification code found. Please request a new one.' });
    }

    const data = snap.data() as { code: string; expiresAt: number; attempts?: number };

    if (Date.now() > data.expiresAt) {
      await ref.delete();
      return res.status(400).json({ error: 'Code expired. Please request a new one.' });
    }

    if ((data.attempts || 0) >= 5) {
      await ref.delete();
      return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new code.' });
    }

    if (String(data.code) !== String(code)) {
      await ref.update({ attempts: (data.attempts || 0) + 1 });
      return res.status(400).json({ error: 'Incorrect code.' });
    }

    await adminAuth.updateUser(uid, { emailVerified: true });
    await ref.delete();

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('verify-otp error', err);
    return res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
}
