import { Queue, Worker } from 'bullmq';
import { bullConnection } from './connection';
import { prisma } from '../services/prisma.service';
import { getIo } from '../socket';

export interface GhostProtocolJobData {
    userId: string;
    newTeamId: string;
}

const QUEUE_NAME = 'ghost-protocol';

// ── Lazy singletons ── only created when ghost-protocol is actually triggered.
// This prevents the server from crashing at startup when Redis is unavailable.
let _queue: Queue<GhostProtocolJobData> | null = null;
let _workerStarted = false;

function getQueue(): Queue<GhostProtocolJobData> {
    if (!_queue) {
        _queue = new Queue<GhostProtocolJobData>(QUEUE_NAME, {
            ...bullConnection,
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 3000 },
                removeOnComplete: 100,
                removeOnFail: 50,
            },
        });
    }
    return _queue;
}

function ensureWorker(): void {
    if (_workerStarted) return;
    _workerStarted = true;

    new Worker<GhostProtocolJobData>(
        QUEUE_NAME,
        async (job) => {
            const { userId, newTeamId } = job.data;
            console.log(`[Ghost Queue] Reassigning userId=${userId} → teamId=${newTeamId}`);

            const targetTeam = await prisma.team.findUnique({
                where: { id: newTeamId },
                select: { id: true, name: true },
            });
            if (!targetTeam) throw new Error(`Target team ${newTeamId} not found`);

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { teamId: newTeamId },
                select: { id: true, email: true, teamId: true },
            });

            try {
                getIo().to(`team:${newTeamId}`).emit('ghost-protocol:assigned', {
                    userId: updatedUser.id,
                    email: updatedUser.email,
                    newTeamId,
                    newTeamName: targetTeam.name,
                    timestamp: new Date().toISOString(),
                });
            } catch {
                // Socket may not be initialized in standalone worker environments
            }

            console.log(`[Ghost Queue] User ${updatedUser.email} reassigned to "${targetTeam.name}"`);
            return updatedUser;
        },
        { ...bullConnection }
    )
        .on('completed', (job) => console.log(`[Ghost Queue] Job ${job.id} completed`))
        .on('failed', (job, err) => console.error(`[Ghost Queue] Job ${job?.id} failed:`, err.message));
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function addGhostProtocolJob(data: GhostProtocolJobData) {
    ensureWorker();
    return getQueue().add('team-reassign', data);
}
