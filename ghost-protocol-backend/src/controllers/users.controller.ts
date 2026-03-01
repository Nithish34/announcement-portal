import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service';

// GET /api/users/me
export async function getMyProfile(req: Request, res: Response): Promise<void> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: {
                id: true,
                email: true,
                role: true,
                result: true,
                createdAt: true,
                team: { select: { id: true, name: true, repoUrl: true, phase1Pass: true, phase2Pass: true } },
            },
        });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET /api/users  (admin only)
export async function getAllUsers(_req: Request, res: Response): Promise<void> {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                result: true,
                teamId: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET /api/users/:id
export async function getUserById(req: Request, res: Response): Promise<void> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: String(req.params.id) },
            include: {
                team: { select: { id: true, name: true, repoUrl: true, phase1Pass: true, phase2Pass: true } },
            },
        });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        // Never leak the password hash
        const { password: _pwd, ...safe } = user;
        res.json(safe);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// PUT /api/users/:id  (own account or admin)
export async function updateUserProfile(req: Request, res: Response): Promise<void> {
    // Only the owner or an admin can update
    if (req.user!.userId !== req.params.id && req.user!.role !== 'ADMIN') {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }

    const { email } = req.body as { email?: string };

    try {
        const user = await prisma.user.update({
            where: { id: String(req.params.id) },
            data: { email },
            select: { id: true, email: true, role: true, result: true },
        });
        res.json(user);
    } catch (err: any) {
        if (err.code === 'P2025') { res.status(404).json({ error: 'User not found' }); return; }
        if (err.code === 'P2002') { res.status(409).json({ error: 'Email already in use' }); return; }
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// PATCH /api/users/:id/score  — set evaluation result (admin only)
export async function updateUserScore(req: Request, res: Response): Promise<void> {
    const { result } = req.body as { result?: 'WINNER' | 'LOSER' };

    if (!result || !['WINNER', 'LOSER'].includes(result)) {
        res.status(400).json({ error: 'result must be "WINNER" or "LOSER"' });
        return;
    }

    try {
        const user = await prisma.user.update({
            where: { id: String(req.params.id) },
            data: { result },
            select: { id: true, email: true, result: true },
        });
        res.json(user);
    } catch (err: any) {
        if (err.code === 'P2025') { res.status(404).json({ error: 'User not found' }); return; }
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
