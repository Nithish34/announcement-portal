import { Octokit } from 'octokit';

export interface GitHubUserStats {
    username: string;
    publicRepos: number;
    followers: number;
    following: number;
    totalCommits: number; // from contribution events (approximation)
    avatarUrl: string;
    profileUrl: string;
}

export class GitHubService {
    private octokit: Octokit;

    constructor() {
        this.octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN, // optional: personal access token to raise rate limits
        });
    }

    async getUserStats(username: string): Promise<GitHubUserStats> {
        const { data: user } = await this.octokit.rest.users.getByUsername({ username });

        // Approximate total commits from public events (last 100 push events)
        const { data: events } = await this.octokit.rest.activity.listPublicEventsForUser({
            username,
            per_page: 100,
        });

        const totalCommits = events
            .filter((e: any) => e.type === 'PushEvent')
            .reduce((acc: number, e: any) => acc + (e.payload?.commits?.length ?? 0), 0);

        return {
            username: user.login,
            publicRepos: user.public_repos,
            followers: user.followers,
            following: user.following,
            totalCommits,
            avatarUrl: user.avatar_url,
            profileUrl: user.html_url,
        };
    }

    async getRepoLanguages(owner: string, repo: string): Promise<Record<string, number>> {
        const { data } = await this.octokit.rest.repos.listLanguages({ owner, repo });
        return data as Record<string, number>;
    }
}
