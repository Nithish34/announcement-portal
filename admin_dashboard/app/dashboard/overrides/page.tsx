'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGetAllTeams, apiSetTeamOverride, apiClearTeamOverride, TeamRow } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Activity, CheckCircle, AlertCircle, Loader2, RefreshCw, TriangleAlert } from 'lucide-react';

type Override = 'auto' | 'WINNER' | 'LOSER';
type Toast = { msg: string; type: 'ok' | 'err' };

export default function OverridesPage() {
    const [teams, setTeams] = useState<TeamRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<Toast | null>(null);

    const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const load = useCallback(async () => {
        setLoading(true);
        try { setTeams(await apiGetAllTeams()); }
        catch { notify('Failed to load teams', 'err'); }
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
        const socket = getSocket();
        socket.connect();
        socket.on('team:override-updated', (team: TeamRow) => {
            setTeams(prev => prev.map(t => t.id === team.id ? { ...t, ...team } : t));
        });
        return () => { socket.off('team:override-updated'); socket.disconnect(); };
    }, [load]);

    const handleChange = async (teamId: string, value: Override) => {
        try {
            if (value === 'auto') {
                await apiClearTeamOverride(teamId);
                notify('Override cleared — back to slot logic');
            } else {
                await apiSetTeamOverride(teamId, value);
                notify(`Override set to ${value}`);
            }
            load();
        } catch { notify('Failed to update override', 'err'); }
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Winner Overrides</h1>
                    <p className="page-subtitle">Manually force teams to WINNER or LOSER, bypassing slot logic</p>
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

            {/* Warning Banner */}
            <div className="warn-banner mb-5">
                <TriangleAlert className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                <p>
                    Overrides take <strong>absolute priority</strong> over the automatic slot-filling logic. A team marked{' '}
                    <strong>WINNER</strong> will always be shown as a winner regardless of slots remaining. Use sparingly.
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-[#53389e]" />
                </div>
            ) : teams.length === 0 ? (
                <div className="card text-center py-16">
                    <Activity className="w-10 h-10 mx-auto mb-4 text-[#334155]" />
                    <p className="text-sm font-bold text-[#475569] tracking-widest uppercase">No teams found</p>
                </div>
            ) : (
                <div className="data-table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {['Team', 'Members', 'Phase 1', 'Current Override', 'Set Override'].map(h => (
                                    <th key={h}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map(team => {
                                const override: Override = (team.resultOverride as Override) ?? 'auto';
                                return (
                                    <tr key={team.id}>
                                        <td>
                                            <p className="font-bold text-white">{team.name}</p>
                                            <p className="text-[9px] text-[#334155] font-mono mt-0.5">{team.id.slice(0, 8)}…</p>
                                        </td>
                                        <td><span className="font-mono text-[#94a3b8]">{team._count?.members ?? '—'}</span></td>
                                        <td>
                                            <span className={`badge ${team.phase1Pass ? 'badge-green' : 'badge-dim'}`}>
                                                {team.phase1Pass ? 'Passed' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            {override !== 'auto'
                                                ? <span className="badge badge-gold">{override}</span>
                                                : <span className="text-[#334155] text-xs font-bold">Auto</span>}
                                        </td>
                                        <td>
                                            <select
                                                value={override}
                                                onChange={e => handleChange(team.id, e.target.value as Override)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider cursor-pointer
                                                    bg-black/50 border focus:outline-none transition-colors
                                                    ${override !== 'auto'
                                                        ? 'border-[#f59e0b]/50 text-[#fbbf24]'
                                                        : 'border-white/10 text-[#94a3b8] hover:border-[#53389e]/40'}`}
                                            >
                                                <option value="auto">Auto (slot logic)</option>
                                                <option value="WINNER">Force WINNER</option>
                                                <option value="LOSER">Force LOSER</option>
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
