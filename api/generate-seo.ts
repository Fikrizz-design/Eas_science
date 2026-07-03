import { groqChat } from './_groq.js';
import { adminDb, adminAuth } from './_firebaseAdmin.js';

/**
 * Authorized two ways:
 *  1. Vercel Cron — automatically sends `Authorization: Bearer $CRON_SECRET`
 *     when the CRON_SECRET env var is set (see vercel.json `crons`).
 *  2. Manual trigger from the Admin Panel — a Firebase ID token for a user
 *     whose Firestore role is admin/owner.
 */
async function isAuthorized(req: any): Promise<boolean> {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return false;

  if (process.env.CRON_SECRET && token === process.env.CRON_SECRET) {
    return true;
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const userSnap = await adminDb.collection('users').doc(decoded.uid).get();
    const role = userSnap.exists ? userSnap.data()?.role : null;
    return role === 'admin' || role === 'owner';
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authorized = await isAuthorized(req);
  if (!authorized) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const raw = await groqChat(
      [
        {
          role: 'system',
          content:
            'Kamu adalah spesialis SEO untuk platform edukasi astronomi Indonesia bernama E.A.S (Education Astronomy Science). Selalu balas HANYA dengan satu objek JSON yang valid, tanpa markdown atau komentar apa pun.',
        },
        {
          role: 'user',
          content:
            'Buat metadata SEO baru untuk halaman utama E.A.S dalam Bahasa Indonesia yang menarik, relevan, dan bervariasi dari waktu ke waktu (jangan generik). Platform ini punya: kuis astronomi harian, ruang debat sains, star map, tracker cuaca luar angkasa, kalender fenomena langit, dan perpustakaan riset komunitas pelajar. Balas HANYA dengan objek JSON persis seperti ini: {"title": "string maks 60 karakter", "description": "string maks 155 karakter", "keywords": ["kata kunci", "..."]}',
        },
      ],
      { json: true, temperature: 1.0, maxTokens: 600 }
    );

    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const seo = JSON.parse(cleaned);

    const payload = {
      title: seo.title || 'E.A.S — Education Astronomy Science',
      description: seo.description || 'Platform edukasi astronomi untuk pelajar Indonesia.',
      keywords: Array.isArray(seo.keywords) ? seo.keywords : [],
      generatedAt: new Date().toISOString(),
    };

    await adminDb.collection('seo').doc('config').set(payload);

    return res.status(200).json(payload);
  } catch (err: any) {
    console.error('generate-seo error', err);
    return res.status(500).json({ error: 'Failed to generate SEO metadata' });
  }
}
