import { Queue, Worker } from 'bullmq';
import { bullConnection } from './connection';
import { GitHubService } from '../services/github.service';

export interface GitHubJobData {
    userId: string;
    githubUsername: string;
}

const QUEUE_NAME = 'github-jobs';

// ── Lazy singletons ── only connect to Redis when a job is actually enqueued.
let _queue: Queue<GitHubJobData> | null = null;
let _workerStarted = false;

function getQueue(): Queue<GitHubJobData> {
    if (!_queue) {
        _queue = new Queue<GitHubJobData>(QUEUE_NAME, {
            ...bullConnection,
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
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
                console.log(`[GitHub Queue] create-repo job for userId: ${userId}`);
            }

            if (job.name === 'delete-repo') {
                console.log(`[GitHub Queue] delete-repo job for userId: ${userId}`);
            }
        },
        { ...bullConnection }
    )
        .on('completed', (job) => console.log(`[GitHub Queue] Job ${job.id} completed`))
        .on('failed', (job, err) => console.error(`[GitHub Queue] Job ${job?.id} failed:`, err.message));
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function addGitHubJob(data: GitHubJobData) {
    ensureWorker();
    return getQueue().add('fetch-stats', data);
}
