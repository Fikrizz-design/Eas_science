import { adminDb, adminAuth } from './_firebaseAdmin.js';

async function isDeveloper(req: any): Promise<string | null> {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const userSnap = await adminDb.collection('users').doc(decoded.uid).get();
    if (userSnap.exists && userSnap.data()?.role === 'developer') return decoded.uid;
    return null;
  } catch {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const uid = await isDeveloper(req);
  if (!uid) return res.status(401).json({ error: 'Unauthorized — developer role required' });

  try {
    const env = {
      firebaseServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT,
      groqApiKey: !!process.env.GROQ_API_KEY,
      resendApiKey: !!process.env.RESEND_API_KEY,
      emailFrom: !!process.env.EMAIL_FROM,
      nasaApiKey: !!process.env.NASA_API_KEY,
      cronSecret: !!process.env.CRON_SECRET,
    };

    const [usersSnap, librarySnap, debatesSnap, postsSnap, phenomenaSnap, errorLogsSnap] = await Promise.all([
      adminDb.collection('users').count().get(),
      adminDb.collection('library').count().get(),
      adminDb.collection('debates').count().get(),
      adminDb.collection('posts').count().get(),
      adminDb.collection('phenomena').count().get(),
      adminDb.collection('errorLogs').orderBy('createdAt', 'desc').limit(20).get(),
    ]);

    // Role breakdown (small collections, fine to read in full for this)
    const allUsers = await adminDb.collection('users').get();
    const roleCounts: Record<string, number> = { member: 0, admin: 0, owner: 0, developer: 0 };
    const genCounts: Record<string, number> = {};
    let pendingWarnings = 0;
    allUsers.forEach(d => {
      const data = d.data();
      const role = data.role || 'member';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
      if (data.generation) genCounts[data.generation] = (genCounts[data.generation] || 0) + 1;
      if (Array.isArray(data.warnings) && data.warnings.length > 0) pendingWarnings++;
    });

    const todayJakarta = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })).toISOString().slice(0, 10);
    const [quizDoc, seoDoc] = await Promise.all([
      adminDb.collection('dailyQuiz').doc(todayJakarta).get(),
      adminDb.collection('seo').doc('config').get(),
    ]);

    const errorLogs = errorLogsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    return res.status(200).json({
      env,
      counts: {
        users: usersSnap.data().count,
        library: librarySnap.data().count,
        debates: debatesSnap.data().count,
        posts: postsSnap.data().count,
        phenomena: phenomenaSnap.data().count,
      },
      roleCounts,
      genCounts,
      pendingWarnings,
      quiz: {
        today: todayJakarta,
        generated: quizDoc.exists,
        questionCount: quizDoc.exists ? (quizDoc.data()?.questions?.length || 0) : 0,
      },
      seo: seoDoc.exists ? seoDoc.data() : null,
      recentErrors: errorLogs,
      checkedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('system-status error', err);
    return res.status(500).json({ error: 'Failed to load system status' });
  }
}
