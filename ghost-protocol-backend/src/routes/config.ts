import { Router } from 'express';
import { getTimers } from '../controllers/config.controller';

const router = Router();

// GET /api/config/timers — returns phase1_start_datetime, phase2_start_datetime, announcement_interval
router.get('/timers', getTimers);

export default router;
