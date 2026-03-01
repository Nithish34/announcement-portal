import { Queue, Worker } from 'bullmq';
import { redisConnectionOptions } from '../services/redis.service';
import { GitHubService } from '../services/github.service';
import { cacheSet } from '../services/redis.service';

export interface GitHubJobData {
    userId: string;
    githubUsername: string;
}

const QUEUE_NAME = 'github-stats';

// ── Queue ────────────────────────────────────────────────────────────────────
const githubQueue = new Queue<GitHubJobData>(QUEUE_NAME, {
    connection: redisConnectionOptions,
});

export async function addGitHubJob(data: GitHubJobData) {
    return githubQueue.add('fetch-stats', data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 50,
    });
}

// ── Worker ───────────────────────────────────────────────────────────────────
const githubService = new GitHubService();

const githubWorker = new Worker<GitHubJobData>(
    QUEUE_NAME,
    async (job) => {
        const { userId, githubUsername } = job.data;
        console.log(`[GitHub Queue] Fetching stats for @${githubUsername} (userId: ${userId})`);

        const stats = await githubService.getUserStats(githubUsername);

        // Cache stats for 1 hour to minimise GitHub API calls
        await cacheSet(`github:stats:${userId}`, stats, 3600);
        console.log(`[GitHub Queue] Stats cached for @${githubUsername}`);
    },
    { connection: redisConnectionOptions }
);

githubWorker.on('completed', (job) => {
    console.log(`[GitHub Queue] Job ${job.id} completed`);
});

githubWorker.on('failed', (job, err) => {
    console.error(`[GitHub Queue] Job ${job?.id} failed:`, err.message);
});

export { githubQueue };
