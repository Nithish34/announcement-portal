const BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Helper to make authenticated requests (attaches JWT token)
const authFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = sessionStorage.getItem('token')

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        }
    })

    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const loginUser = (email: string, password: string) =>
    fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    }).then(res => res.json())

// ── Results ──────────────────────────────────────────────────────────────────
export const getPhase1Results = () => authFetch('/results/phase1')
export const getPhase2Results = () => authFetch('/results/phase2')

// ── Teams ────────────────────────────────────────────────────────────────────
export const getAllTeams = () => authFetch('/teams')
export const getTeamById = (id: string) => authFetch(`/teams/${id}`)

// ── Config / Timers ──────────────────────────────────────────────────────────
export const getTimers = () =>
    fetch(`${BASE_URL}/config/timers`).then(res => res.json())

// ── Admin — System Config ────────────────────────────────────────────────────
export const getAllConfig = () => authFetch('/admin/config')

export const updateConfig = (key: string, value: string) =>
    authFetch(`/admin/config/${key}`, {
        method: 'PATCH',
        body: JSON.stringify({ value }),
    })

export const batchUpdateConfig = (updates: { key: string; value: string }[]) =>
    authFetch('/admin/config', {
        method: 'PATCH',
        body: JSON.stringify(updates),
    })

// ── Admin — Team Override ─────────────────────────────────────────────────────
export const setTeamOverride = (teamId: string, override: 'WINNER' | 'LOSER') =>
    authFetch(`/admin/teams/${teamId}/override`, {
        method: 'PATCH',
        body: JSON.stringify({ override }),
    })

export const clearTeamOverride = (teamId: string) =>
    authFetch(`/admin/teams/${teamId}/override`, { method: 'DELETE' })

// ── Legacy ───────────────────────────────────────────────────────────────────
export const triggerGhostProtocol = () =>
    authFetch('/admin/ghost-protocol', { method: 'POST' })
