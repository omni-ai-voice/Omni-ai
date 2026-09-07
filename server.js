const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Omni-AI General Chat Endpoint
app.post('/api/omni-chat', async (req, res) => {
    const { instructions, userMessage } = req.body;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: `${instructions || "You are a helpful, brilliant, all-knowing voice assistant."} Keep your responses concise, natural, engaging, and optimized for spoken conversation (ideally 1-3 short sentences).` 
                },
                { role: "user", content: userMessage }
            ],
            max_tokens: 150
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error("OpenAI Error:", error);
        res.status(500).json({ reply: "I encountered an error processing that request." });
    }
});

// Deezer Music Preview Endpoint
app.post('/api/play-song', async (req, res) => {
    const { query } = req.body;
    try {
        let cleanedQuery = query.replace(/play|song|can you|find|lyrics|track|music|that/gi, "").trim();
        const searchRes = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(cleanedQuery)}`);
        const searchData = await searchRes.json();

        if (searchData.data && searchData.data.length > 0) {
            const track = searchData.data[0];
            res.json({
                found: true,
                title: track.title,
                artist: track.artist.name,
                previewUrl: track.preview
            });
        } else {
            res.json({ found: false });
        }
    } catch (error) {
        console.error("Deezer Search Error:", error);
        res.status(500).json({ found: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Omni-AI server running on port ${PORT}`));
