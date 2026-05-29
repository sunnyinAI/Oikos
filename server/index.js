require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { errorHandler } = require('./middleware/errorHandler');
const { getDb } = require('./db/database');

const app = express();

// Init DB on startup
getDb();

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });
app.use(limiter);

app.use(express.json({ limit: '10mb' }));

// Routes
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

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Kharcha' }));

// Serve client in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🪔 Kharcha server running on port ${PORT}`);
});
