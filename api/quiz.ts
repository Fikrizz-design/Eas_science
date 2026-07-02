import { groqChat } from './_groq.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { topic = 'Solar System and Universe', difficulty = 'medium' } = req.body || {};

    const raw = await groqChat(
      [
        {
          role: 'system',
          content:
            'You are a quiz generator for an astronomy education app. Always respond with a single valid JSON object and nothing else — no markdown, no commentary.',
        },
        {
          role: 'user',
          content: `Generate one adaptive astronomy quiz question about "${topic}" at difficulty level "${difficulty}". Respond ONLY with a JSON object in this exact shape: {"question": "string", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "string"}`,
        },
      ],
      { json: true }
    );

    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const quiz = JSON.parse(cleaned);

    return res.status(200).json(quiz);
  } catch (err: any) {
    console.error('quiz generation error', err);
    return res.status(500).json({ error: 'Failed to generate quiz' });
  }
}
