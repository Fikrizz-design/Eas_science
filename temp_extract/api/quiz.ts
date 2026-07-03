import { groqChat } from './_groq.js';
import { adminDb } from './_firebaseAdmin.js';

const QUESTION_COUNT = 20;

/** "Hari kuis" mengikuti zona waktu Indonesia (WIB), bukan UTC server. */
function todayJakartaKey(): string {
  const now = new Date();
  const jakarta = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
  return jakarta.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const dateKey = todayJakartaKey();
    const ref = adminDb.collection('dailyQuiz').doc(dateKey);

    // Kuis harian dibuat sekali per hari dan di-cache, jadi semua user
    // mendapat 20 soal yang sama di hari itu, dan hemat pemakaian API Groq.
    const cached = await ref.get();
    if (cached.exists) {
      return res.status(200).json(cached.data());
    }

    const raw = await groqChat(
      [
        {
          role: 'system',
          content:
            'Kamu adalah pembuat soal kuis astronomi berbahasa Indonesia untuk aplikasi edukasi pelajar. Selalu balas HANYA dengan satu objek JSON yang valid — tanpa markdown, tanpa komentar, tanpa penjelasan tambahan di luar JSON.',
        },
        {
          role: 'user',
          content: `Buat ${QUESTION_COUNT} soal kuis astronomi pilihan ganda (4 opsi) berbahasa Indonesia untuk tanggal ${dateKey}. Campur tingkat kesulitan (mudah, sedang, sulit) dan topik yang beragam: tata surya, planet, bintang, galaksi, kosmologi, eksplorasi luar angkasa, fisika astronomi, sejarah astronomi. Semua soal harus unik, tidak berulang, dan faktanya akurat. Balas HANYA dengan objek JSON persis seperti ini (tanpa teks lain): {"questions": [{"question": "string", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "string singkat dalam Bahasa Indonesia"}]} — array "questions" harus berisi tepat ${QUESTION_COUNT} objek.`,
        },
      ],
      { json: true, temperature: 0.9, maxTokens: 8000 }
    );

    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('AI returned an invalid quiz payload');
    }

    const payload = {
      date: dateKey,
      questions: parsed.questions.slice(0, QUESTION_COUNT),
      generatedAt: new Date().toISOString(),
    };

    await ref.set(payload);

    return res.status(200).json(payload);
  } catch (err: any) {
    console.error('quiz generation error', err);
    return res.status(500).json({ error: 'Failed to generate today\'s quiz' });
  }
}
