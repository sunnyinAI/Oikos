require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { runMigrations } = require('./db/migrate');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173,capacitor://localhost,https://localhost').split(',').map(s => s.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });
app.use(limiter);
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/grocery', require('./routes/grocery'));
app.use('/api/pantry', require('./routes/pantry'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/prices', require('./routes/prices'));
app.use('/api/mandi', require('./routes/mandi'));
app.use('/api/meal', require('./routes/meal'));
app.use('/api/assistant', aiLimiter, require('./routes/assistant'));
app.use('/api/collaborate', require('./routes/collaborate'));
app.use('/api/ocr', aiLimiter, require('./routes/ocr'));
app.use('/api/affiliate', require('./routes/affiliate'));
app.use('/api/push', require('./routes/push'));

app.get('/api', (req, res) => res.json({
  app: 'Kharcha API',
  version: '1.0.0',
  status: 'running',
  docs: '/api/health',
}));
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Kharcha' }));

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.redirect('/api'));
}

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

runMigrations()
  .then(() => {
    app.listen(PORT, () => console.log(`🪔 Kharcha API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Fatal: DB migration failed after all retries', err.message);
    process.exit(1);
  });
