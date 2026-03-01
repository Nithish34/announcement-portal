import { Router } from 'express';
import {
    getDashboard,
    setEvaluationResult,
    triggerGhostProtocol,
    broadcastAnnouncement,
    resetPortal,
    getWorkflowState,
    toggleWorkflowState,
} from '../controllers/admin.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// All admin routes are protected by requireAdmin

// GET  /api/admin/dashboard          — portal stats overview
router.get('/dashboard', requireAdmin, getDashboard);

// GET  /api/admin/workflow           — get current system state (registration open, phase, etc.)
router.get('/workflow', requireAdmin, getWorkflowState);

// POST /api/admin/workflow/toggle    — flip feature flags in Redis
router.post('/workflow/toggle', requireAdmin, toggleWorkflowState);

// POST /api/admin/results            — set evaluation result for a team/user
router.post('/results', requireAdmin, setEvaluationResult);

// POST /api/admin/ghost-protocol     — trigger Ghost Protocol reshuffling
router.post('/ghost-protocol', requireAdmin, triggerGhostProtocol);

// POST /api/admin/broadcast          — push a real-time announcement to all clients
router.post('/broadcast', requireAdmin, broadcastAnnouncement);

// POST /api/admin/reset              — DANGER: reset all portal state (use with caution)
router.post('/reset', requireAdmin, resetPortal);

export default router;
