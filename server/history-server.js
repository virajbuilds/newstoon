import express from 'express';
import cors from 'cors';
import { createClient } from '@libsql/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const db = createClient({
  url: 'file:generations.db',
});

// Initialize database
await db.execute(`
  CREATE TABLE IF NOT EXISTS generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    input_text TEXT NOT NULL,
    story_prompt TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const app = express();
app.use(cors());
app.use(express.json());

// Get all generations
app.get('/api/history', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM generations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Add new generation
app.post('/api/history', async (req, res) => {
  const { input_text, story_prompt, image_url } = req.body;
  try {
    const result = await db.execute({
      sql: 'INSERT INTO generations (input_text, story_prompt, image_url) VALUES (?, ?, ?)',
      args: [input_text, story_prompt, image_url]
    });
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error saving generation:', error);
    res.status(500).json({ error: 'Failed to save generation' });
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`History server running at http://localhost:${port}`);
  console.log(`View history page at http://localhost:${port}/history.html`);
});