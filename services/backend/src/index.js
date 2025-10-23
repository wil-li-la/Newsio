import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import newsRoutes from './routes/news.js';
import userRoutes from './routes/user.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API Routes
app.use('/api/news', newsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════╗
║   NewsFlow Backend API                 ║
║   Environment: ${process.env.NODE_ENV?.padEnd(24) || 'development'.padEnd(24)}║
║   Port: ${PORT.toString().padEnd(31)}║
║   URL: http://localhost:${PORT.toString().padEnd(17)}║
╚════════════════════════════════════════╝
  `);
});

export default app;
