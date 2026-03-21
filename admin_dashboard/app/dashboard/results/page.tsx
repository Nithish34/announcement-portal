'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    apiGetAllTeams, apiGetAllConfig,
    apiEvaluatePhase1, apiEvaluatePhase2,
    apiCreateTeam, apiTriggerGhostProtocol,
    TeamRow,
} from '@/lib/api';
import {
    Trophy, Users, User, CheckCircle, AlertCircle,
    Loader2, Play, RefreshCw, TriangleAlert, Zap
} from 'lucide-react';
import HoldButton from '@/app/components/HoldButton';

type Toast = { msg: string; type: 'ok' | 'err' };
type Tab = 'eval1' | 'eval2';

interface MemberRow {
    id: string;
    email: string;
    role: string;
    result: string | null;
}

interface TeamWithMembers extends TeamRow {
    members?: MemberRow[];
}

// ─── helpers ────────────────────────────────────────────────────────────────
const BASE = process.env.NEXT_PUBLIC_API_URL!;
function getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
}
async function apiFetchInner<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

// Fetch a single team with its members list
function apiGetTeamWithMembers(id: string): Promise<TeamWithMembers> {
    return apiFetchInner<TeamWithMembers>(`/teams/${id}`);
}

// ─── Slot counter bar ────────────────────────────────────────────────────────
function SlotBar({ selected, max, color }: { selected: number; max: number; color: string }) {
    const pct = max > 0 ? Math.min((selected / max) * 100, 100) : 0;
    const full = selected >= max;
    return (
        <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, background: full ? '#ef4444' : color }}
                />
            </div>
            <span className={`text-sm font-black font-mono shrink-0 ${full ? 'text-red-400' : 'text-white'}`}>
                {selected} <span className="text-[#475569]">/ {max}</span>
            </span>
        </div>
    );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function EvaluationPage() {
    const [tab, setTab] = useState<Tab>('eval1');

    // ── Eval 1: team selection ────────────────────────────────────────────────
    const [teams, setTeams] = useState<TeamRow[]>([]);
    const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
    const [maxSlotsEval1, setMaxSlotsEval1] = useState(0);

    // ── Eval 2: individual selection ──────────────────────────────────────────
    const [passedTeams, setPassedTeams] = useState<TeamWithMembers[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [maxSlotsEval2, setMaxSlotsEval2] = useState(0);
    const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

    // ── Shared state ──────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);

    const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // Load config for max slots
    const loadConfig = useCallback(async () => {
        try {
            const rows = await apiGetAllConfig();
            const map: Record<string, string> = {};
            rows.forEach(r => { map[r.key] = r.value; });
            setMaxSlotsEval1(Number(map['max_slots'] ?? 0));
            setMaxSlotsEval2(Number(map['max_slots_eval2'] ?? 0));
        } catch { /* ignore */ }
    }, []);

    // Load passed teams WITH members for Eval 2
    const loadPassedTeamsWithMembers = useCallback(async (allTeams: TeamRow[]) => {
        const passed = allTeams.filter(t => t.phase1Pass);
        try {
            const withMembers = await Promise.all(passed.map(t => apiGetTeamWithMembers(t.id)));
            setPassedTeams(withMembers);
            // Pre-select users already marked as WINNER
            const alreadyWon = new Set(
                withMembers.flatMap(t => (t.members ?? []).filter(m => m.result === 'WINNER').map(m => m.id))
            );
            setSelectedUsers(alreadyWon);
        } catch { notify('Failed to load team members', 'err'); }
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            await loadConfig();
            const allTeams = await apiGetAllTeams();
            setTeams(allTeams);
            const alreadyPassed = new Set(allTeams.filter(t => t.phase1Pass).map(t => t.id));
            setSelectedTeams(alreadyPassed);
            await loadPassedTeamsWithMembers(allTeams);
        } catch { notify('Failed to load data', 'err'); }
        setLoading(false);
    }, [loadConfig, loadPassedTeamsWithMembers]);

    useEffect(() => { load(); }, [load]);

    // ── Eval 1 handlers ───────────────────────────────────────────────────────
    const toggleTeam = (id: string) => {
        setSelectedTeams(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                if (maxSlotsEval1 > 0 && next.size >= maxSlotsEval1) {
                    notify(`Max slots for Eval 1 is ${maxSlotsEval1}. Deselect a team first.`, 'err');
                    return prev;
                }
                next.add(id);
            }
            return next;
        });
    };

    const publishEval1 = async () => {
        if (selectedTeams.size === 0) { notify('Select at least one team', 'err'); return; }
        setPublishing(true);
        try {
            await apiEvaluatePhase1(Array.from(selectedTeams));
            notify(`✓ Eval 1 published — ${selectedTeams.size} teams selected`);
            load();
        } catch (e: unknown) { notify((e as Error).message ?? 'Failed to publish', 'err'); }
        setPublishing(false);
    };

    // ── Eval 2 handlers ───────────────────────────────────────────────────────
    const toggleUser = (id: string) => {
        setSelectedUsers(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                if (maxSlotsEval2 > 0 && next.size >= maxSlotsEval2) {
                    notify(`Max slots for Eval 2 is ${maxSlotsEval2}. Deselect a user first.`, 'err');
                    return prev;
                }
                next.add(id);
            }
            return next;
        });
    };

    const toggleExpand = (id: string) => {
        setExpandedTeams(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const publishEval2 = async () => {
        if (selectedUsers.size === 0) { notify('Select at least one participant', 'err'); return; }
        const allMembers = passedTeams.flatMap(t => t.members ?? []);
        const results = allMembers.map(m => ({
            userId: m.id,
            result: (selectedUsers.has(m.id) ? 'WINNER' : 'LOSER') as 'WINNER' | 'LOSER',
        }));
        setPublishing(true);
        try {
            await apiEvaluatePhase2(results);
            notify(`✓ Eval 2 published — ${selectedUsers.size} individuals selected`);
            load();
        } catch (e: unknown) { notify((e as Error).message ?? 'Failed to publish', 'err'); }
        setPublishing(false);
    };

    const triggerGhostProtocol = async () => {
        if (selectedUsers.size === 0) { notify('Select at least one participant first', 'err'); return; }
        setPublishing(true);
        try {
            // 1. Array of selected user IDs
            const usersToShuffle = Array.from(selectedUsers);
            const shuffled = [...usersToShuffle].sort(() => Math.random() - 0.5);

            // 2. Determine number of teams (target 4 members per team)
            const teamSize = 4;
            const numTeams = Math.ceil(shuffled.length / teamSize) || 1;

            // 3. Create teams
            const newTeamIds: string[] = [];
            for (let i = 0; i < numTeams; i++) {
                // e.g. Ghost Squad A, B, C...
                const teamName = `Ghost Squad ${String.fromCharCode(65 + i)}`; 
                const created = await apiCreateTeam(teamName);
                newTeamIds.push(created.id);
            }

            // 4. Assign users to new teams
            const assignments: { userId: string; newTeamId: string }[] = [];
            shuffled.forEach((userId, idx) => {
                const teamIndex = idx % numTeams;
                assignments.push({ userId, newTeamId: newTeamIds[teamIndex] });
            });

            // 5. Trigger the protocol
            await apiTriggerGhostProtocol(assignments);
            notify(`✓ Ghost Protocol triggered for ${shuffled.length} users across ${numTeams} new teams!`);
            load();
        } catch (e: unknown) {
            notify((e as Error).message ?? 'Failed to trigger Ghost Protocol', 'err');
        }
        setPublishing(false);
    };

    // ── Total participants across passed teams ────────────────────────────────
    const totalEval2Participants = passedTeams.reduce((s, t) => s + (t.members?.length ?? 0), 0);

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Evaluation</h1>
                    <p className="page-subtitle">Select winners for each evaluation round</p>
                </div>
                <button onClick={load} disabled={loading} className="btn btn-ghost">
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type === 'ok' ? 'toast-ok' : 'toast-err'}`}>
                    {toast.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* Tab switcher */}
            <div className="flex gap-2 mb-6 p-1 bg-white/[0.03] border border-white/[0.07] rounded-xl w-fit">
                {(['eval1', 'eval2'] as Tab[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-6 py-2 rounded-lg font-black text-xs tracking-widest uppercase transition-all
                            ${tab === t
                                ? 'bg-[#53389e] text-white shadow-[0_0_12px_rgba(83,56,158,0.4)]'
                                : 'text-[#475569] hover:text-white'}`}
                    >
                        {t === 'eval1' ? 'Evaluation 1' : 'Evaluation 2'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-60">
                    <Loader2 className="w-8 h-8 animate-spin text-[#53389e]" />
                </div>
            ) : tab === 'eval1' ? (
                /* ═══════════════════ EVAL 1 ═══════════════════ */
                <div className="space-y-5">
                    {/* Slot counter card */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-icon"><Trophy className="w-4 h-4 text-[#f59e0b]" /></div>
                            <div className="flex-1">
                                <p className="card-title">Team Selection — Evaluation 1</p>
                                <p className="text-[10px] text-[#475569] mt-0.5">
                                    Select which teams advance. Cannot exceed the max slot limit.
                                </p>
                            </div>
                        </div>
                        <SlotBar selected={selectedTeams.size} max={maxSlotsEval1} color="#f59e0b" />
                        {maxSlotsEval1 === 0 && (
                            <p className="text-[10px] text-[#f59e0b]/70 mt-2 flex items-center gap-1.5">
                                <TriangleAlert className="w-3 h-3" />
                                Max slots not configured. Set it in Settings first.
                            </p>
                        )}
                    </div>

                    {/* Teams table */}
                    {teams.length === 0 ? (
                        <div className="card text-center py-16">
                            <Users className="w-10 h-10 mx-auto mb-4 text-[#334155]" />
                            <p className="text-sm font-bold text-[#475569] tracking-widest uppercase">No teams registered</p>
                        </div>
                    ) : (
                        <div className="card p-0 overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-white/[0.05] bg-white/[0.02] flex items-center justify-between">
                                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5 text-[#a855f7]" />
                                    All Teams
                                </span>
                                <span className="badge badge-dim">{teams.length} team{teams.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="divide-y divide-white/[0.04]">
                                {teams.map(team => {
                                    const checked = selectedTeams.has(team.id);
                                    const canCheck = !checked && maxSlotsEval1 > 0 && selectedTeams.size >= maxSlotsEval1;
                                    return (
                                        <div
                                            key={team.id}
                                            onClick={() => { if (!canCheck) toggleTeam(team.id); }}
                                            className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors
                                                ${checked ? 'bg-[#f59e0b]/05' : 'hover:bg-white/[0.025]'}
                                                ${canCheck ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        >
                                            {/* Checkbox */}
                                            <div
                                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer
                                                    ${checked
                                                        ? 'bg-[#f59e0b] border-[#f59e0b]'
                                                        : 'border-white/20 hover:border-[#f59e0b]/50'}`}
                                            >
                                                {checked && <CheckCircle className="w-3.5 h-3.5 text-black" />}
                                            </div>

                                            {/* Team info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{team.name}</p>
                                                <p className="text-[9px] text-[#334155] font-mono mt-0.5">{team.id.slice(0, 12)}…</p>
                                            </div>

                                            {/* Member count */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <User className="w-3 h-3 text-[#475569]" />
                                                <span className="text-xs text-[#94a3b8] font-mono">{team._count?.members ?? 0} members</span>
                                            </div>

                                            {/* Status badge */}
                                            {checked ? (
                                                <span className="badge badge-gold shrink-0">Selected</span>
                                            ) : team.phase1Pass ? (
                                                <span className="badge badge-green shrink-0">Previously Passed</span>
                                            ) : (
                                                <span className="badge badge-dim shrink-0">Not Selected</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Publish button */}
                    <div className="flex justify-end max-w-sm ml-auto">
                        <HoldButton
                            onTrigger={publishEval1}
                            disabled={publishing || selectedTeams.size === 0}
                            holdTimeMs={2000}
                            idleText={`PUBLISH EVAL 1 (${selectedTeams.size} TEAMS)`}
                            holdingText="PUBLISHING..."
                            successText="PUBLISHED!"
                            icon={<Play className="w-4 h-4" />}
                        />
                    </div>
                </div>
            ) : (
                /* ═══════════════════ EVAL 2 ═══════════════════ */
                <div className="space-y-5">
                    {/* Slot counter card */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-icon"><Trophy className="w-4 h-4 text-[#10b981]" /></div>
                            <div className="flex-1">
                                <p className="card-title">Individual Selection — Evaluation 2</p>
                                <p className="text-[10px] text-[#475569] mt-0.5">
                                    Select individual participants from Eval 1 teams. Cannot exceed the max slot limit.
                                </p>
                            </div>
                        </div>
                        <SlotBar selected={selectedUsers.size} max={maxSlotsEval2} color="#10b981" />
                        {maxSlotsEval2 === 0 && (
                            <p className="text-[10px] text-[#10b981]/70 mt-2 flex items-center gap-1.5">
                                <TriangleAlert className="w-3 h-3" />
                                Max slots for Eval 2 not configured. Set it in Settings first.
                            </p>
                        )}
                    </div>

                    {/* Info if no passed teams yet */}
                    {passedTeams.length === 0 ? (
                        <div className="card text-center py-16">
                            <Trophy className="w-10 h-10 mx-auto mb-4 text-[#334155]" />
                            <p className="text-sm font-bold text-[#475569] tracking-widest uppercase">No Eval 1 teams published yet</p>
                            <p className="text-xs text-[#334155] mt-2">Publish Eval 1 first to see participants here.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <p className="text-[9px] font-black tracking-widest text-[#334155] uppercase">
                                    {totalEval2Participants} participants across {passedTeams.length} teams
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setExpandedTeams(new Set(passedTeams.map(t => t.id)))}
                                        className="text-[10px] text-[#475569] hover:text-white transition-colors font-bold"
                                    >
                                        Expand All
                                    </button>
                                    <span className="text-[#334155]">·</span>
                                    <button
                                        onClick={() => setExpandedTeams(new Set())}
                                        className="text-[10px] text-[#475569] hover:text-white transition-colors font-bold"
                                    >
                                        Collapse All
                                    </button>
                                </div>
                            </div>

                            {/* Teams accordion */}
                            <div className="space-y-3">
                                {passedTeams.map(team => {
                                    const members = team.members ?? [];
                                    const teamSelected = members.filter(m => selectedUsers.has(m.id)).length;
                                    const expanded = expandedTeams.has(team.id);

                                    return (
                                        <div
                                            key={team.id}
                                            className="card p-0 overflow-hidden"
                                            style={{ borderColor: teamSelected > 0 ? 'rgba(16,185,129,0.2)' : undefined }}
                                        >
                                            {/* Team header */}
                                            <button
                                                onClick={() => toggleExpand(team.id)}
                                                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.025] transition-colors text-left"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-white">{team.name}</p>
                                                    <p className="text-[9px] text-[#334155] mt-0.5">
                                                        {members.length} member{members.length !== 1 ? 's' : ''}
                                                        {teamSelected > 0 && (
                                                            <span className="text-[#10b981] ml-2">· {teamSelected} selected</span>
                                                        )}
                                                    </p>
                                                </div>
                                                <span className={`text-[10px] font-black tracking-wider transition-transform ${expanded ? 'rotate-90' : ''} text-[#475569]`}>›</span>
                                            </button>

                                            {/* Members list */}
                                            {expanded && (
                                                <div className="border-t border-white/[0.05] divide-y divide-white/[0.04]">
                                                    {members.length === 0 ? (
                                                        <p className="px-5 py-4 text-xs text-[#334155] italic">No members in this team</p>
                                                    ) : members.map(member => {
                                                        const checked = selectedUsers.has(member.id);
                                                        const canCheck = !checked && maxSlotsEval2 > 0 && selectedUsers.size >= maxSlotsEval2;
                                                        return (
                                                            <div
                                                                key={member.id}
                                                                onClick={() => toggleUser(member.id)}
                                                                className={`flex items-center gap-4 px-6 py-3 transition-colors
                                                                    ${checked ? 'bg-[#10b981]/05' : 'hover:bg-white/[0.025]'}
                                                                    ${canCheck ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                                            >
                                                                {/* Checkbox */}
                                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                                                                    ${checked
                                                                        ? 'bg-[#10b981] border-[#10b981]'
                                                                        : 'border-white/20 hover:border-[#10b981]/50'}`}>
                                                                    {checked && <CheckCircle className="w-3.5 h-3.5 text-black" />}
                                                                </div>

                                                                {/* Avatar */}
                                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#53389e]/50 to-[#a855f7]/30 flex items-center justify-center text-xs font-black text-white shrink-0">
                                                                    {member.email[0].toUpperCase()}
                                                                </div>

                                                                {/* Email */}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-medium text-[#e2e8f0] truncate">{member.email}</p>
                                                                    <p className="text-[9px] text-[#334155]">{member.role}</p>
                                                                </div>

                                                                {/* Status */}
                                                                {checked ? (
                                                                    <span className="badge badge-green shrink-0">Selected</span>
                                                                ) : member.result === 'WINNER' ? (
                                                                    <span className="badge badge-green shrink-0">Previously Won</span>
                                                                ) : (
                                                                    <span className="badge badge-dim shrink-0">Not Selected</span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-6">
                        <div className="w-full sm:w-auto min-w-[250px]">
                            <HoldButton
                                onTrigger={publishEval2}
                                disabled={publishing || selectedUsers.size === 0 || passedTeams.length === 0}
                                holdTimeMs={2000}
                                idleText={`PUBLISH EVAL 2 (${selectedUsers.size} USERS)`}
                                holdingText="PUBLISHING..."
                                successText="PUBLISHED!"
                                icon={<Play className="w-4 h-4" />}
                            />
                        </div>
                        <div className="w-full sm:w-auto min-w-[300px]">
                            <HoldButton
                                onTrigger={triggerGhostProtocol}
                                disabled={publishing || selectedUsers.size === 0 || passedTeams.length === 0}
                                holdTimeMs={3000}
                                idleText="FORM TEAMS & TRIGGER GHOST"
                                holdingText="INITIATING GHOST PROTOCOL..."
                                successText="GHOST PROTOCOL TRIGGERED!"
                                icon={<Zap className="w-4 h-4" />}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
