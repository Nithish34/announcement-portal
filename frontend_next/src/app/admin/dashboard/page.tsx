"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Shield, Clock, Trophy, Lock, Unlock,
    Users, Database, Zap, ChevronRight, Save, AlertCircle,
    ToggleLeft, ToggleRight, RefreshCw
} from 'lucide-react';
import {
    getAllConfig,
    updateConfig,
    batchUpdateConfig,
    getAllTeams,
    setTeamOverride,
    clearTeamOverride,
} from '@/lib/api';
import { socket } from '@/lib/socket';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ConfigRow { key: string; value: string; updatedAt: string; }

interface TeamRow {
    id: string;
    name: string;
    _count: { members: number };
    phase1Pass: boolean;
    resultOverride: 'WINNER' | 'LOSER' | null;
}

type OverrideOption = 'auto' | 'WINNER' | 'LOSER';

// ─── Notification banner ──────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border text-sm font-bold tracking-wide
        ${type === 'ok'
                    ? 'bg-[#0f0f13] border-[#10b981]/60 text-[#10b981]'
                    : 'bg-[#0f0f13] border-red-500/60 text-red-400'}`}
        >
            {type === 'ok' ? <Zap className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {msg}
        </motion.div>
    );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-[#0c0c12]/80 backdrop-blur border border-white/5 rounded-2xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-[#53389e]/20 border border-[#53389e]/30 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#a855f7]" />
                </div>
                <h2 className="text-[13px] font-black tracking-[0.2em] uppercase text-white">{title}</h2>
            </div>
            {children}
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // ── Toast ──────────────────────────────────────────────────────────────────
    const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
    const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // ── Config state ───────────────────────────────────────────────────────────
    const [config, setConfig] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    // ── Teams state ────────────────────────────────────────────────────────────
    const [teams, setTeams] = useState<TeamRow[]>([]);
    const [teamsLoading, setTeamsLoading] = useState(true);

    // ── Local form values ──────────────────────────────────────────────────────
    const [phase1Timer, setPhase1Timer] = useState('10');
    const [phase2Timer, setPhase2Timer] = useState('5');
    const [announceInterval, setAnnounceInterval] = useState('30');
    const [maxSlots, setMaxSlots] = useState('20');
    const [scoreThreshold, setScoreThreshold] = useState('95');

    useEffect(() => {
        if (isLoading) return;                              // wait for session restore
        if (user === null) { router.replace('/login'); return; }
        if (user.role !== 'ADMIN') { router.replace('/login'); return; }
    }, [user, isLoading, router]);

    // ─── Load config ───────────────────────────────────────────────────────────
    const loadConfig = useCallback(async () => {
        try {
            const rows: ConfigRow[] = await getAllConfig();
            const map: Record<string, string> = {};
            rows.forEach(r => { map[r.key] = r.value; });
            setConfig(map);

            setPhase1Timer(map['phase1_timer_seconds'] ?? '10');
            setPhase2Timer(map['phase2_timer_seconds'] ?? '5');
            setAnnounceInterval(map['announcement_interval'] ?? '30');
            setMaxSlots(map['max_slots'] ?? '20');
            setScoreThreshold(map['phase2_score_threshold'] ?? '95');
        } catch {
            notify('Failed to load config', 'err');
        } finally {
            setLoading(false);
        }
    }, [notify]);

    // ─── Load teams ────────────────────────────────────────────────────────────
    const loadTeams = useCallback(async () => {
        try {
            const data: TeamRow[] = await getAllTeams();
            setTeams(data);
        } catch {
            notify('Failed to load teams', 'err');
        } finally {
            setTeamsLoading(false);
        }
    }, [notify]);

    useEffect(() => {
        loadConfig();
        loadTeams();

        socket.connect();

        // Real-time sync when another admin changes config
        socket.on('config:updated', ({ key, value }: { key: string; value: string }) => {
            setConfig(prev => ({ ...prev, [key]: value }));
        });

        socket.on('config:batch-updated', ({ updates }: { updates: { key: string; value: string }[] }) => {
            setConfig(prev => {
                const next = { ...prev };
                updates.forEach(u => { next[u.key] = u.value; });
                return next;
            });
        });

        socket.on('team:override-updated', (team: TeamRow) => {
            setTeams(prev => prev.map(t => t.id === team.id ? { ...t, resultOverride: team.resultOverride } : t));
        });

        return () => {
            socket.off('config:updated');
            socket.off('config:batch-updated');
            socket.off('team:override-updated');
            socket.disconnect();
        };
    }, [loadConfig, loadTeams]);

    // ─── Helpers ───────────────────────────────────────────────────────────────
    const patchConfig = async (key: string, value: string) => {
        try {
            await updateConfig(key, value);
            setConfig(prev => ({ ...prev, [key]: value }));
            notify(`${key} updated`);
        } catch {
            notify(`Failed to update ${key}`, 'err');
        }
    };

    // ─── Phase Control ────────────────────────────────────────────────────────
    const currentPhase = Number(config['current_phase'] ?? 1);
    const isRegOpen = config['registration_open'] === 'true';

    const setPhase = async (p: number) => patchConfig('current_phase', String(p));
    const toggleReg = async () => patchConfig('registration_open', isRegOpen ? 'false' : 'true');

    // ─── Results Control ──────────────────────────────────────────────────────
    const isLocked = config['results_locked'] === 'true';
    const lockResults = () => patchConfig('results_locked', 'true');
    const releaseResults = () => patchConfig('results_locked', 'false');

    // ─── Timer Save ───────────────────────────────────────────────────────────
    const saveTimers = async () => {
        try {
            await batchUpdateConfig([
                { key: 'phase1_timer_seconds', value: phase1Timer },
                { key: 'phase2_timer_seconds', value: phase2Timer },
                { key: 'announcement_interval', value: announceInterval },
            ]);
            notify('Timer settings saved');
        } catch {
            notify('Failed to save timers', 'err');
        }
    };

    // ─── Winner Settings Save ─────────────────────────────────────────────────
    const saveWinnerSettings = async () => {
        try {
            await batchUpdateConfig([
                { key: 'max_slots', value: maxSlots },
                { key: 'phase2_score_threshold', value: scoreThreshold },
            ]);
            notify('Winner settings saved');
        } catch {
            notify('Failed to save winner settings', 'err');
        }
    };

    // ─── Override handler ─────────────────────────────────────────────────────
    const handleOverrideChange = async (teamId: string, value: OverrideOption) => {
        try {
            if (value === 'auto') {
                await clearTeamOverride(teamId);
                notify('Override cleared');
            } else {
                await setTeamOverride(teamId, value);
                notify(`Override set to ${value}`);
            }
            await loadTeams();
        } catch {
            notify('Failed to update override', 'err');
        }
    };

    // ─── Render access guard ──────────────────────────────────────────────────
    if (!user || user.role !== 'ADMIN') return null;

    return (
        <div className="min-h-screen bg-[#050508] text-white">
            {/* ── Subtle grid background ── */}
            <div className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(83,56,158,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(83,56,158,0.05) 0%, transparent 60%)',
                }}
            />

            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-[#050508]/90 backdrop-blur border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#53389e] to-[#a855f7] flex items-center justify-center shadow-[0_0_20px_rgba(83,56,158,0.6)]">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black tracking-[0.3em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-[#a855f7]">
                                Ghost Protocol
                            </h1>
                            <p className="text-[10px] text-[#53389e] tracking-[0.2em] uppercase font-semibold">Admin Control System</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            id="admin-refresh-btn"
                            onClick={() => { loadConfig(); loadTeams(); }}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold tracking-wider transition-all"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <div className="px-3 py-1.5 rounded-lg bg-[#53389e]/20 border border-[#53389e]/40 text-[10px] text-[#a855f7] font-black tracking-widest uppercase">
                            ADMIN
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Toast ── */}
            <AnimatePresence>
                {toast && <Toast msg={toast.msg} type={toast.type} />}
            </AnimatePresence>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-10 h-10 rounded-full border-2 border-[#53389e] border-t-transparent"
                        />
                    </div>
                ) : (
                    <>
                        {/* ══ 1. Phase Control ══════════════════════════════════════════════════════ */}
                        <Section title="Phase Control" icon={Zap}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Current Phase */}
                                <div>
                                    <p className="text-[11px] text-gray-400 font-bold tracking-widest uppercase mb-3">Current Phase</p>
                                    <div className="flex gap-2">
                                        {[1, 2, 3].map(p => (
                                            <button
                                                key={p}
                                                id={`phase-btn-${p}`}
                                                onClick={() => setPhase(p)}
                                                className={`flex-1 py-3 rounded-xl font-black text-sm tracking-widest uppercase transition-all duration-200
                          ${currentPhase === p
                                                        ? 'bg-gradient-to-br from-[#53389e] to-[#a855f7] text-white shadow-[0_0_20px_rgba(83,56,158,0.5)] scale-[1.02]'
                                                        : 'bg-white/5 border border-white/10 text-gray-400 hover:border-[#53389e]/40 hover:text-white'}`}
                                            >
                                                Phase {p}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-[#53389e] mt-2 tracking-wider">
                                        Active: <span className="text-white font-black">Phase {currentPhase}</span>
                                    </p>
                                </div>

                                {/* Registration Toggle */}
                                <div>
                                    <p className="text-[11px] text-gray-400 font-bold tracking-widest uppercase mb-3">Registration</p>
                                    <button
                                        id="reg-toggle-btn"
                                        onClick={toggleReg}
                                        className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border font-bold text-sm tracking-wider transition-all duration-200
                      ${isRegOpen
                                                ? 'bg-[#10b981]/10 border-[#10b981]/50 text-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                                : 'bg-red-500/10 border-red-500/40 text-red-400'}`}
                                    >
                                        <span>{isRegOpen ? 'Registration OPEN' : 'Registration CLOSED'}</span>
                                        {isRegOpen
                                            ? <ToggleRight className="w-6 h-6" />
                                            : <ToggleLeft className="w-6 h-6" />}
                                    </button>
                                </div>
                            </div>
                        </Section>

                        {/* ══ 2. Timer Settings ════════════════════════════════════════════════════ */}
                        <Section title="Timer Settings" icon={Clock}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                {[
                                    { label: 'Phase 1 Countdown (s)', val: phase1Timer, set: setPhase1Timer, id: 'phase1-timer-input' },
                                    { label: 'Phase 2 Countdown (s)', val: phase2Timer, set: setPhase2Timer, id: 'phase2-timer-input' },
                                    { label: 'Winner Reveal Interval (s)', val: announceInterval, set: setAnnounceInterval, id: 'announce-interval-input' },
                                ].map(({ label, val, set, id }) => (
                                    <div key={id}>
                                        <label className="block text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-2">{label}</label>
                                        <input
                                            id={id}
                                            type="number"
                                            min="1"
                                            value={val}
                                            onChange={e => set(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#53389e] transition-colors"
                                        />
                                    </div>
                                ))}
                            </div>
                            <button
                                id="save-timers-btn"
                                onClick={saveTimers}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#53389e] to-[#a855f7] text-white font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(83,56,158,0.4)] hover:scale-[1.02] transition-transform"
                            >
                                <Save className="w-4 h-4" /> Save Timer Settings
                            </button>
                        </Section>

                        {/* ══ 3. Winner Settings ───────────────────────────────────────────────── */}
                        <Section title="Winner Settings" icon={Trophy}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                {[
                                    { label: 'Max Slots (Phase 1)', val: maxSlots, set: setMaxSlots, id: 'max-slots-input' },
                                    { label: 'Phase 2 Score Threshold', val: scoreThreshold, set: setScoreThreshold, id: 'score-threshold-input' },
                                ].map(({ label, val, set, id }) => (
                                    <div key={id}>
                                        <label className="block text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-2">{label}</label>
                                        <input
                                            id={id}
                                            type="number"
                                            min="1"
                                            value={val}
                                            onChange={e => set(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#53389e] transition-colors"
                                        />
                                    </div>
                                ))}
                            </div>
                            <button
                                id="save-winner-settings-btn"
                                onClick={saveWinnerSettings}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#53389e] to-[#a855f7] text-white font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(83,56,158,0.4)] hover:scale-[1.02] transition-transform"
                            >
                                <Save className="w-4 h-4" /> Save Winner Settings
                            </button>
                        </Section>

                        {/* ══ 4. Results Control ─────────────────────────────────────────────────── */}
                        <Section title="Results Control" icon={Database}>
                            <div className="mb-4 flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_currentColor] ${isLocked ? 'bg-red-500 text-red-500' : 'bg-[#10b981] text-[#10b981]'}`} />
                                <p className="text-sm font-bold tracking-wider">
                                    Results are currently{' '}
                                    <span className={isLocked ? 'text-red-400' : 'text-[#10b981]'}>
                                        {isLocked ? 'LOCKED' : 'RELEASED'}
                                    </span>
                                </p>
                            </div>

                            <div className="flex gap-4 flex-wrap">
                                <button
                                    id="lock-results-btn"
                                    onClick={lockResults}
                                    disabled={isLocked}
                                    className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-all
                    ${isLocked
                                            ? 'bg-red-500/20 border-2 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                                            : 'bg-white/5 border border-white/10 text-gray-400 hover:border-red-500/40'}`}
                                >
                                    <Lock className="w-4 h-4" />
                                    Lock Results
                                </button>
                                <button
                                    id="release-results-btn"
                                    onClick={releaseResults}
                                    disabled={!isLocked}
                                    className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-all
                    ${!isLocked
                                            ? 'bg-[#10b981]/20 border-2 border-[#10b981] text-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                            : 'bg-white/5 border border-white/10 text-gray-400 hover:border-[#10b981]/40'}`}
                                >
                                    <Unlock className="w-4 h-4" />
                                    Release Results
                                </button>
                            </div>
                        </Section>

                        {/* ══ 5. Winner Override Table ────────────────────────────────────────────── */}
                        <Section title="Winner Override" icon={Settings}>
                            {teamsLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="w-8 h-8 rounded-full border-2 border-[#53389e] border-t-transparent"
                                    />
                                </div>
                            ) : teams.length === 0 ? (
                                <p className="text-gray-500 text-sm">No teams found.</p>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-white/5">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                                {['Team ID', 'Name', 'Members', 'Phase 1', 'Override'].map(h => (
                                                    <th key={h} className="text-left px-4 py-3 text-[10px] text-gray-500 font-black tracking-widest uppercase">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teams.map((team, i) => {
                                                const override: OverrideOption = team.resultOverride ?? 'auto';
                                                return (
                                                    <tr
                                                        key={team.id}
                                                        className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}`}
                                                    >
                                                        <td className="px-4 py-3 font-mono text-[10px] text-gray-500 tracking-wider">{team.id.slice(0, 8)}…</td>
                                                        <td className="px-4 py-3 font-black text-white tracking-wider">{team.name}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="flex items-center gap-1.5 text-gray-300 font-mono text-xs">
                                                                <Users className="w-3.5 h-3.5 text-[#53389e]" />
                                                                {team._count?.members ?? 0}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border
                                ${team.phase1Pass
                                                                    ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]'
                                                                    : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                                                {team.phase1Pass ? 'PASSED' : 'PENDING'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {/* Override dropdown with gold border for active overrides */}
                                                            <select
                                                                id={`override-select-${team.id}`}
                                                                value={override}
                                                                onChange={e => handleOverrideChange(team.id, e.target.value as OverrideOption)}
                                                                className={`px-3 py-2 rounded-lg text-xs font-bold tracking-wider bg-black/60 border focus:outline-none cursor-pointer transition-colors
                                  ${override !== 'auto'
                                                                        ? 'border-[#ffd700]/60 text-[#ffd700] shadow-[0_0_12px_rgba(255,215,0,0.2)]'
                                                                        : 'border-white/10 text-gray-300 hover:border-[#53389e]/40'}`}
                                                            >
                                                                <option value="auto">Auto (slot logic)</option>
                                                                <option value="WINNER">Force Winner</option>
                                                                <option value="LOSER">Force Loser</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Section>

                        {/* ══ 6. Raw Config Viewer ─────────────────────────────────────────────── */}
                        <Section title="Raw Config" icon={Database}>
                            <div className="overflow-x-auto rounded-xl border border-white/5">
                                <table className="w-full text-xs font-mono">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="text-left px-4 py-2 text-[10px] text-gray-500 font-black tracking-widest uppercase">Key</th>
                                            <th className="text-left px-4 py-2 text-[10px] text-gray-500 font-black tracking-widest uppercase">Value</th>
                                            <th className="text-left px-4 py-2 text-[10px] text-gray-500 font-black tracking-widest uppercase">Last Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(config).map(([key, value]) => (
                                            <tr key={key} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                                <td className="px-4 py-2.5 text-[#a855f7] tracking-wider">{key}</td>
                                                <td className="px-4 py-2.5 text-white">{value}</td>
                                                <td className="px-4 py-2.5 text-gray-500 text-[10px]">
                                                    <ChevronRight className="w-3 h-3 inline mr-1" />
                                                    live
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Section>
                    </>
                )}
            </main>
        </div>
    );
}
