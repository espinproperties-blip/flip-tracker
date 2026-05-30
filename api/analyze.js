export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { image, mediaType, categories } = req.body;
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
            { type: 'text', text: 'You are analyzing a construction invoice. Extract: description, total amount as number, date as YYYY-MM-DD, and category from: ' + categories + '. Reply ONLY with this exact JSON format, no other text: {"description":"...","amount":0,"date":"YYYY-MM-DD","category":"..."}' }
          ]
        }]
      })
    });
    const d = await r.json();
    const t = (d.content?.[0]?.text || '{}').replace(/```json|```/g,'').trim();
    res.status(200).json(JSON.parse(t));
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
