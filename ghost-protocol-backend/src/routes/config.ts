import { Router } from 'express';
import { getTimers } from '../controllers/config.controller';

const router = Router();

// GET /api/config/timers — returns phase1_timer_seconds, phase2_timer_seconds, announcement_interval
router.get('/timers', getTimers);

export default router;
