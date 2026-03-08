import { Router } from 'express';
import {
    getDashboard,
    setEvaluationResult,
    triggerGhostProtocol,
    broadcastAnnouncement,
    resetPortal,
    getWorkflowState,
    toggleWorkflowState,
    getAllConfig,
    updateConfigByKey,
    batchUpdateConfig,
    setTeamOverride,
    clearTeamOverride,
} from '../controllers/admin.controller';
import {
    adminLogin,
    listAdmins,
    addAdmin,
    removeAdmin,
} from '../controllers/admin-auth.controller';
import { requireAdminAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// ── Admin authentication (Admin table) ────────────────────────────────────────
router.post('/auth/login', authLimiter, adminLogin);

// ── Admin management (only admins can add / remove admins) ────────────────────
router.get('/admins', requireAdminAuth, listAdmins);
router.post('/admins', requireAdminAuth, addAdmin);
router.delete('/admins/:adminId', requireAdminAuth, removeAdmin);

// ── Dashboard & system routes ─────────────────────────────────────────────────
router.get('/dashboard', requireAdminAuth, getDashboard);
router.get('/workflow', requireAdminAuth, getWorkflowState);
router.post('/workflow/toggle', requireAdminAuth, toggleWorkflowState);
router.post('/results', requireAdminAuth, setEvaluationResult);
router.post('/ghost-protocol', requireAdminAuth, triggerGhostProtocol);
router.post('/broadcast', requireAdminAuth, broadcastAnnouncement);
router.post('/reset', requireAdminAuth, resetPortal);

// ── SystemConfig routes ───────────────────────────────────────────────────────
router.get('/config', requireAdminAuth, getAllConfig);
router.patch('/config/:key', requireAdminAuth, updateConfigByKey);
router.patch('/config', requireAdminAuth, batchUpdateConfig);

// ── Team override routes ──────────────────────────────────────────────────────
router.patch('/teams/:teamId/override', requireAdminAuth, setTeamOverride);
router.delete('/teams/:teamId/override', requireAdminAuth, clearTeamOverride);

export default router;
