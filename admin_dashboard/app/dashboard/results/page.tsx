'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGetPhase1Results, apiGetPhase2Results, apiEvaluatePhase1, apiEvaluatePhase2 } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Trophy, Users, User, CheckCircle, AlertCircle, Loader2, Play, RefreshCw } from 'lucide-react';

type Toast = { msg: string; type: 'ok' | 'err' };
type Phase = '1' | '2';

interface Phase1Team {
    id: string;
    name: string;
    memberCount: number;
    result: 'WINNER' | 'LOSER';
    phase1Pass: boolean;
    resultOverride: string | null;
}

interface Phase2User {
    id: string;
    email: string;
    role: string;
    result: 'WINNER' | 'LOSER' | null;
    team: { name: string };
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
        const results = phase2Data
            .filter(u => u.result !== null)
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black tracking-[0.1em] uppercase text-white">Results Management</h1>
                    <p className="text-xs text-gray-500 tracking-widest mt-1">View and publish evaluation results</p>
                </div>
                <button onClick={load} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-[#53389e]/20 transition-all disabled:opacity-50">
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold shadow-2xl
          ${toast.type === 'ok' ? 'bg-[#0c0c12] border-[#10b981]/50 text-[#10b981]' : 'bg-[#0c0c12] border-red-500/50 text-red-400'}`}>
                    {toast.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* Phase Tabs */}
            <div className="flex gap-2 mb-6">
                {(['1', '2'] as Phase[]).map(p => (
                    <button key={p} onClick={() => setPhase(p)}
                        className={`px-5 py-2.5 rounded-xl font-black text-sm tracking-widest uppercase transition-all
              ${phase === p ? 'bg-[#53389e] text-white shadow-[0_0_15px_rgba(83,56,158,0.4)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}>
                        Phase {p}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-[#53389e]" /></div>
            ) : phase === '1' ? (
                <>
                    {/* Phase 1 Summary */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="bg-[#0c0c12] border border-[#10b981]/20 rounded-xl p-4 flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-[#ffd700]" />
                            <div>
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Winners</p>
                                <p className="text-3xl font-black text-[#10b981]">{winners1.length}</p>
                            </div>
                        </div>
                        <div className="bg-[#0c0c12] border border-white/5 rounded-xl p-4 flex items-center gap-3">
                            <Users className="w-8 h-8 text-[#53389e]" />
                            <div>
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Total Teams</p>
                                <p className="text-3xl font-black text-white">{phase1Data.length}</p>
                            </div>
                        </div>
                    </div>

                    <button onClick={evaluatePhase1} disabled={evaluating || phase1Data.length === 0}
                        className="flex items-center gap-2 px-6 py-3 mb-5 rounded-xl bg-gradient-to-r from-[#53389e] to-[#a855f7] text-white font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(83,56,158,0.4)] hover:scale-[1.02] transition-all disabled:opacity-60">
                        {evaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        {evaluating ? 'Publishing…' : 'Publish Phase 1 Results'}
                    </button>

                    <div className="bg-[#0c0c12] border border-white/5 rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    {['Team', 'Members', 'Phase 1', 'Override', 'Result'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-[9px] text-gray-500 font-black tracking-widest uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {phase1Data.map(team => (
                                    <tr key={team.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                                        <td className="px-4 py-3 font-black text-white">{team.name}</td>
                                        <td className="px-4 py-3 text-gray-400 font-mono">{team.memberCount}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border
                        ${team.phase1Pass ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                                {team.phase1Pass ? 'PASSED' : 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs font-mono text-[#ffd700]">
                                            {team.resultOverride ?? <span className="text-gray-600">AUTO</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase
                        ${team.result === 'WINNER' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-red-500/20 text-red-400'}`}>
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
                    {/* Phase 2 Summary */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="bg-[#0c0c12] border border-[#10b981]/20 rounded-xl p-4 flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-[#ffd700]" />
                            <div>
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Top Performers</p>
                                <p className="text-3xl font-black text-[#10b981]">{winners2.length}</p>
                            </div>
                        </div>
                        <div className="bg-[#0c0c12] border border-white/5 rounded-xl p-4 flex items-center gap-3">
                            <User className="w-8 h-8 text-[#53389e]" />
                            <div>
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Total Users</p>
                                <p className="text-3xl font-black text-white">{phase2Data.length}</p>
                            </div>
                        </div>
                    </div>

                    <button onClick={evaluatePhase2} disabled={evaluating || phase2Data.length === 0}
                        className="flex items-center gap-2 px-6 py-3 mb-5 rounded-xl bg-gradient-to-r from-[#53389e] to-[#a855f7] text-white font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(83,56,158,0.4)] hover:scale-[1.02] transition-all disabled:opacity-60">
                        {evaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        {evaluating ? 'Publishing…' : 'Publish Phase 2 Results'}
                    </button>

                    <div className="bg-[#0c0c12] border border-white/5 rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    {['Email', 'Team', 'Role', 'Result'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-[9px] text-gray-500 font-black tracking-widest uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {phase2Data.map(u => (
                                    <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                                        <td className="px-4 py-3 text-white text-xs">{u.email}</td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{u.team.name}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-[#53389e]/20 text-[#a855f7] border border-[#53389e]/30">{u.role}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase
                        ${u.result === 'WINNER' ? 'bg-[#10b981]/20 text-[#10b981]' : u.result === 'LOSER' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-500'}`}>
                                                {u.result ?? 'PENDING'}
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
