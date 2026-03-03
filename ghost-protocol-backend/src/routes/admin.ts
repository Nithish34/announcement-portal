import { Router } from 'express';
import {
    getDashboard,
    setEvaluationResult,
    triggerGhostProtocol,
    broadcastAnnouncement,
    resetPortal,
    getWorkflowState,
    toggleWorkflowState,
    // New config-driven handlers
    getAllConfig,
    updateConfigByKey,
    batchUpdateConfig,
    setTeamOverride,
    clearTeamOverride,
} from '../controllers/admin.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// ── Existing routes (unchanged) ─────────────────────────────────────────────
router.get('/dashboard', requireAdmin, getDashboard);
router.get('/workflow', requireAdmin, getWorkflowState);
router.post('/workflow/toggle', requireAdmin, toggleWorkflowState);
router.post('/results', requireAdmin, setEvaluationResult);
router.post('/ghost-protocol', requireAdmin, triggerGhostProtocol);
router.post('/broadcast', requireAdmin, broadcastAnnouncement);
router.post('/reset', requireAdmin, resetPortal);

// ── New SystemConfig routes ──────────────────────────────────────────────────
// GET  /api/admin/config          — all config rows as a flat array
router.get('/config', requireAdmin, getAllConfig);

// PATCH /api/admin/config/:key    — update one config value
router.patch('/config/:key', requireAdmin, updateConfigByKey);

// PATCH /api/admin/config         — batch update multiple config values
router.patch('/config', requireAdmin, batchUpdateConfig);

// ── Team override routes ─────────────────────────────────────────────────────
// PATCH /api/admin/teams/:teamId/override  — force winner or loser
router.patch('/teams/:teamId/override', requireAdmin, setTeamOverride);

// DELETE /api/admin/teams/:teamId/override — clear override (back to auto)
router.delete('/teams/:teamId/override', requireAdmin, clearTeamOverride);

export default router;
