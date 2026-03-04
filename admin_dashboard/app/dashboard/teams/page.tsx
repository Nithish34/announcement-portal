'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGetAllTeams, apiCreateTeam, TeamRow } from '@/lib/api';
import { Users, Plus, X, CheckCircle, AlertCircle, Loader2, RefreshCw, ExternalLink } from 'lucide-react';

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
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Teams</h1>
                    <p className="page-subtitle">{teams.length} team{teams.length !== 1 ? 's' : ''} registered</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button onClick={load} disabled={loading} className="btn btn-ghost">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setShowCreate(v => !v)} className="btn btn-primary">
                        {showCreate ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {showCreate ? 'Cancel' : 'New Team'}
                    </button>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type === 'ok' ? 'toast-ok' : 'toast-err'}`}>
                    {toast.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* Create form */}
            {showCreate && (
                <div className="card mb-5 border-[#53389e]/25 shadow-[0_0_24px_rgba(83,56,158,0.1)]">
                    <div className="card-header">
                        <div className="card-icon"><Plus className="w-4 h-4 text-[#a855f7]" /></div>
                        <p className="card-title">Create New Team</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="label">Team Name *</label>
                            <input value={newName} onChange={e => setNewName(e.target.value)}
                                placeholder="e.g. Team Alpha" className="input" />
                        </div>
                        <div>
                            <label className="label">Repository URL <span className="normal-case font-normal text-[#334155]">(optional)</span></label>
                            <input value={newRepo} onChange={e => setNewRepo(e.target.value)}
                                placeholder="https://github.com/org/repo" className="input" />
                        </div>
                    </div>
                    <button onClick={createTeam} disabled={creating || !newName.trim()} className="btn btn-primary">
                        {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        {creating ? 'Creating…' : 'Create Team'}
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-[#53389e]" />
                </div>
            ) : teams.length === 0 ? (
                <div className="card text-center py-16">
                    <Users className="w-10 h-10 mx-auto mb-4 text-[#334155]" />
                    <p className="text-sm font-bold text-[#475569] tracking-widest uppercase">No teams yet</p>
                    <p className="text-xs text-[#334155] mt-1">Create a team to get started</p>
                </div>
            ) : (
                <div className="data-table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {['Team', 'Members', 'Phase 1', 'Phase 2', 'Override', 'Repo'].map(h => (
                                    <th key={h}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map(team => (
                                <tr key={team.id}>
                                    <td>
                                        <p className="font-bold text-white text-sm">{team.name}</p>
                                        <p className="text-[9px] text-[#334155] font-mono mt-0.5">{team.id.slice(0, 8)}…</p>
                                    </td>
                                    <td>
                                        <span className="font-mono text-[#94a3b8]">{team._count?.members ?? '—'}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${team.phase1Pass ? 'badge-green' : 'badge-dim'}`}>
                                            {team.phase1Pass ? 'Pass' : '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${team.phase2Pass ? 'badge-green' : 'badge-dim'}`}>
                                            {team.phase2Pass ? 'Pass' : '—'}
                                        </span>
                                    </td>
                                    <td>
                                        {team.resultOverride
                                            ? <span className="badge badge-gold">{team.resultOverride}</span>
                                            : <span className="text-[#334155] text-xs font-bold">Auto</span>}
                                    </td>
                                    <td>
                                        {team.repoUrl
                                            ? <a href={team.repoUrl} target="_blank" rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-[#a855f7] text-xs hover:text-white transition-colors">
                                                View <ExternalLink className="w-3 h-3" />
                                            </a>
                                            : <span className="text-[#334155] text-xs">—</span>}
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
