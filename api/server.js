const path = require('path');
const express = require('express');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PORT = process.env.PORT || 3000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Wait for PostgreSQL, then make sure the table exists.
async function initDb(retries = 20) {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query(
        'CREATE TABLE IF NOT EXISTS visits (id SERIAL PRIMARY KEY, visited_at TIMESTAMPTZ DEFAULT now())'
      );
      console.log('Database ready');
      return;
    } catch (err) {
      console.log(`Database not ready (${i}/${retries}): ${err.message}`);
      await sleep(2000);
    }
  }
  throw new Error('Could not connect to the database');
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'up' });
  } catch {
    res.status(503).json({ status: 'error', database: 'down' });
  }
});

// Each call records a visit and returns the running total.
app.get('/api/visits', async (_req, res) => {
  try {
    await pool.query('INSERT INTO visits DEFAULT VALUES');
    const { rows } = await pool.query('SELECT count(*)::int AS total FROM visits');
    res.json({ total: rows[0].total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve the built React app.
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));

initDb()
  .then(() => app.listen(PORT, '0.0.0.0', () => console.log(`Listening on ${PORT}`)))
  .catch((err) => { console.error(err); process.exit(1); });
