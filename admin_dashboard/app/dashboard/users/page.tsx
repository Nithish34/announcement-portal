'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGetAllTeams, apiRegister, TeamRow } from '@/lib/api';
import { UserPlus, Mail, Lock, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type Toast = { msg: string; type: 'ok' | 'err' };

export default function CreateUserPage() {
    const [teams, setTeams] = useState<TeamRow[]>([]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [teamId, setTeamId] = useState('');
    const [adminSecret, setAdminSecret] = useState(
        process.env.NEXT_PUBLIC_ADMIN_SECRET ?? ''
    );
    const [loading, setLoading] = useState(false);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [toast, setToast] = useState<Toast | null>(null);

    const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const loadTeams = useCallback(async () => {
        try { setTeams(await apiGetAllTeams()); }
        catch { /* ignore */ }
        setTeamsLoading(false);
    }, []);

    useEffect(() => { loadTeams(); }, [loadTeams]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !teamId || !adminSecret) return;

        setLoading(true);
        try {
            await apiRegister({ email, password, teamId, adminSecret });
            notify(`✓ User "${email}" created successfully`);
            setEmail(''); setPassword(''); setTeamId('');
        } catch (err: unknown) {
            notify((err as Error).message ?? 'Failed to create user', 'err');
        }
        setLoading(false);
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-black tracking-[0.1em] uppercase text-white">Create User</h1>
                <p className="text-xs text-gray-500 tracking-widest mt-1">
                    Register a new participant or admin account. Requires the ADMIN_SECRET from the backend .env file.
                </p>
            </div>

            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold shadow-2xl
          ${toast.type === 'ok' ? 'bg-[#0c0c12] border-[#10b981]/50 text-[#10b981]' : 'bg-[#0c0c12] border-red-500/50 text-red-400'}`}>
                    {toast.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <div className="bg-[#0c0c12] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-[#53389e]/20 border border-[#53389e]/30 flex items-center justify-center">
                            <UserPlus className="w-4 h-4 text-[#a855f7]" />
                        </div>
                        <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white">New User Details</h2>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1.5">Email *</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#53389e]" />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                    placeholder="user@eduspine.com"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#53389e] transition-colors" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1.5">Password *</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#53389e]" />
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                    placeholder="Minimum 8 characters"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#53389e] transition-colors" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1.5">Team *</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#53389e]" />
                                <select value={teamId} onChange={e => setTeamId(e.target.value)} required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#53389e] transition-colors appearance-none cursor-pointer">
                                    <option value="">— Select a team —</option>
                                    {teamsLoading
                                        ? <option disabled>Loading teams…</option>
                                        : teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                                    }
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1.5">Admin Secret *</label>
                            <input type="password" value={adminSecret} onChange={e => setAdminSecret(e.target.value)} required
                                placeholder="From backend .env ADMIN_SECRET"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-[#53389e] transition-colors" />
                            <p className="text-[9px] text-gray-600 mt-1">
                                Pre-filled from <code className="text-[#a855f7]">NEXT_PUBLIC_ADMIN_SECRET</code>. Change if different.
                            </p>
                        </div>

                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-[10px] text-amber-400 tracking-wide">
                            ⚠️ Users are created with <strong>PARTICIPANT</strong> role by default. To grant ADMIN access, update the role directly in the database after creation.
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#53389e] to-[#a855f7] text-white font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(83,56,158,0.4)] hover:scale-[1.01] transition-all disabled:opacity-60">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                            {loading ? 'Creating…' : 'Create User'}
                        </button>
                    </form>
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                    <div className="bg-[#0c0c12] border border-white/5 rounded-2xl p-6">
                        <h3 className="text-xs font-black tracking-[0.2em] uppercase text-white mb-4">Admin User Setup</h3>
                        <ol className="space-y-3 text-xs text-gray-400">
                            <li className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-[#53389e]/30 text-[#a855f7] text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                                <span>Create a user with this form (choose any existing team)</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-[#53389e]/30 text-[#a855f7] text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                                <span>Connect to PostgreSQL and run:<br />
                                    <code className="text-[#a855f7] bg-black/40 px-2 py-1 rounded mt-1 block text-[9px] font-mono">
                                        UPDATE &quot;User&quot; SET role = &apos;ADMIN&apos; WHERE email = &apos;your@email.com&apos;;
                                    </code>
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-[#53389e]/30 text-[#a855f7] text-[10px] font-black flex items-center justify-center shrink-0">3</span>
                                <span>Login with that email on this admin dashboard — at <code className="text-[#a855f7]">localhost:3001/login</code></span>
                            </li>
                        </ol>
                    </div>

                    <div className="bg-[#0c0c12] border border-white/5 rounded-2xl p-6">
                        <h3 className="text-xs font-black tracking-[0.2em] uppercase text-white mb-4">Registered Teams ({teams.length})</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {teamsLoading
                                ? <Loader2 className="w-5 h-5 animate-spin text-[#53389e]" />
                                : teams.map(t => (
                                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-white/5">
                                        <div>
                                            <p className="text-xs font-bold text-white">{t.name}</p>
                                            <p className="text-[9px] text-gray-600 font-mono">{t.id.slice(0, 12)}…</p>
                                        </div>
                                        <span className="text-[9px] text-gray-500">{t._count?.members ?? 0} members</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
