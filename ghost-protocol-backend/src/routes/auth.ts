import { Router } from 'express';
import { login, registerTeam, refreshToken, logout } from '../controllers/auth.controller';
import { authLimiter } from '../middleware/rateLimiter';
import { requireAuth } from '../middleware/auth';

const router = Router();

// POST /api/auth/login        — participant login with teamId + password
router.post('/login', authLimiter, login);

// POST /api/auth/register     — register a new team (admin use during setup)
router.post('/register', authLimiter, registerTeam);

// POST /api/auth/refresh      — issue a fresh JWT
router.post('/refresh', requireAuth, refreshToken);

// POST /api/auth/logout       — invalidate token
router.post('/logout', logout);

export default router;
