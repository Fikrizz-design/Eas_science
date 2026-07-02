import { groqChat } from './_groq';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text } = req.body || {};
    if (!text || !String(text).trim()) return res.status(200).json({ toxic: false });

    const raw = await groqChat(
      [
        {
          role: 'system',
          content:
            'You are a content moderator for a debate forum on an educational astronomy platform. Classify the message for toxicity: harassment, hate speech, personal attacks, threats, or severe profanity. Blunt scientific disagreement or criticism of an argument is NOT toxic. Respond ONLY with a JSON object: {"toxic": boolean, "reason": "short reason if toxic, otherwise empty string"}',
        },
        { role: 'user', content: String(text).slice(0, 4000) },
      ],
      { json: true, temperature: 0.1 }
    );

    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleaned);

    return res.status(200).json({ toxic: !!result.toxic, reason: result.reason || '' });
  } catch (err: any) {
    console.error('moderation error', err);
    // Fail open so a moderation-service outage never silently blocks legitimate debate.
    return res.status(200).json({ toxic: false });
  }
}
