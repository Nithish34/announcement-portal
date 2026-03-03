import { Request, Response } from 'express';
import { getConfigNumber } from '../utils/config';

// GET /api/config/timers
// Returns phase1_timer_seconds, phase2_timer_seconds, and announcement_interval from SystemConfig.
// No auth required — timers are read by the public-facing timer pages.
export async function getTimers(_req: Request, res: Response): Promise<void> {
    try {
        const [phase1_timer_seconds, phase2_timer_seconds, announcement_interval] = await Promise.all([
            getConfigNumber('phase1_timer_seconds'),
            getConfigNumber('phase2_timer_seconds'),
            getConfigNumber('announcement_interval'),
        ]);

        res.json({ phase1_timer_seconds, phase2_timer_seconds, announcement_interval });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read timer config' });
    }
}
