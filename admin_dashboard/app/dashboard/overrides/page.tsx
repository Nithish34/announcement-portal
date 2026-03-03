'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGetAllTeams, apiSetTeamOverride, apiClearTeamOverride, TeamRow } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Activity, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black tracking-[0.1em] uppercase text-white">Winner Overrides</h1>
                    <p className="text-xs text-gray-500 tracking-widest mt-1">Manually force teams to WINNER or LOSER, bypassing slot logic</p>
                </div>
                <button onClick={load} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-[#53389e]/20 transition-all disabled:opacity-50">
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold shadow-2xl
          ${toast.type === 'ok' ? 'bg-[#0c0c12] border-[#10b981]/50 text-[#10b981]' : 'bg-[#0c0c12] border-red-500/50 text-red-400'}`}>
                    {toast.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Activity className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300/80 tracking-wide">
                    Overrides take absolute priority over the automatic slot-filling logic. A team marked <strong>WINNER</strong> will always be shown as a winner regardless of slots remaining. Use sparingly.
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-[#53389e]" /></div>
            ) : teams.length === 0 ? (
                <p className="text-center text-gray-600 py-10 text-sm">No teams found.</p>
            ) : (
                <div className="bg-[#0c0c12] border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                {['Team', 'Members', 'Phase 1', 'Current Override', 'Set Override'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-[9px] text-gray-500 font-black tracking-widest uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map((team, i) => {
                                const override: Override = team.resultOverride ?? 'auto';
                                return (
                                    <tr key={team.id}
                                        className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                                        <td className="px-4 py-3">
                                            <p className="font-black text-white">{team.name}</p>
                                            <p className="text-[9px] text-gray-600 font-mono">{team.id.slice(0, 8)}…</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 font-mono">{team._count?.members ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border
                        ${team.phase1Pass ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                                {team.phase1Pass ? 'PASSED' : 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {override !== 'auto'
                                                ? <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase border border-[#ffd700]/50 bg-[#ffd700]/10 text-[#ffd700]">{override}</span>
                                                : <span className="text-gray-600 text-xs font-bold">AUTO</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={override}
                                                onChange={e => handleChange(team.id, e.target.value as Override)}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold tracking-wider bg-black/60 border focus:outline-none cursor-pointer transition-colors
                          ${override !== 'auto'
                                                        ? 'border-[#ffd700]/50 text-[#ffd700] shadow-[0_0_10px_rgba(255,215,0,0.15)]'
                                                        : 'border-white/10 text-gray-300 hover:border-[#53389e]/40'}`}
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
