import { Router } from 'express';
import {
    getGitHubStats,
    linkGitHubAccount,
    handleWebhook,
    provisionRepo,
    deprovisionRepo,
} from '../controllers/github.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// GET  /api/github/stats/:username  — fetch live GitHub stats for any username
router.get('/stats/:username', requireAuth, getGitHubStats);

// POST /api/github/enqueue          — queue a background stats fetch for the logged-in user
router.post('/enqueue', requireAuth, linkGitHubAccount);

// POST /api/github/webhook          — receive GitHub webhook events (HMAC-verified, public)
router.post('/webhook', handleWebhook);

// POST /api/github/provision/:teamId  — enqueue repo creation for a team (admin)
router.post('/provision/:teamId', requireAdmin, provisionRepo);

// DELETE /api/github/deprovision/:teamId — remove repo access (admin)
router.delete('/deprovision/:teamId', requireAdmin, deprovisionRepo);

export default router;
