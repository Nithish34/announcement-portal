'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGetAllTeams, apiCreateTeam, TeamRow } from '@/lib/api';
import { Users, Plus, X, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

type Toast = { msg: string; type: 'ok' | 'err' };

export default function TeamsPage() {
    const [teams, setTeams] = useState<TeamRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<Toast | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newRepo, setNewRepo] = useState('');
    const [creating, setCreating] = useState(false);

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

    useEffect(() => { load(); }, [load]);

    const createTeam = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        try {
            await apiCreateTeam(newName.trim(), newRepo.trim() || undefined);
            notify(`✓ Team "${newName}" created`);
            setNewName(''); setNewRepo(''); setShowCreate(false);
            load();
        } catch (e: unknown) {
            notify((e as Error).message ?? 'Failed to create team', 'err');
        }
        setCreating(false);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black tracking-[0.1em] uppercase text-white">Teams</h1>
                    <p className="text-xs text-gray-500 tracking-widest mt-1">{teams.length} teams registered</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={load} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-[#53389e]/20 transition-all disabled:opacity-50">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setShowCreate(v => !v)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#53389e] to-[#a855f7] text-white font-black text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(83,56,158,0.3)] hover:scale-[1.02] transition-all">
                        {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {showCreate ? 'Cancel' : 'New Team'}
                    </button>
                </div>
            </div>

            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold shadow-2xl
          ${toast.type === 'ok' ? 'bg-[#0c0c12] border-[#10b981]/50 text-[#10b981]' : 'bg-[#0c0c12] border-red-500/50 text-red-400'}`}>
                    {toast.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* Create form */}
            {showCreate && (
                <div className="bg-[#0c0c12] border border-[#53389e]/30 rounded-2xl p-6 mb-6 shadow-[0_0_20px_rgba(83,56,158,0.1)]">
                    <h2 className="text-xs font-black tracking-[0.2em] uppercase text-white mb-4">Create New Team</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1.5">Team Name *</label>
                            <input value={newName} onChange={e => setNewName(e.target.value)}
                                placeholder="e.g. Team Alpha"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#53389e] transition-colors" />
                        </div>
                        <div>
                            <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1.5">Repository URL (optional)</label>
                            <input value={newRepo} onChange={e => setNewRepo(e.target.value)}
                                placeholder="https://github.com/org/repo"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#53389e] transition-colors" />
                        </div>
                    </div>
                    <button onClick={createTeam} disabled={creating || !newName.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#53389e] to-[#a855f7] text-white font-black text-sm tracking-widest uppercase disabled:opacity-60">
                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {creating ? 'Creating…' : 'Create Team'}
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-[#53389e]" /></div>
            ) : teams.length === 0 ? (
                <div className="text-center py-20 text-gray-600">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm font-bold tracking-widest uppercase">No teams yet</p>
                    <p className="text-xs mt-1">Create a team to get started</p>
                </div>
            ) : (
                <div className="bg-[#0c0c12] border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                {['Team Name', 'Members', 'Phase 1', 'Phase 2', 'Override', 'Repo'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-[9px] text-gray-500 font-black tracking-widest uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map((team, i) => (
                                <tr key={team.id}
                                    className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                                    <td className="px-4 py-3">
                                        <p className="font-black text-white">{team.name}</p>
                                        <p className="text-[9px] text-gray-600 font-mono mt-0.5">{team.id.slice(0, 8)}…</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-300 font-mono">{team._count?.members ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border
                      ${team.phase1Pass ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                            {team.phase1Pass ? 'PASS' : '—'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border
                      ${team.phase2Pass ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                            {team.phase2Pass ? 'PASS' : '—'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {team.resultOverride
                                            ? <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase border border-[#ffd700]/40 text-[#ffd700] bg-[#ffd700]/10">{team.resultOverride}</span>
                                            : <span className="text-gray-600 text-xs">AUTO</span>}
                                    </td>
                                    <td className="px-4 py-3 text-[10px] text-gray-500">
                                        {team.repoUrl
                                            ? <a href={team.repoUrl} target="_blank" rel="noreferrer" className="text-[#a855f7] underline underline-offset-2 hover:text-white">View</a>
                                            : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
