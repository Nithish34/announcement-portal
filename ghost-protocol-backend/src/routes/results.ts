import { Router } from 'express';
import {
    getPhase1Results,
    getPhase2Results,
    getMyResult,
    evaluatePhase1,
    evaluatePhase2,
} from '../controllers/results.controller';
import { requireAuth, requireAdminAuth } from '../middleware/auth';

const router = Router();

// GET  /api/results/phase1    — Phase 1 team results (slot evaluation)
router.get('/phase1', requireAuth, getPhase1Results);

// GET  /api/results/phase2    — Phase 2 individual results
router.get('/phase2', requireAuth, getPhase2Results);

// GET  /api/results/me        — current user's personal result + status
router.get('/me', requireAuth, getMyResult);

// POST /api/results/phase1/evaluate  — trigger Phase 1 announcement (admin)
router.post('/phase1/evaluate', requireAdminAuth, evaluatePhase1);

// POST /api/results/phase2/evaluate  — trigger Phase 2 announcement (admin)
router.post('/phase2/evaluate', requireAdminAuth, evaluatePhase2);

export default router;
