import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service';
import { getIo } from '../socket';

// GET /api/results/phase1 — all teams with their pass status
export async function getPhase1Results(_req: Request, res: Response): Promise<void> {
    try {
        const teams = await prisma.team.findMany({
            select: {
                id: true,
                name: true,
                repoUrl: true,
                phase1Pass: true,
                phase2Pass: true,
                members: { select: { id: true, email: true, result: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
        res.json(teams);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET /api/results/phase2 — all users with their individual result
export async function getPhase2Results(_req: Request, res: Response): Promise<void> {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                result: true,
                team: { select: { name: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
        res.json(users);
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
// Body: { passingTeamIds: string[] }
export async function evaluatePhase1(req: Request, res: Response): Promise<void> {
    const { passingTeamIds } = req.body as { passingTeamIds?: string[] };

    if (!Array.isArray(passingTeamIds)) {
        res.status(400).json({ error: 'passingTeamIds must be an array of team IDs' });
        return;
    }

    try {
        // Set phase1Pass = true for winners, false for everyone else atomically
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
// Body: { results: { userId: string; result: 'WINNER' | 'LOSER' }[] }
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
