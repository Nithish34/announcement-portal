'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGetDashboard, apiGetAllConfig } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Users, Trophy, Database, Activity, RefreshCw, Zap } from 'lucide-react';

interface Stats {
    totalTeams: number;
    totalUsers: number;
    phase1Winners: number;
    phase2Winners: number;
}

function StatCard({ label, value, icon: Icon, color, glow }: {
    label: string; value: number | string; icon: React.ElementType; color: string; glow: string;
}) {
    return (
        <div className="stat-card" style={{ borderColor: `${glow}30`, boxShadow: `0 0 24px ${glow}14` }}>
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-10"
                style={{ background: glow }} />
            <div className="flex items-start justify-between relative">
                <div>
                    <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-2.5" style={{ color: `${glow}99` }}>{label}</p>
                    <p className="text-4xl font-black font-mono text-white">{typeof value === 'number' ? value : '—'}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0"
                    style={{ background: `${glow}18`, borderColor: `${glow}40` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: glow }} />
                </div>
            </div>
        </div>
    );
}

export default function OverviewPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [config, setConfig] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [s, cfgRows] = await Promise.all([apiGetDashboard(), apiGetAllConfig()]);
            setStats(s);
            const map: Record<string, string> = {};
            cfgRows.forEach(r => { map[r.key] = r.value; });
            setConfig(map);
            setLastUpdated(new Date());
        } catch { /* ignore */ }
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
        const socket = getSocket();
        socket.connect();
        socket.on('config:updated', () => load());
        socket.on('config:batch-updated', () => load());
        return () => { socket.off('config:updated'); socket.off('config:batch-updated'); socket.disconnect(); };
    }, [load]);

    const currentPhase = config['current_phase'] ?? '—';
    const regOpen = config['registration_open'] === 'true';
    const resultsLocked = config['results_locked'] === 'true';

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">System Overview</h1>
                    <p className="page-subtitle">
                        {lastUpdated ? `Last refreshed: ${lastUpdated.toLocaleTimeString()}` : 'Loading data…'}
                    </p>
                </div>
                <button onClick={load} disabled={loading} className="btn btn-ghost">
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-2.5 mb-7 flex-wrap">
                <span className={`badge ${regOpen ? 'badge-green' : 'badge-red'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${regOpen ? 'bg-[#10b981]' : 'bg-red-400'} animate-pulse`} />
                    Registration {regOpen ? 'Open' : 'Closed'}
                </span>
                <span className={`badge ${resultsLocked ? 'badge-red' : 'badge-green'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${resultsLocked ? 'bg-red-400' : 'bg-[#10b981]'} animate-pulse`} />
                    Results {resultsLocked ? 'Locked' : 'Released'}
                </span>
                <span className="badge badge-violet">
                    <Zap className="w-2.5 h-2.5 mr-1" />
                    Phase {currentPhase} Active
                </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                <StatCard label="Total Teams" value={stats?.totalTeams ?? '—'} icon={Users} glow="#7c3aed" color="" />
                <StatCard label="Total Users" value={stats?.totalUsers ?? '—'} icon={Database} glow="#a855f7" color="" />
                <StatCard label="Phase 1 Winners" value={stats?.phase1Winners ?? '—'} icon={Trophy} glow="#f59e0b" color="" />
                <StatCard label="Phase 2 Winners" value={stats?.phase2Winners ?? '—'} icon={Activity} glow="#10b981" color="" />
            </div>

            {/* Config Snapshot */}
            <div className="card">
                <div className="card-header">
                    <div className="card-icon"><Database className="w-4 h-4 text-[#a855f7]" /></div>
                    <span className="card-title">Live Config Snapshot</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { key: 'phase1_timer_seconds', label: 'Phase 1 Timer' },
                        { key: 'phase2_timer_seconds', label: 'Phase 2 Timer' },
                        { key: 'max_slots', label: 'Max Slots' },
                        { key: 'announcement_interval', label: 'Announce Interval' },
                        { key: 'phase2_score_threshold', label: 'Score Threshold' },
                        { key: 'current_phase', label: 'Current Phase' },
                        { key: 'registration_open', label: 'Registration' },
                        { key: 'results_locked', label: 'Results Lock' },
                    ].map(({ key, label }) => (
                        <div key={key} className="bg-black/25 border border-white/[0.06] rounded-xl p-3.5">
                            <p className="text-[9px] text-[#475569] font-bold tracking-widest uppercase mb-1.5">{label}</p>
                            <p className="text-sm font-black text-[#a855f7] font-mono">{config[key] ?? '—'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
