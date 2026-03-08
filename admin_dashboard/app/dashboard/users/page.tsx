'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiListAdmins, apiAddAdmin, apiRemoveAdmin, AdminRow } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
    Shield, Mail, Lock, User, Plus, Trash2,
    CheckCircle, AlertCircle, Loader2, TriangleAlert, X
} from 'lucide-react';

type Toast = { msg: string; type: 'ok' | 'err' };

export default function UserManagementPage() {
    const { user: self } = useAuth();
    const [admins, setAdmins] = useState<AdminRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);
    const [showForm, setShowForm] = useState(false);

    // New admin form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [creating, setCreating] = useState(false);

    const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const load = useCallback(async () => {
        setLoading(true);
        try { setAdmins(await apiListAdmins()); }
        catch { notify('Failed to load admins', 'err'); }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        setCreating(true);
        try {
            await apiAddAdmin({ email, password, name: name || undefined });
            notify(`✓ Admin "${email}" added`);
            setEmail(''); setPassword(''); setName(''); setShowForm(false);
            load();
        } catch (err: unknown) {
            notify((err as Error).message ?? 'Failed to add admin', 'err');
        }
        setCreating(false);
    };

    const handleRemove = async (admin: AdminRow) => {
        if (!confirm(`Remove admin "${admin.email}"? This cannot be undone.`)) return;
        setRemoving(admin.id);
        try {
            await apiRemoveAdmin(admin.id);
            notify(`✓ Admin "${admin.email}" removed`);
            load();
        } catch (err: unknown) {
            notify((err as Error).message ?? 'Failed to remove admin', 'err');
        }
        setRemoving(null);
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">
                        Admin accounts are stored in a separate database — participants never see or share this data
                    </p>
                </div>
                <button onClick={() => setShowForm(v => !v)} className="btn btn-primary">
                    {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {showForm ? 'Cancel' : 'Add Admin'}
                </button>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type === 'ok' ? 'toast-ok' : 'toast-err'}`}>
                    {toast.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* Info banner */}
            <div className="warn-banner mb-5" style={{ background: 'rgba(83,56,158,0.06)', borderColor: 'rgba(83,56,158,0.25)', color: 'rgba(168,85,247,0.85)' }}>
                <Shield className="w-4 h-4 text-[#a855f7] shrink-0 mt-0.5" />
                <p>
                    Admin accounts live in a <strong>dedicated Admin table</strong> — completely separate from the participant{' '}
                    <code className="text-[#a855f7]">User</code> table. Admins are never included in hackathon results or evaluation pages.
                    Only existing admins can add or remove other admins.
                </p>
            </div>

            {/* Add Admin Form */}
            {showForm && (
                <div className="card mb-6 border-[#53389e]/25">
                    <div className="card-header">
                        <div className="card-icon"><Plus className="w-4 h-4 text-[#a855f7]" /></div>
                        <p className="card-title">Add New Admin</p>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Name */}
                            <div>
                                <label className="label">Display Name <span className="normal-case font-normal text-[#334155]">(optional)</span></label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#53389e]" />
                                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                                        placeholder="e.g. Nithish" className="input input-with-icon" />
                                </div>
                            </div>
                            {/* Email */}
                            <div>
                                <label className="label">Email *</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#53389e]" />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                        placeholder="admin@eduspine.com" className="input input-with-icon" />
                                </div>
                            </div>
                            {/* Password */}
                            <div>
                                <label className="label">Password *</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#53389e]" />
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                        placeholder="Minimum 8 characters" className="input input-with-icon" />
                                </div>
                            </div>
                        </div>

                        <div className="warn-banner">
                            <TriangleAlert className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                            <span>
                                This admin will have <strong>full access</strong> to the control panel and can manage other admins.
                                Do not share credentials.
                            </span>
                        </div>

                        <button type="submit" disabled={creating} className="btn btn-primary">
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                            {creating ? 'Adding…' : 'Add Admin'}
                        </button>
                    </form>
                </div>
            )}

            {/* Admins Table */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-[#53389e]" />
                </div>
            ) : admins.length === 0 ? (
                <div className="card text-center py-16">
                    <Shield className="w-10 h-10 mx-auto mb-4 text-[#334155]" />
                    <p className="text-sm font-bold text-[#475569] tracking-widest uppercase">No admins yet</p>
                    <p className="text-xs text-[#334155] mt-1">Add the first admin using the button above</p>
                </div>
            ) : (
                <div className="data-table-wrap">
                    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.05] bg-white/[0.02]">
                        <Shield className="w-3.5 h-3.5 text-[#a855f7]" />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">Admin Table</span>
                        <span className="ml-auto badge badge-dim">{admins.length} admin{admins.length !== 1 ? 's' : ''}</span>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                {['Name', 'Email', 'Added On', 'Added By', ''].map(h => <th key={h}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map(admin => {
                                const isSelf = admin.email === self?.email;
                                const addedBy = admin.createdById
                                    ? admins.find(a => a.id === admin.createdById)?.email ?? admin.createdById.slice(0, 8) + '…'
                                    : 'Bootstrap';
                                return (
                                    <tr key={admin.id}>
                                        <td>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#53389e]/60 to-[#a855f7]/40 flex items-center justify-center text-white text-xs font-black shrink-0">
                                                    {(admin.name || admin.email)[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{admin.name || '—'}</p>
                                                    {isSelf && <span className="badge badge-violet text-[8px] mt-0.5">You</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-[#94a3b8] text-xs font-mono">{admin.email}</span>
                                        </td>
                                        <td>
                                            <span className="text-[#475569] text-xs">
                                                {new Date(admin.createdAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-[#475569] text-xs font-mono">{addedBy}</span>
                                        </td>
                                        <td className="text-right">
                                            {isSelf ? (
                                                <span className="text-[10px] text-[#334155] font-bold">Cannot remove self</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleRemove(admin)}
                                                    disabled={removing === admin.id}
                                                    className="p-1.5 rounded-lg bg-red-500/0 hover:bg-red-500/15 text-[#475569] hover:text-red-400 transition-all disabled:opacity-50"
                                                    title="Remove admin"
                                                >
                                                    {removing === admin.id
                                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        : <Trash2 className="w-3.5 h-3.5" />
                                                    }
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
