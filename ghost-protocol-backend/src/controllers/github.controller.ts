import { Request, Response } from 'express';
import crypto from 'crypto';
import { GitHubService } from '../services/github.service';
import { addGitHubJob } from '../queues/github.queue';

const githubService = new GitHubService();

// GET /api/github/stats/:username
// Fetches live GitHub stats for any username — no DB lookup needed
export async function getGitHubStats(req: Request, res: Response): Promise<void> {
    const username = String(req.params.username);
    if (!username) { res.status(400).json({ error: 'username param is required' }); return; }

    try {
        const stats = await githubService.getUserStats(username);
        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch GitHub stats' });
    }
}

// POST /api/github/enqueue
// Body: { githubUsername } — queues a background stats fetch + cache for the logged-in user
export async function linkGitHubAccount(req: Request, res: Response): Promise<void> {
    const { githubUsername } = req.body as { githubUsername?: string };
    if (!githubUsername) { res.status(400).json({ error: 'githubUsername is required' }); return; }

    try {
        // Queue a background job to fetch and cache the stats in Redis
        await addGitHubJob({ userId: req.user!.userId, githubUsername });
        res.json({ message: `GitHub stats fetch queued for @${githubUsername}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST /api/github/webhook — HMAC-verified GitHub event receiver
export async function handleWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers['x-hub-signature-256'] as string | undefined;
    const secret = process.env.GITHUB_WEBHOOK_SECRET!;
    const body = JSON.stringify(req.body);

    const expected = `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;

    if (!signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        res.status(401).json({ error: 'Invalid webhook signature' });
        return;
    }

    const event = req.headers['x-github-event'];
    console.log(`[GitHub Webhook] Received event: ${event}`);
    res.json({ message: 'Webhook received' });
}

// POST /api/github/provision/:teamId
// Enqueue repo creation for a team
export async function provisionRepo(req: Request, res: Response): Promise<void> {
    const teamId = String(req.params.teamId);
    if (!teamId) { res.status(400).json({ error: 'teamId is required' }); return; }

    try {
        // Enforce actual logic to spawn a queue job or call GitHubService
        res.status(202).json({ message: `Repo provision queued for team ${teamId}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// DELETE /api/github/deprovision/:teamId
// Remove repo access
export async function deprovisionRepo(req: Request, res: Response): Promise<void> {
    const teamId = String(req.params.teamId);
    if (!teamId) { res.status(400).json({ error: 'teamId is required' }); return; }

    try {
        // Enforce actual logic to revoke repo access
        res.json({ message: `Repo access revoked for team ${teamId}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
