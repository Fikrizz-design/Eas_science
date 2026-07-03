/**
 * Thin wrapper around Groq's OpenAI-compatible chat completions endpoint.
 * No SDK dependency needed — just fetch. Configure GROQ_API_KEY in Vercel.
 * Override the model via GROQ_MODEL if needed (defaults to a fast Llama 3.3 model).
 */
export async function groqChat(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  options: { json?: boolean; model?: string; temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY env var is not set.');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages,
      temperature: options.temperature ?? 0.4,
      max_tokens: options.maxTokens ?? 1024,
      ...(options.json ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
