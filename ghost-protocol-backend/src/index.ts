import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import teamsRoutes from './routes/teams';
import usersRoutes from './routes/users';
import resultsRoutes from './routes/results';
import adminRoutes from './routes/admin';
import githubRoutes from './routes/github';
import configRoutes from './routes/config';

import { initSocket } from './socket';
import { apiLimiter } from './middleware/rateLimiter';

dotenv.config();

if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET environment variable is not set.');
    process.exit(1);
}

const app = express();
const server = http.createServer(app);

// ──────────────────────────────────────────────
// Global Middleware
// ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:3000',
        'http://localhost:3001',  // Admin dashboard
    ],
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ──────────────────────────────────────────────
// Rate Limiting
// ──────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/config', configRoutes);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 catch-all
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ──────────────────────────────────────────────
// Socket.IO
// ──────────────────────────────────────────────
initSocket(server);

// ──────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 4000;
server.listen(PORT, () => {
    console.log(`🚀 Ghost Protocol Backend running on http://localhost:${PORT}`);
});

export default app;
