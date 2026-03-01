import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service';

// GET /api/teams
export async function getAllTeams(_req: Request, res: Response): Promise<void> {
    try {
        const teams = await prisma.team.findMany({
            select: {
                id: true,
                name: true,
                repoUrl: true,
                phase1Pass: true,
                phase2Pass: true,
                createdAt: true,
                _count: {
                    select: { members: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        // Transform to match {"memberCount": x} if frontend expects it, or just pass it as is
        res.json(teams);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET /api/teams/:id
export async function getTeamById(req: Request, res: Response): Promise<void> {
    try {
        const team = await prisma.team.findUnique({
            where: { id: String(req.params.id) },
            include: {
                members: { select: { id: true, email: true, role: true, result: true } },
            },
        });
        if (!team) { res.status(404).json({ error: 'Team not found' }); return; }
        res.json(team);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST /api/teams
export async function createTeam(req: Request, res: Response): Promise<void> {
    const { name, repoUrl, phase1Pass, phase2Pass } = req.body as {
        name?: string;
        repoUrl?: string;
        phase1Pass?: boolean;
        phase2Pass?: boolean;
    };

    if (!name) {
        res.status(400).json({ error: 'name is required' });
        return;
    }

    try {
        const team = await prisma.team.create({
            data: { name, repoUrl, phase1Pass, phase2Pass },
        });
        res.status(201).json(team);
    } catch (err: any) {
        if (err.code === 'P2002') { res.status(409).json({ error: 'Team name already taken' }); return; }
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// PUT /api/teams/:id
export async function updateTeam(req: Request, res: Response): Promise<void> {
    const { name, repoUrl, phase1Pass, phase2Pass } = req.body as {
        name?: string;
        repoUrl?: string;
        phase1Pass?: boolean;
        phase2Pass?: boolean;
    };

    try {
        const team = await prisma.team.update({
            where: { id: String(req.params.id) },
            data: { name, repoUrl, phase1Pass, phase2Pass },
        });
        res.json(team);
    } catch (err: any) {
        if (err.code === 'P2025') { res.status(404).json({ error: 'Team not found' }); return; }
        if (err.code === 'P2002') { res.status(409).json({ error: 'Team name already taken' }); return; }
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET /api/teams/:id/members
export async function getTeamMembers(req: Request, res: Response): Promise<void> {
    try {
        const members = await prisma.user.findMany({
            where: { teamId: String(req.params.id) },
            select: { id: true, email: true, role: true, result: true },
        });
        res.json(members);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
