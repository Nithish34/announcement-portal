import { Router } from 'express';
import {
    getMyProfile,
    getUserById,
    getAllUsers,
    updateUserProfile,
    updateUserScore,
} from '../controllers/users.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// GET  /api/users/me          — logged-in user's own profile
router.get('/me', requireAuth, getMyProfile);

// GET  /api/users             — all users (admin only)
router.get('/', requireAdmin, getAllUsers);

// GET  /api/users/:id         — single user profile
router.get('/:id', requireAuth, getUserById);

// PUT  /api/users/:id         — update profile (own account or admin)
router.put('/:id', requireAuth, updateUserProfile);

// PATCH /api/users/:id/score  — update evaluation score (admin only)
router.patch('/:id/score', requireAdmin, updateUserScore);

export default router;
