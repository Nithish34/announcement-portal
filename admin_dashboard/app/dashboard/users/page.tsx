'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGetAllTeams, apiRegister, TeamRow } from '@/lib/api';
import { UserPlus, Mail, Lock, Users, CheckCircle, AlertCircle, Loader2, TriangleAlert } from 'lucide-react';

type Toast = { msg: string; type: 'ok' | 'err' };

export default function CreateUserPage() {
    const [teams, setTeams] = useState<TeamRow[]>([]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [teamId, setTeamId] = useState('');
    const [adminSecret, setAdminSecret] = useState(process.env.NEXT_PUBLIC_ADMIN_SECRET ?? '');
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
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Create User</h1>
                    <p className="page-subtitle">Register a new participant or admin account</p>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type === 'ok' ? 'toast-ok' : 'toast-err'}`}>
                    {toast.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Form — 3/5 width */}
                <div className="lg:col-span-3 card">
                    <div className="card-header">
                        <div className="card-icon"><UserPlus className="w-4 h-4 text-[#a855f7]" /></div>
                        <p className="card-title">New User Details</p>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="label">Email *</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#53389e]" />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                    placeholder="user@eduspine.com"
                                    className="input input-with-icon" />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="label">Password *</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#53389e]" />
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                    placeholder="Minimum 8 characters"
                                    className="input input-with-icon" />
                            </div>
                        </div>

                        {/* Team */}
                        <div>
                            <label className="label">Team *</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#53389e]" />
                                <select value={teamId} onChange={e => setTeamId(e.target.value)} required
                                    className="input input-with-icon appearance-none cursor-pointer">
                                    <option value="">— Select a team —</option>
                                    {teamsLoading
                                        ? <option disabled>Loading teams…</option>
                                        : teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                                    }
                                </select>
                            </div>
                        </div>

                        {/* Admin Secret */}
                        <div>
                            <label className="label">Admin Secret *</label>
                            <input type="password" value={adminSecret} onChange={e => setAdminSecret(e.target.value)} required
                                placeholder="From backend .env ADMIN_SECRET"
                                className="input font-mono" />
                            <p className="text-[9px] text-[#334155] mt-1.5">
                                Pre-filled from <code className="text-[#a855f7]">NEXT_PUBLIC_ADMIN_SECRET</code>. Change if different.
                            </p>
                        </div>

                        {/* Warning */}
                        <div className="warn-banner">
                            <TriangleAlert className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                            <span>
                                Users are created with <strong>PARTICIPANT</strong> role by default.
                                To grant ADMIN access, update the role directly in the database after creation.
                            </span>
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-3">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                            {loading ? 'Creating…' : 'Create User'}
                        </button>
                    </form>
                </div>

                {/* Side Panel — 2/5 width */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Steps */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-icon"><UserPlus className="w-4 h-4 text-[#a855f7]" /></div>
                            <p className="card-title">Admin User Setup</p>
                        </div>
                        <ol className="space-y-3.5">
                            {[
                                'Create a user with this form (choose any existing team)',
                                <>Connect to PostgreSQL and run:<br />
                                    <code className="text-[#a855f7] bg-black/40 px-2 py-1 rounded mt-2 block text-[9px] font-mono leading-relaxed">
                                        UPDATE "User" SET role = 'ADMIN'<br />
                                        WHERE email = 'your@email.com';
                                    </code></>,
                                <>Login on this admin dashboard at <code className="text-[#a855f7]">localhost:3001/login</code></>,
                            ].map((step, i) => (
                                <li key={i} className="flex gap-3 text-xs text-[#64748b] leading-relaxed">
                                    <span className="w-5 h-5 rounded-full bg-[#53389e]/25 text-[#a855f7] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                        {i + 1}
                                    </span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Team list */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-icon"><Users className="w-4 h-4 text-[#a855f7]" /></div>
                            <p className="card-title">Registered Teams ({teams.length})</p>
                        </div>
                        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                            {teamsLoading
                                ? <Loader2 className="w-5 h-5 animate-spin text-[#53389e]" />
                                : teams.map(t => (
                                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                                        <div>
                                            <p className="text-xs font-bold text-white">{t.name}</p>
                                            <p className="text-[9px] text-[#334155] font-mono">{t.id.slice(0, 12)}…</p>
                                        </div>
                                        <span className="badge badge-dim">{t._count?.members ?? 0} members</span>
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
