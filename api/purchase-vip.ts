import { adminDb, adminAuth } from './_firebaseAdmin.js';

export const VIP_COST_DIAMONDS = 750000;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;
    const userRef = adminDb.collection('users').doc(uid);

    const result = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      if (!snap.exists) throw new Error('User not found');
      const data = snap.data()!;

      if (data.isVIP) throw new Error('Kamu sudah VIP.');
      if ((data.diamonds || 0) < VIP_COST_DIAMONDS) {
        throw new Error(`Diamond tidak cukup. Butuh ${VIP_COST_DIAMONDS.toLocaleString('id-ID')}, kamu punya ${(data.diamonds || 0).toLocaleString('id-ID')}.`);
      }

      const newDiamonds = data.diamonds - VIP_COST_DIAMONDS;
      tx.update(userRef, { isVIP: true, vipSince: new Date().toISOString(), diamonds: newDiamonds });
      return { diamonds: newDiamonds };
    });

    return res.status(200).json({ ok: true, isVIP: true, diamonds: result.diamonds });
  } catch (err: any) {
    console.error('purchase-vip error', err);
    return res.status(400).json({ error: err.message || 'Failed to purchase VIP.' });
  }
}
