import { Router } from 'express';
import {
    getAllTeams,
    getTeamById,
    createTeam,
    updateTeam,
    getTeamMembers,
} from '../controllers/teams.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// GET  /api/teams             — list all teams with phase status
router.get('/', requireAuth, getAllTeams);

// POST /api/teams             — admin creates a team
router.post('/', requireAdmin, createTeam);

// GET  /api/teams/:id         — single team detail
router.get('/:id', requireAuth, getTeamById);

// PUT  /api/teams/:id         — update team info (admin only)
router.put('/:id', requireAdmin, updateTeam);

// GET  /api/teams/:id/members — all members of a team
router.get('/:id/members', requireAuth, getTeamMembers);

export default router;
