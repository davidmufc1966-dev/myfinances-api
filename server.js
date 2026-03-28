
const express = require('express');
const cors = require('cors');
const app = express();

// ── Config ────────────────────────────────────────────────────────────
const TWELVE_KEY = process.env.TWELVE_KEY || '';
const AV_KEY = process.env.AV_KEY || '';
const PREMIUM_SECRET = process.env.PREMIUM_SECRET || 'premium-secret-change-me';
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── Auth middleware ───────────────────────────────────────────────────
function auth(req, res, next) {
  const key = req.headers['x-premium-key'] || req.query.key;
  if (key !== PREMIUM_SECRET) return res.status(401).json({ error: 'Invalid key' });
  next();
}

// ── Health check ─────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'My Finances Premium API' });
});

// ── US Stocks (Twelve Data) ──────────────────────────────────────────
app.get('/stocks/us', auth, async (req, res) => {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols required' });
  if (!TWELVE_KEY) return res.status(503).json({ error: 'Twelve Data key not configured' });

  try {
    const url = `https://api.twelvedata.com/price?symbol=${symbols}&apikey=${TWELVE_KEY}`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch US stock prices' });
  }
});

// ── UK/EU Stocks (Twelve Data) ───────────────────────────────────────
app.get('/stocks/uk', auth, async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });
  if (!TWELVE_KEY) return res.status(503).json({ error: 'Twelve Data key not configured' });

  try {
    const url = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${TWELVE_KEY}`;
    const r = await fetch(url);
    const data = await r.json();
    // Return in Alpha Vantage format so app code still works
    if (data.price) {
      res.json({ 'Global Quote': { '05. price': data.price } });
    } else {
      res.json(data);
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch UK/EU stock prices' });
  }
});

// ── Crypto (CoinGecko - free, no key needed) ─────────────────────────
app.get('/crypto', auth, async (req, res) => {
  const { ids } = req.query;
  if (!ids) return res.status(400).json({ error: 'ids required' });

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=gbp&include_24hr_change=true`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch crypto prices' });
  }
});

// ── Exchange Rates ────────────────────────────────────────────────────
app.get('/rates', auth, async (req, res) => {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/GBP');
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

app.listen(PORT, () => {
  console.log(`My Finances Premium API running on port ${PORT}`);
});
