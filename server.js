const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Your Groq API key lives ONLY here on the server
// Users never see it. Set GROQ_API_KEY in Render's environment variables.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/chat', async (req, res) => {
  const { messages, system } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: geminiMessages,
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
      })
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      return res.status(500).json({ error: data.error?.message || 'AI error' });
    }
    res.json({ reply: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

    const data = await response.json();
    if (!response.ok || data.error) {
      return res.status(response.status).json({ error: data.error?.message || 'AI error' });
    }
    res.json({ reply: data.choices?.[0]?.message?.content || 'No response.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bachlorites running on port ${PORT}`));
