'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
    Shield, LayoutDashboard, Settings, Trophy, Users,
    Database, LogOut, Zap, Activity, UserPlus, RefreshCw
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/phase-control', label: 'Phase Control', icon: Zap },
    { href: '/dashboard/timers', label: 'Timer Settings', icon: Settings },
    { href: '/dashboard/results', label: 'Results', icon: Trophy },
    { href: '/dashboard/teams', label: 'Teams', icon: Users },
    { href: '/dashboard/overrides', label: 'Overrides', icon: Activity },
    { href: '/dashboard/users', label: 'Create User', icon: UserPlus },
    { href: '/dashboard/config', label: 'Raw Config', icon: Database },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !user) router.replace('/login');
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-[#53389e] border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            {/* ── Sidebar ── */}
            <aside className="w-64 shrink-0 flex flex-col bg-[#0c0c12] border-r border-white/5 sticky top-0 h-screen overflow-y-auto">
                {/* Brand */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#53389e] to-[#a855f7] flex items-center justify-center shadow-[0_0_15px_rgba(83,56,158,0.5)]">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-black tracking-[0.2em] text-white uppercase">Ghost Protocol</p>
                            <p className="text-[9px] text-[#53389e] tracking-widest uppercase font-bold">Admin System</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-150
                  ${active
                                        ? 'bg-[#53389e]/20 text-white border border-[#53389e]/40 shadow-[0_0_15px_rgba(83,56,158,0.2)]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${active ? 'text-[#a855f7]' : 'text-gray-500'}`} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User / Footer */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-[#53389e]/30 flex items-center justify-center text-[#a855f7] text-xs font-black">
                            {user.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{user.email}</p>
                            <p className="text-[9px] text-[#53389e] tracking-widest uppercase font-bold">ADMIN</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); router.push('/login'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all font-bold"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-6xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
