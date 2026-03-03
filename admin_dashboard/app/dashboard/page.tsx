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

interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    glow: string;
}

function StatCard({ label, value, icon: Icon, color, glow }: StatCardProps) {
    return (
        <div className={`relative bg-[#0c0c12] border rounded-2xl p-6 overflow-hidden ${color}`}
            style={{ boxShadow: `0 0 30px ${glow}` }}>
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 ${color.replace('border-', 'bg-')}`} />
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] text-gray-500 font-black tracking-[0.25em] uppercase mb-2">{label}</p>
                    <p className="text-4xl font-black text-white font-mono">{value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${color}`}
                    style={{ background: `${glow}22` }}>
                    <Icon className="w-5 h-5" style={{ color: glow }} />
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
            const [s, cfgRows] = await Promise.all([
                apiGetDashboard(),
                apiGetAllConfig(),
            ]);
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
        return () => {
            socket.off('config:updated');
            socket.off('config:batch-updated');
            socket.disconnect();
        };
    }, [load]);

    const currentPhase = config['current_phase'] ?? '—';
    const regOpen = config['registration_open'] === 'true';
    const resultsLocked = config['results_locked'] === 'true';

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black tracking-[0.1em] uppercase text-white">System Overview</h1>
                    <p className="text-xs text-gray-500 tracking-widest mt-1">
                        {lastUpdated ? `Last refreshed: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
                    </p>
                </div>
                <button
                    onClick={load}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold tracking-wider hover:bg-[#53389e]/20 hover:border-[#53389e]/40 transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Status pills */}
            <div className="flex items-center gap-3 mb-8 flex-wrap">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-widest border ${regOpen ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${regOpen ? 'bg-[#10b981]' : 'bg-red-500'} animate-pulse`} />
                    REGISTRATION {regOpen ? 'OPEN' : 'CLOSED'}
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-widest border ${resultsLocked ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]'}`}>
                    <div className={`w-2 h-2 rounded-full ${resultsLocked ? 'bg-red-500' : 'bg-[#10b981]'} animate-pulse`} />
                    RESULTS {resultsLocked ? 'LOCKED' : 'RELEASED'}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-widest border bg-[#53389e]/10 border-[#53389e]/40 text-[#a855f7]">
                    <Zap className="w-3 h-3" />
                    PHASE {currentPhase} ACTIVE
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Teams" value={stats?.totalTeams ?? '—'} icon={Users} color="border-[#53389e]/30" glow="#53389e" />
                <StatCard label="Total Users" value={stats?.totalUsers ?? '—'} icon={Database} color="border-[#a855f7]/30" glow="#a855f7" />
                <StatCard label="Phase 1 Winners" value={stats?.phase1Winners ?? '—'} icon={Trophy} color="border-[#ffd700]/30" glow="#ffd700" />
                <StatCard label="Phase 2 Winners" value={stats?.phase2Winners ?? '—'} icon={Activity} color="border-[#10b981]/30" glow="#10b981" />
            </div>

            {/* Config Snapshot */}
            <div className="bg-[#0c0c12] border border-white/5 rounded-2xl p-6">
                <h2 className="text-xs font-black tracking-[0.2em] uppercase text-white mb-4">Live Config Snapshot</h2>
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
                        <div key={key} className="bg-black/30 border border-white/5 rounded-xl p-3">
                            <p className="text-[9px] text-gray-500 font-bold tracking-widest uppercase mb-1">{label}</p>
                            <p className="text-sm font-black text-[#a855f7] font-mono">{config[key] ?? '—'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
