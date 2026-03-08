'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiGetDashboard, apiGetAllConfig } from '@/lib/api';
import {
    Users, Trophy, User, RefreshCw, UserPlus, Settings, ChevronRight
} from 'lucide-react';

interface Stats {
    totalTeams: number;
    totalUsers: number;
    phase1Winners: number;
    phase2Winners: number;
}

function StatCard({ label, value, icon: Icon, glow, sub }: {
    label: string; value: number | string; icon: React.ElementType; glow: string; sub?: string;
}) {
    return (
        <div className="stat-card" style={{ borderColor: `${glow}30`, boxShadow: `0 0 24px ${glow}14` }}>
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-10"
                style={{ background: glow }} />
            <div className="flex items-start justify-between relative">
                <div>
                    <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-2.5" style={{ color: `${glow}99` }}>{label}</p>
                    <p className="text-4xl font-black font-mono text-white">{typeof value === 'number' ? value : '—'}</p>
                    {sub && <p className="text-[10px] text-[#334155] mt-1.5">{sub}</p>}
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0"
                    style={{ background: `${glow}18`, borderColor: `${glow}40` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: glow }} />
                </div>
            </div>
        </div>
    );
}

const quickLinks = [
    { href: '/dashboard/users', label: 'Admin Management', desc: 'Add or remove admin accounts', icon: UserPlus, glow: '#6366f1' },
    { href: '/dashboard/results', label: 'Evaluation', desc: 'Select winners for Eval 1 & 2', icon: Trophy, glow: '#f59e0b' },
    { href: '/dashboard/timers', label: 'Settings', desc: 'Set timers and max slot counts', icon: Settings, glow: '#06b6d4' },
] as const;

export default function OverviewPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [config, setConfig] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const router = useRouter();

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

    useEffect(() => { load(); }, [load]);

    const maxSlotsEval1 = config['max_slots'] ?? '—';
    const maxSlotsEval2 = config['max_slots_eval2'] ?? '—';

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">System Overview</h1>
                    <p className="page-subtitle">
                        {lastUpdated ? `Last refreshed: ${lastUpdated.toLocaleTimeString()}` : 'Loading…'}
                    </p>
                </div>
                <button onClick={load} disabled={loading} className="btn btn-ghost">
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                <StatCard label="Total Teams" value={stats?.totalTeams ?? '—'} icon={Users} glow="#7c3aed" />
                <StatCard label="Participants" value={stats?.totalUsers ?? '—'} icon={User} glow="#a855f7" />
                <StatCard
                    label="Eval 1 Selections"
                    value={stats?.phase1Winners ?? '—'}
                    icon={Trophy}
                    glow="#f59e0b"
                    sub={`Max slots: ${maxSlotsEval1}`}
                />
                <StatCard
                    label="Eval 2 Selections"
                    value={stats?.phase2Winners ?? '—'}
                    icon={Trophy}
                    glow="#10b981"
                    sub={`Max slots: ${maxSlotsEval2}`}
                />
            </div>

            {/* Quick Access */}
            <div>
                <p className="text-[9px] font-black tracking-[0.22em] text-[#334155] uppercase mb-3">Quick Access</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {quickLinks.map(({ href, label, desc, icon: Icon, glow }) => (
                        <button
                            key={href}
                            onClick={() => router.push(href)}
                            className="group text-left p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-150 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity"
                                style={{ background: glow }} />
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center border shrink-0"
                                    style={{ background: `${glow}18`, borderColor: `${glow}35` }}>
                                    <Icon className="w-4 h-4" style={{ color: glow }} strokeWidth={2} />
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-[#334155] group-hover:text-[#64748b] transition-colors mt-0.5" />
                            </div>
                            <p className="text-[0.78rem] font-bold text-[#e2e8f0] tracking-wide mb-1">{label}</p>
                            <p className="text-[10px] text-[#475569] leading-relaxed">{desc}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
