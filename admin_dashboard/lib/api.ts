const BASE = process.env.NEXT_PUBLIC_API_URL!;

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
}

async function apiFetch<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const res = await fetch(`${BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const apiLogin = (email: string, password: string) =>
    apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

// Register a new user (admin only, requires ADMIN_SECRET)
export const apiRegister = (payload: {
    email: string;
    password: string;
    teamId: string;
    adminSecret: string;
}) =>
    apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

// ── Config ───────────────────────────────────────────────────────────────────
export const apiGetAllConfig = () => apiFetch<{ key: string; value: string; updatedAt: string }[]>('/admin/config');

export const apiUpdateConfig = (key: string, value: string) =>
    apiFetch(`/admin/config/${key}`, {
        method: 'PATCH',
        body: JSON.stringify({ value }),
    });

export const apiBatchUpdateConfig = (updates: { key: string; value: string }[]) =>
    apiFetch('/admin/config', {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });

// ── Teams ─────────────────────────────────────────────────────────────────────
export interface TeamRow {
    id: string;
    name: string;
    repoUrl: string | null;
    phase1Pass: boolean;
    phase2Pass: boolean;
    resultOverride: 'WINNER' | 'LOSER' | null;
    _count?: { members: number };
    members?: { id: string; email: string; role: string; result: string | null }[];
}

export const apiGetAllTeams = () => apiFetch<TeamRow[]>('/teams');

export const apiGetTeamById = (id: string) => apiFetch<TeamRow>(`/teams/${id}`);

export const apiCreateTeam = (name: string, repoUrl?: string) =>
    apiFetch<TeamRow>('/teams', {
        method: 'POST',
        body: JSON.stringify({ name, repoUrl }),
    });

// ── Results ───────────────────────────────────────────────────────────────────
export const apiGetPhase1Results = () => apiFetch('/results/phase1');
export const apiGetPhase2Results = () => apiFetch('/results/phase2');

export const apiEvaluatePhase1 = (passingTeamIds: string[]) =>
    apiFetch('/results/phase1/evaluate', {
        method: 'POST',
        body: JSON.stringify({ passingTeamIds }),
    });

export const apiEvaluatePhase2 = (
    results: { userId: string; result: 'WINNER' | 'LOSER' }[]
) =>
    apiFetch('/results/phase2/evaluate', {
        method: 'POST',
        body: JSON.stringify({ results }),
    });

export const apiTriggerGhostProtocol = (
    assignments: { userId: string; newTeamId: string }[]
) =>
    apiFetch('/admin/ghost-protocol', {
        method: 'POST',
        body: JSON.stringify({ assignments }),
    });

// ── Users ───────────────────────────────────────────────────────────────────
export interface UserRow {
    id: string;
    email: string;
    role: string;
    result: string | null;
    teamId: string;
    createdAt: string;
}

export const apiGetAllUsers = () => apiFetch<UserRow[]>('/users');

export const apiUpdateUser = (id: string, data: { email?: string; teamId?: string }) =>
    apiFetch(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

// ── Admin dashboard stats ─────────────────────────────────────────────────────
export const apiGetDashboard = () =>
    apiFetch<{
        totalTeams: number;
        totalUsers: number;
        phase1Winners: number;
        phase2Winners: number;
    }>('/admin/dashboard');

// ── Admin actions ────────────────────────────────────────────────────────────
export const apiResetPortal = () => apiFetch('/admin/reset', { method: 'POST' });

// ── Admin Management ──────────────────────────────────────────────────────────
export interface AdminRow {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    createdById: string | null;
}

export const apiListAdmins = () => apiFetch<AdminRow[]>('/admin/admins');

export const apiAddAdmin = (payload: { email: string; password: string; name?: string }) =>
    apiFetch<AdminRow>('/admin/admins', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

export const apiRemoveAdmin = (adminId: string) =>
    apiFetch(`/admin/admins/${adminId}`, { method: 'DELETE' });
