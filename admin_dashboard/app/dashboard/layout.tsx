'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
    Shield, LayoutDashboard, Settings, Trophy,
    LogOut, UserPlus, ChevronRight
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/users', label: 'Admin Management', icon: UserPlus },
    { href: '/dashboard/participants', label: 'Participants', icon: UserPlus },
    { href: '/dashboard/results', label: 'Evaluation', icon: Trophy },
    { href: '/dashboard/timers', label: 'Settings', icon: Settings },
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
            <div className="min-h-screen flex items-center justify-center bg-[#050508]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#53389e] to-[#a855f7] flex items-center justify-center shadow-[0_0_30px_rgba(83,56,158,0.5)]">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-[#53389e] border-t-transparent animate-spin" />
                </div>
            </div>
        );
    }

    const avatarLetter = user.email[0].toUpperCase();

    return (
        <div className="flex min-h-screen bg-[#050508]">
            {/* ── Sidebar ───────────────────────────────────────── */}
            <aside className="w-60 shrink-0 flex flex-col bg-[#0a0a0f] border-r border-white/[0.06] sticky top-0 h-screen overflow-y-auto">

                {/* Brand */}
                <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#53389e] to-[#a855f7] flex items-center justify-center shadow-[0_0_18px_rgba(83,56,158,0.45)] shrink-0">
                            <Shield className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-black tracking-[0.18em] text-white uppercase leading-tight">Ghost Protocol</p>
                            <p className="text-[9px] text-[#7c3aed] tracking-widest uppercase font-bold mt-0.5">Admin System</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    <div className="space-y-0.5">
                        {navItems.map(({ href, label, icon: Icon }) => {
                            const active = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`
                                        flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[0.8rem] font-semibold
                                        tracking-wide transition-all duration-150 group relative
                                        ${active
                                            ? 'bg-[#53389e]/20 text-white border border-[#53389e]/30'
                                            : 'text-[#64748b] hover:text-[#cbd5e1] hover:bg-white/[0.04] border border-transparent'
                                        }
                                    `}
                                >
                                    {active && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#a855f7] rounded-full" />
                                    )}
                                    <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${active ? 'text-[#a855f7]' : 'text-[#475569] group-hover:text-[#7c3aed]'}`} strokeWidth={2} />
                                    <span className="flex-1">{label}</span>
                                    {active && <ChevronRight className="w-3 h-3 text-[#53389e] ml-auto" />}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User / Footer */}
                <div className="px-3 py-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#53389e]/60 to-[#a855f7]/40 flex items-center justify-center text-white text-xs font-black shrink-0">
                            {avatarLetter}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-[#e2e8f0] truncate">{user.email}</p>
                            <p className="text-[9px] text-[#7c3aed] tracking-widest uppercase font-bold">Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); router.push('/login'); }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[0.75rem] font-semibold text-[#64748b] hover:text-red-400 hover:bg-red-500/8 transition-all"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main ──────────────────────────────────────────── */}
            <main className="flex-1 overflow-auto">
                {/* Top bar */}
                <div className="sticky top-0 z-10 bg-[#050508]/80 backdrop-blur-md border-b border-white/[0.05] px-8 py-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse-glow" />
                    <span className="text-[10px] text-[#475569] font-bold tracking-widest uppercase">Ghost Protocol — Admin</span>
                </div>
                <div className="p-8 max-w-7xl mx-auto animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
