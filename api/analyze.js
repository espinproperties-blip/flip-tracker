export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { image, mediaType, categories } = req.body;
  
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
   model: 'claude-sonnet-4-5',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: image
            }
          },
          {
            type: 'text',
            text: 'Invoice analysis. Reply ONLY with JSON, no other text: {"description":"brief description","amount":123.45,"date":"2026-01-15","category":"materials"}. Category must be one of: ' + categories
          }
        ]
      }]
    })
  });

  const d = await r.json();
  const t = (d.content?.[0]?.text || '{}').replace(/```json|```/g,'').trim();
  
  try {
    res.status(200).json(JSON.parse(t));
  } catch(e) {
    res.status(200).json({ description: '', amount: 0, date: '', category: '' });
  }
}
