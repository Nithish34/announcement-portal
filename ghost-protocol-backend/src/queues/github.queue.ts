import { Queue, Worker } from 'bullmq';
import { bullConnection } from './connection';
import { GitHubService } from '../services/github.service';

export interface GitHubJobData {
    userId: string;
    githubUsername: string;
}

const QUEUE_NAME = 'github-jobs';

// ── Queue ────────────────────────────────────────────────────────────────────
export const githubQueue = new Queue<GitHubJobData>(QUEUE_NAME, {
    ...bullConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 50,
    },
});

export async function addGitHubJob(data: GitHubJobData) {
    return githubQueue.add('fetch-stats', data);
}

// ── Worker ───────────────────────────────────────────────────────────────────
const githubService = new GitHubService();

new Worker<GitHubJobData>(
    QUEUE_NAME,
    async (job) => {
        const { userId, githubUsername } = job.data;
        console.log(`[GitHub Queue] Fetching stats for @${githubUsername} (userId: ${userId})`);

        if (job.name === 'fetch-stats') {
            const stats = await githubService.getUserStats(githubUsername);
            console.log(`[GitHub Queue] Stats fetched for @${githubUsername}`);
            return stats;
        }

        if (job.name === 'create-repo') {
            // call github.service.ts → createRepo()
            console.log(`[GitHub Queue] create-repo job for userId: ${userId}`);
        }

        if (job.name === 'delete-repo') {
            // call github.service.ts → deleteRepo()
            console.log(`[GitHub Queue] delete-repo job for userId: ${userId}`);
        }
    },
    { ...bullConnection }
)
    .on('completed', (job) => console.log(`[GitHub Queue] Job ${job.id} completed`))
    .on('failed', (job, err) => console.error(`[GitHub Queue] Job ${job?.id} failed:`, err.message));
