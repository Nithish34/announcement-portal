import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service';
import { getIo } from '../socket';
import { addGhostProtocolJob } from '../queues/ghost.queue';
import { getConfigNumber, getConfigBool } from '../utils/config';

// ─────────────────────────────────────────────────────────────────────────────
// Existing handlers (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/dashboard
export async function getDashboard(_req: Request, res: Response): Promise<void> {
    try {
        const [totalTeams, totalUsers, phase1Winners, phase2Winners] = await Promise.all([
            prisma.team.count(),
            prisma.user.count(),
            prisma.team.count({ where: { phase1Pass: true } }),
            prisma.user.count({ where: { result: 'WINNER' } }),
        ]);
        res.json({ totalTeams, totalUsers, phase1Winners, phase2Winners });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST /api/admin/results — override a single user result or team pass flag
export async function setEvaluationResult(req: Request, res: Response): Promise<void> {
    const { entityType, entityId, field, value } = req.body as {
        entityType?: string;
        entityId?: string;
        field?: string;
        value?: unknown;
    };

    if (!entityType || !entityId || !field) {
        res.status(400).json({ error: 'entityType, entityId, and field are required' });
        return;
    }

    try {
        if (entityType === 'team') {
            if (!['phase1Pass', 'phase2Pass', 'repoUrl', 'name'].includes(field)) {
                res.status(400).json({ error: `Unknown Team field: ${field}` });
                return;
            }
            const updated = await prisma.team.update({
                where: { id: entityId },
                data: { [field]: value },
            });
            getIo().emit('result:updated', { entityType, entityId, field, value });
            res.json(updated);
        } else if (entityType === 'user') {
            if (!['result', 'role'].includes(field)) {
                res.status(400).json({ error: `Unknown User field: ${field}` });
                return;
            }
            const updated = await prisma.user.update({
                where: { id: entityId },
                data: { [field]: value },
                select: { id: true, email: true, role: true, result: true },
            });
            getIo().emit('result:updated', { entityType, entityId, field, value });
            res.json(updated);
        } else {
            res.status(400).json({ error: 'entityType must be "team" or "user"' });
        }
    } catch (err: unknown) {
        const prismaErr = err as { code?: string };
        if (prismaErr.code === 'P2025') { res.status(404).json({ error: 'Entity not found' }); return; }
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST /api/admin/ghost-protocol
export async function triggerGhostProtocol(req: Request, res: Response): Promise<void> {
    const { assignments } = req.body as {
        assignments?: { userId: string; newTeamId: string }[];
    };

    if (!Array.isArray(assignments) || assignments.length === 0) {
        res.status(400).json({ error: 'assignments must be a non-empty array of { userId, newTeamId }' });
        return;
    }

    try {
        const jobs = await Promise.all(assignments.map((a) => addGhostProtocolJob(a)));
        getIo().emit('ghost-protocol:initiated', {
            count: jobs.length,
            timestamp: new Date().toISOString(),
        });
        res.status(202).json({ message: 'Ghost Protocol jobs queued', count: jobs.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST /api/admin/broadcast
export async function broadcastAnnouncement(req: Request, res: Response): Promise<void> {
    const { event, payload } = req.body as { event?: string; payload?: object };
    if (!event) { res.status(400).json({ error: 'event name is required' }); return; }

    getIo().emit(event, { ...payload, timestamp: new Date().toISOString() });
    res.json({ message: `Event "${event}" broadcast to all clients` });
}

// POST /api/admin/reset
export async function resetPortal(_req: Request, res: Response): Promise<void> {
    try {
        await prisma.$transaction([
            prisma.user.updateMany({ data: { result: null } }),
            prisma.team.updateMany({ data: { phase1Pass: false, phase2Pass: false } }),
        ]);
        getIo().emit('portal:reset', { timestamp: new Date().toISOString() });
        res.json({ message: 'Portal state reset' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET /api/admin/workflow
export async function getWorkflowState(_req: Request, res: Response): Promise<void> {
    try {
        const row = await prisma.systemConfig.findUnique({ where: { key: 'workflow_state' } });
        const state = row ? JSON.parse(row.value) : { registrationOpen: false, currentPhase: 0 };
        res.json(state);
    } catch (err) {
        console.error('DB error reading workflow state:', err);
        res.status(500).json({ error: 'Failed to read workflow state' });
    }
}

// POST /api/admin/workflow/toggle
export async function toggleWorkflowState(req: Request, res: Response): Promise<void> {
    try {
        const row = await prisma.systemConfig.findUnique({ where: { key: 'workflow_state' } });
        const currentState = row ? JSON.parse(row.value) : { registrationOpen: false, currentPhase: 0 };

        const newState = { ...currentState, ...req.body };
        await prisma.systemConfig.upsert({
            where: { key: 'workflow_state' },
            update: { value: JSON.stringify(newState) },
            create: { key: 'workflow_state', value: JSON.stringify(newState) },
        });

        getIo().emit('workflow:updated', { state: newState, timestamp: new Date().toISOString() });
        res.json({ message: 'Workflow state updated', state: newState });
    } catch (err) {
        console.error('DB error updating workflow state:', err);
        res.status(500).json({ error: 'Failed to update workflow state' });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW — SystemConfig CRUD
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/config
export async function getAllConfig(_req: Request, res: Response): Promise<void> {
    try {
        const configs = await prisma.systemConfig.findMany({ orderBy: { key: 'asc' } });
        res.json(configs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// PATCH /api/admin/config/:key
export async function updateConfigByKey(req: Request, res: Response): Promise<void> {
    const key = String(req.params['key']);
    const { value } = req.body as { value?: string };

    if (value === undefined || value === null) {
        res.status(400).json({ error: 'value is required' });
        return;
    }

    try {
        const updated = await prisma.systemConfig.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) },
        });

        getIo().emit('config:updated', { key, value: String(value) });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// PATCH /api/admin/config  (batch)
export async function batchUpdateConfig(req: Request, res: Response): Promise<void> {
    const updates = req.body as { key: string; value: string }[];

    if (!Array.isArray(updates) || updates.length === 0) {
        res.status(400).json({ error: 'Body must be a non-empty array of { key, value }' });
        return;
    }

    try {
        const results = await prisma.$transaction(
            updates.map(({ key, value }) =>
                prisma.systemConfig.upsert({
                    where: { key },
                    update: { value: String(value) },
                    create: { key, value: String(value) },
                })
            )
        );

        getIo().emit('config:batch-updated', { updates, timestamp: new Date().toISOString() });
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW — Team result override
// ─────────────────────────────────────────────────────────────────────────────

// PATCH /api/admin/teams/:teamId/override
export async function setTeamOverride(req: Request, res: Response): Promise<void> {
    const teamId = String(req.params['teamId']);
    const { override } = req.body as { override?: 'WINNER' | 'LOSER' };

    if (!override || !['WINNER', 'LOSER'].includes(override)) {
        res.status(400).json({ error: 'override must be "WINNER" or "LOSER"' });
        return;
    }

    try {
        const team = await prisma.team.update({
            where: { id: teamId },
            data: { resultOverride: override },
            select: { id: true, name: true, resultOverride: true, phase1Pass: true, phase2Pass: true },
        });

        getIo().emit('team:override-updated', team);
        res.json(team);
    } catch (err: unknown) {
        const prismaErr = err as { code?: string };
        if (prismaErr.code === 'P2025') { res.status(404).json({ error: 'Team not found' }); return; }
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// DELETE /api/admin/teams/:teamId/override
export async function clearTeamOverride(req: Request, res: Response): Promise<void> {
    const teamId = String(req.params['teamId']);

    try {
        const team = await prisma.team.update({
            where: { id: teamId },
            data: { resultOverride: null },
            select: { id: true, name: true, resultOverride: true, phase1Pass: true, phase2Pass: true },
        });

        getIo().emit('team:override-updated', team);
        res.json(team);
    } catch (err: unknown) {
        const prismaErr = err as { code?: string };
        if (prismaErr.code === 'P2025') { res.status(404).json({ error: 'Team not found' }); return; }
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Re-export unused imports so TypeScript doesn't complain (getConfigBool used externally)
// ─────────────────────────────────────────────────────────────────────────────
void getConfigNumber;
void getConfigBool;
