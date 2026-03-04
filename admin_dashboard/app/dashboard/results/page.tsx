'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGetPhase1Results, apiGetPhase2Results, apiEvaluatePhase1, apiEvaluatePhase2 } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Trophy, Users, User, CheckCircle, AlertCircle, Loader2, Play, RefreshCw } from 'lucide-react';

type Toast = { msg: string; type: 'ok' | 'err' };
type Phase = '1' | '2';

interface Phase1Team {
    id: string; name: string; memberCount: number;
    result: 'WINNER' | 'LOSER'; phase1Pass: boolean; resultOverride: string | null;
}
interface Phase2User {
    id: string; email: string; role: string;
    result: 'WINNER' | 'LOSER' | null; team: { name: string };
}

export default function ResultsPage() {
    const [phase, setPhase] = useState<Phase>('1');
    const [phase1Data, setPhase1Data] = useState<Phase1Team[]>([]);
    const [phase2Data, setPhase2Data] = useState<Phase2User[]>([]);
    const [loading, setLoading] = useState(true);
    const [evaluating, setEvaluating] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);

    const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [p1, p2] = await Promise.all([apiGetPhase1Results(), apiGetPhase2Results()]);
            setPhase1Data(p1 as Phase1Team[]);
            setPhase2Data(p2 as Phase2User[]);
        } catch { notify('Failed to load results', 'err'); }
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
        const socket = getSocket();
        socket.connect();
        socket.on('phase1:published', load);
        socket.on('phase2:published', load);
        return () => { socket.off('phase1:published'); socket.off('phase2:published'); socket.disconnect(); };
    }, [load]);

    const evaluatePhase1 = async () => {
        const winnerIds = phase1Data.filter(t => t.result === 'WINNER').map(t => t.id);
        setEvaluating(true);
        try {
            await apiEvaluatePhase1(winnerIds);
            notify(`✓ Phase 1 published — ${winnerIds.length} teams advanced`);
            load();
        } catch { notify('Failed to publish Phase 1', 'err'); }
        setEvaluating(false);
    };

    const evaluatePhase2 = async () => {
        const results = phase2Data.filter(u => u.result !== null)
            .map(u => ({ userId: u.id, result: u.result as 'WINNER' | 'LOSER' }));
        setEvaluating(true);
        try {
            await apiEvaluatePhase2(results);
            notify(`✓ Phase 2 published — ${results.length} users evaluated`);
        } catch { notify('Failed to publish Phase 2', 'err'); }
        setEvaluating(false);
    };

    const winners1 = phase1Data.filter(t => t.result === 'WINNER');
    const winners2 = phase2Data.filter(u => u.result === 'WINNER');

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Results Management</h1>
                    <p className="page-subtitle">View and publish evaluation results for each phase</p>
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

            {/* Phase Tabs */}
            <div className="flex gap-2 mb-6 p-1 bg-white/[0.03] border border-white/[0.07] rounded-xl w-fit">
                {(['1', '2'] as Phase[]).map(p => (
                    <button key={p} onClick={() => setPhase(p)}
                        className={`px-5 py-2 rounded-lg font-black text-xs tracking-widest uppercase transition-all
                            ${phase === p
                                ? 'bg-[#53389e] text-white shadow-[0_0_12px_rgba(83,56,158,0.4)]'
                                : 'text-[#475569] hover:text-white'}`}>
                        Phase {p}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-[#53389e]" />
                </div>
            ) : phase === '1' ? (
                <>
                    {/* Phase 1 Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="card flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center shrink-0">
                                <Trophy className="w-6 h-6 text-[#f59e0b]" />
                            </div>
                            <div>
                                <p className="text-[9px] text-[#475569] uppercase tracking-widest font-bold mb-1">Winners</p>
                                <p className="text-3xl font-black text-[#10b981]">{winners1.length}</p>
                            </div>
                        </div>
                        <div className="card flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#53389e]/15 border border-[#53389e]/30 flex items-center justify-center shrink-0">
                                <Users className="w-6 h-6 text-[#a855f7]" />
                            </div>
                            <div>
                                <p className="text-[9px] text-[#475569] uppercase tracking-widest font-bold mb-1">Total Teams</p>
                                <p className="text-3xl font-black text-white">{phase1Data.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mb-4">
                        <button onClick={evaluatePhase1} disabled={evaluating || phase1Data.length === 0} className="btn btn-primary">
                            {evaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                            {evaluating ? 'Publishing…' : 'Publish Phase 1 Results'}
                        </button>
                    </div>

                    <div className="data-table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>{['Team', 'Members', 'Phase 1', 'Override', 'Result'].map(h => <th key={h}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {phase1Data.map(team => (
                                    <tr key={team.id}>
                                        <td className="font-bold text-white">{team.name}</td>
                                        <td><span className="font-mono text-[#94a3b8]">{team.memberCount}</span></td>
                                        <td>
                                            <span className={`badge ${team.phase1Pass ? 'badge-green' : 'badge-dim'}`}>
                                                {team.phase1Pass ? 'Passed' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            {team.resultOverride
                                                ? <span className="badge badge-gold">{team.resultOverride}</span>
                                                : <span className="text-[#334155] text-xs font-bold">Auto</span>}
                                        </td>
                                        <td>
                                            <span className={`badge ${team.result === 'WINNER' ? 'badge-green' : 'badge-red'}`}>
                                                {team.result}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <>
                    {/* Phase 2 Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="card flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center shrink-0">
                                <Trophy className="w-6 h-6 text-[#f59e0b]" />
                            </div>
                            <div>
                                <p className="text-[9px] text-[#475569] uppercase tracking-widest font-bold mb-1">Top Performers</p>
                                <p className="text-3xl font-black text-[#10b981]">{winners2.length}</p>
                            </div>
                        </div>
                        <div className="card flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#53389e]/15 border border-[#53389e]/30 flex items-center justify-center shrink-0">
                                <User className="w-6 h-6 text-[#a855f7]" />
                            </div>
                            <div>
                                <p className="text-[9px] text-[#475569] uppercase tracking-widest font-bold mb-1">Total Users</p>
                                <p className="text-3xl font-black text-white">{phase2Data.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mb-4">
                        <button onClick={evaluatePhase2} disabled={evaluating || phase2Data.length === 0} className="btn btn-primary">
                            {evaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                            {evaluating ? 'Publishing…' : 'Publish Phase 2 Results'}
                        </button>
                    </div>

                    <div className="data-table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>{['Email', 'Team', 'Role', 'Result'].map(h => <th key={h}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {phase2Data.map(u => (
                                    <tr key={u.id}>
                                        <td className="text-white font-medium">{u.email}</td>
                                        <td className="text-[#94a3b8]">{u.team.name}</td>
                                        <td><span className="badge badge-violet">{u.role}</span></td>
                                        <td>
                                            <span className={`badge ${u.result === 'WINNER' ? 'badge-green' : u.result === 'LOSER' ? 'badge-red' : 'badge-dim'}`}>
                                                {u.result ?? 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
