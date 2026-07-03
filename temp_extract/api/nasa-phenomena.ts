import { adminDb } from './_firebaseAdmin.js';

/** "Hari" mengikuti zona waktu Indonesia (WIB). */
function todayJakartaKey(): string {
  const now = new Date();
  const jakarta = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
  return jakarta.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const dateKey = todayJakartaKey();
    const ref = adminDb.collection('nasaPhenomenaCache').doc(dateKey);

    const cached = await ref.get();
    if (cached.exists) {
      return res.status(200).json(cached.data());
    }

    // NASA_API_KEY is optional — falls back to the shared DEMO_KEY (rate-limited
    // to ~30 requests/hour, fine since results are cached once per day).
    const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
    const startDate = dateKey;
    const endDate = addDays(dateKey, 6);

    const [apodRes, neoRes] = await Promise.all([
      fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`),
      fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`),
    ]);

    const events: any[] = [];

    if (apodRes.ok) {
      const apod = await apodRes.json();
      events.push({
        type: 'apod',
        date: apod.date,
        title: apod.title,
        description: apod.explanation?.slice(0, 400) || '',
        imageUrl: apod.media_type === 'image' ? apod.url : null,
        sourceUrl: apod.hdurl || apod.url,
        source: 'nasa',
      });
    }

    if (neoRes.ok) {
      const neo = await neoRes.json();
      const byDate = neo.near_earth_objects || {};
      for (const date of Object.keys(byDate)) {
        for (const obj of byDate[date]) {
          const approach = obj.close_approach_data?.[0];
          if (!approach) continue;
          const diameterKm = obj.estimated_diameter?.kilometers;
          events.push({
            type: 'asteroid',
            date,
            title: `Asteroid ${obj.name} mendekati Bumi`,
            description: `Diameter ~${diameterKm ? diameterKm.estimated_diameter_min.toFixed(2) + '–' + diameterKm.estimated_diameter_max.toFixed(2) : '?'} km, jarak ${Number(approach.miss_distance?.kilometers || 0).toLocaleString('id-ID')} km dari Bumi, kecepatan ${Number(approach.relative_velocity?.kilometers_per_hour || 0).toLocaleString('id-ID')} km/jam.`,
            hazardous: !!obj.is_potentially_hazardous_asteroid,
            sourceUrl: obj.nasa_jpl_url,
            source: 'nasa',
          });
        }
      }
    }

    const payload = { date: dateKey, events, generatedAt: new Date().toISOString() };
    await ref.set(payload);

    return res.status(200).json(payload);
  } catch (err: any) {
    console.error('nasa-phenomena error', err);
    return res.status(500).json({ error: 'Failed to load NASA phenomena data' });
  }
}
