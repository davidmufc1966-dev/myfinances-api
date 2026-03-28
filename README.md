# My Finances Premium API

A lightweight proxy server that powers premium stock price features in My Finances.

## How it works

Instead of users needing their own API keys, they enter a premium key (which you give them after payment) and the server fetches prices using YOUR API keys.

## Deploy to Render.com

1. Push this folder to a GitHub repo
2. Go to render.com → New → Web Service
3. Connect your GitHub repo
4. Set these environment variables in Render dashboard:
   - `TWELVE_KEY` — your Twelve Data API key
   - `AV_KEY` — your Alpha Vantage API key  
   - `PREMIUM_SECRET` — a random secret key (e.g. `mf-premium-xK9j2mP4`)
5. Deploy — Render gives you a URL like `https://myfinances-api.onrender.com`

## Giving users access

After someone pays £4.99, send them the `PREMIUM_SECRET` value.
They enter it in Settings → Premium in the app.

## Endpoints

- `GET /` — health check
- `GET /stocks/us?symbols=AAPL,TSLA` — US stock prices
- `GET /stocks/uk?symbol=BARC.LON` — UK/EU stock prices  
- `GET /crypto?ids=bitcoin,ethereum` — Crypto prices in GBP
- `GET /rates` — Exchange rates

All endpoints require header: `x-premium-key: YOUR_SECRET`

## API Key limits (free plans)

- Twelve Data: 800 requests/day — good for ~100 active users
- Alpha Vantage: 25 requests/day — upgrade if needed
- CoinGecko: free, no limit
