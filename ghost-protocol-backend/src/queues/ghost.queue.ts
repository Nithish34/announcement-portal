import { Queue, Worker } from 'bullmq';
import { redisConnectionOptions } from '../services/redis.service';
import { prisma } from '../services/prisma.service';
import { getIo } from '../socket';

export interface GhostProtocolJobData {
    userId: string;
    newTeamId: string;
}

const QUEUE_NAME = 'ghost-protocol';

// ── Queue ────────────────────────────────────────────────────────────────────
const ghostQueue = new Queue<GhostProtocolJobData>(QUEUE_NAME, {
    connection: redisConnectionOptions,
});

export async function addGhostProtocolJob(data: GhostProtocolJobData) {
    return ghostQueue.add('team-reassign', data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: 100,
        removeOnFail: 50,
    });
}

// ── Worker ───────────────────────────────────────────────────────────────────
const ghostWorker = new Worker<GhostProtocolJobData>(
    QUEUE_NAME,
    async (job) => {
        const { userId, newTeamId } = job.data;
        console.log(`[Ghost Queue] Reassigning userId=${userId} → teamId=${newTeamId}`);

        // Verify target team exists first to fail fast
        const targetTeam = await prisma.team.findUnique({
            where: { id: newTeamId },
            select: { id: true, name: true },
        });
        if (!targetTeam) throw new Error(`Target team ${newTeamId} not found`);

        // Atomically update the user's teamId
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { teamId: newTeamId },
            select: { id: true, email: true, teamId: true },
        });

        // Emit a targeted real-time event to the new team's socket room
        try {
            getIo().to(`team:${newTeamId}`).emit('ghost-protocol:assigned', {
                userId: updatedUser.id,
                email: updatedUser.email,
                newTeamId,
                newTeamName: targetTeam.name,
                timestamp: new Date().toISOString(),
            });
        } catch {
            // Socket may not be initialized in test/worker-only environments
        }

        console.log(`[Ghost Queue] User ${updatedUser.email} reassigned to team "${targetTeam.name}"`);
        return updatedUser;
    },
    { connection: redisConnectionOptions }
);

ghostWorker.on('completed', (job) => {
    console.log(`[Ghost Queue] Job ${job.id} completed`);
});

ghostWorker.on('failed', (job, err) => {
    console.error(`[Ghost Queue] Job ${job?.id} failed:`, err.message);
});

export { ghostQueue };
