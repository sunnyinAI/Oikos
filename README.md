# Quantis

Mobile-first web app for Indian household shopping, pantry, mandi prices, budgets and meal planning.

## Local run

```bash
npm install
npm run dev
```

Open `http://localhost:5173/`.

## Production build

```bash
npm install
npm run build
npm start
```

The server serves the built client from `client/dist` in production.

## Render deployment

This repo includes `render.yaml` for a single-service Node deployment.

Recommended env vars:

- `NODE_ENV=production`
- `SESSION_EXPIRY_DAYS=30`
- `DEV_OTP_VISIBLE=true` for demo deployments
- `DB_PATH=/tmp/quantis.db` for a free demo deployment
- `DB_PATH=/var/data/quantis.db` if you attach a persistent disk on a paid plan
- `GEMINI_API_KEY=...` for full AI responses
- `ANTHROPIC_API_KEY=...` optional fallback provider

### Deploy steps

1. Push this code to a GitHub repo.
2. In Render, create a new Blueprint or Web Service from that repo.
3. Let Render use the included `render.yaml`.
4. After the first deploy, open `/api/health` to confirm the service is healthy.

## Notes

- Without `GEMINI_API_KEY` (or fallback `ANTHROPIC_API_KEY`), the app still works with local fallback responses for Ask Quantis and meal planning.
- The current backend uses SQLite for demo speed. For long-term production, move to Postgres.
