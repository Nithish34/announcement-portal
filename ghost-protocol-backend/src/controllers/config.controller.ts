import { Request, Response } from 'express';
import { getConfigNumber, getConfig } from '../utils/config';

// GET /api/config/timers
// Returns phase1_start_datetime, phase2_start_datetime (ISO strings) and
// announcement_interval (number). No auth required.
export async function getTimers(_req: Request, res: Response): Promise<void> {
    try {
        // Helper: read optional config key — returns null if not set yet
        const readOptional = async (key: string): Promise<string | null> => {
            try { return await getConfig(key); }
            catch { return null; }
        };

        const [phase1_start_datetime, phase2_start_datetime, announcement_interval, max_slots] = await Promise.all([
            readOptional('phase1_start_datetime'),
            readOptional('phase2_start_datetime'),
            getConfigNumber('announcement_interval').catch(() => 30),
            getConfigNumber('max_slots').catch(() => 20),
        ]);

        res.json({ phase1_start_datetime, phase2_start_datetime, announcement_interval, max_slots });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read timer config' });
    }
}
