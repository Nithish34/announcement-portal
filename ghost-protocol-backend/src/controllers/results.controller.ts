import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service';
import { getIo } from '../socket';
import { getConfigNumber } from '../utils/config';

// GET /api/results/phase1 — teams with computed winner/loser driven by SystemConfig
export async function getPhase1Results(_req: Request, res: Response): Promise<void> {
    try {
        const maxSlots = await getConfigNumber('max_slots');

        const teams = await prisma.team.findMany({
            where: { isAdminTeam: false },
            select: {
                id: true,
                name: true,
                repoUrl: true,
                phase1Pass: true,
                phase2Pass: true,
                resultOverride: true,
                members: { select: { id: true, email: true, result: true } },
            },
            orderBy: { createdAt: 'asc' },
        });

        // Compute winner/loser respecting resultOverride
        let runningSlots = 0;
        const evaluated = teams.map((team) => {
            const memberCount = team.members.length;

            let result: 'WINNER' | 'LOSER';
            if (team.resultOverride) {
                // Admin override takes absolute priority
                result = team.resultOverride;
            } else if (runningSlots + memberCount <= maxSlots) {
                result = 'WINNER';
            } else {
                result = 'LOSER';
            }

            // Only accumulate slots for teams that actually win via slot logic
            if (result === 'WINNER' && !team.resultOverride) {
                runningSlots += memberCount;
            }

            return { ...team, memberCount, result };
        });

        res.json(evaluated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET /api/results/phase2 — individuals with computed winner/loser driven by SystemConfig
export async function getPhase2Results(_req: Request, res: Response): Promise<void> {
    try {
        const threshold = await getConfigNumber('phase2_score_threshold');

        const users = await prisma.user.findMany({
            where: { role: 'PARTICIPANT' },  // ← exclude any legacy ADMIN-role users
            select: {
                id: true,
                email: true,
                role: true,
                result: true,
                team: { select: { name: true } },
            },
            orderBy: { createdAt: 'asc' },
        });

        // Assign result based on the stored `result` field; if null, drive by threshold
        // (score is not currently stored on the User model — the existing `result` field
        // is the stored evaluation.  We expose it as-is and include threshold for context.)
        const evaluated = users.map((u) => ({
            ...u,
            phase2_score_threshold: threshold,
        }));

        res.json(evaluated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET /api/results/me — the logged-in user's own result
export async function getMyResult(req: Request, res: Response): Promise<void> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: {
                id: true,
                email: true,
                result: true,
                team: { select: { name: true, phase1Pass: true, phase2Pass: true } },
            },
        });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST /api/results/phase1/evaluate — batch-set phase1Pass on all teams
export async function evaluatePhase1(req: Request, res: Response): Promise<void> {
    const { passingTeamIds } = req.body as { passingTeamIds?: string[] };

    if (!Array.isArray(passingTeamIds)) {
        res.status(400).json({ error: 'passingTeamIds must be an array of team IDs' });
        return;
    }

    try {
        await prisma.$transaction([
            prisma.team.updateMany({
                where: { id: { in: passingTeamIds } },
                data: { phase1Pass: true },
            }),
            prisma.team.updateMany({
                where: { id: { notIn: passingTeamIds } },
                data: { phase1Pass: false },
            }),
        ]);

        getIo().emit('phase1:published', {
            passingTeamIds,
            timestamp: new Date().toISOString(),
        });

        res.json({ message: 'Phase 1 results published and broadcast', count: passingTeamIds.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST /api/results/phase2/evaluate — set Result enum on individual users
export async function evaluatePhase2(req: Request, res: Response): Promise<void> {
    const { results } = req.body as {
        results?: { userId: string; result: 'WINNER' | 'LOSER' }[];
    };

    if (!Array.isArray(results) || results.length === 0) {
        res.status(400).json({ error: 'results must be a non-empty array of { userId, result }' });
        return;
    }

    try {
        const updates = results.map(({ userId, result }) =>
            prisma.user.update({ where: { id: userId }, data: { result } })
        );

        await prisma.$transaction(updates);

        getIo().emit('phase2:published', {
            count: results.length,
            timestamp: new Date().toISOString(),
        });

        res.json({ message: 'Phase 2 results published and broadcast', count: results.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
