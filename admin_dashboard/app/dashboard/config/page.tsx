'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGetAllConfig, apiUpdateConfig } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Database, Edit2, Check, X, RefreshCw, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ConfigRow { key: string; value: string; updatedAt: string; }
type Toast = { msg: string; type: 'ok' | 'err' };

export default function RawConfigPage() {
    const [rows, setRows] = useState<ConfigRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState<Record<string, boolean>>({});
    const [toast, setToast] = useState<Toast | null>(null);

    const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const load = useCallback(async () => {
        setLoading(true);
        try { setRows(await apiGetAllConfig()); }
        catch { notify('Failed to load config', 'err'); }
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
        const socket = getSocket();
        socket.connect();
        socket.on('config:updated', ({ key, value }: { key: string; value: string }) => {
            setRows(prev => prev.map(r => r.key === key ? { ...r, value, updatedAt: new Date().toISOString() } : r));
        });
        return () => { socket.off('config:updated'); socket.disconnect(); };
    }, [load]);

    const startEdit = (key: string, current: string) => setEditing(prev => ({ ...prev, [key]: current }));
    const cancelEdit = (key: string) => setEditing(prev => { const n = { ...prev }; delete n[key]; return n; });

    const saveEdit = async (key: string) => {
        const value = editing[key];
        setSaving(prev => ({ ...prev, [key]: true }));
        try {
            await apiUpdateConfig(key, value);
            setRows(prev => prev.map(r => r.key === key ? { ...r, value } : r));
            cancelEdit(key);
            notify(`✓ ${key} updated`);
        } catch { notify(`Failed to update ${key}`, 'err'); }
        setSaving(prev => { const n = { ...prev }; delete n[key]; return n; });
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Raw Config</h1>
                    <p className="page-subtitle">Live key-value store — hover any row and click ✎ to edit inline</p>
                </div>
                <button onClick={load} disabled={loading} className="btn btn-ghost">
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type === 'ok' ? 'toast-ok' : 'toast-err'}`}>
                    {toast.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-[#53389e]" />
                </div>
            ) : (
                <div className="data-table-wrap">
                    {/* Table Header */}
                    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.05] bg-white/[0.02]">
                        <Database className="w-3.5 h-3.5 text-[#a855f7]" />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">SystemConfig Table</span>
                        <span className="ml-auto badge badge-dim">{rows.length} rows</span>
                    </div>

                    <table className="data-table font-mono">
                        <thead>
                            <tr>
                                <th style={{ width: '35%' }}>Key</th>
                                <th>Value</th>
                                <th style={{ width: '130px' }}>Last Updated</th>
                                <th style={{ width: '70px' }} />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(row => (
                                <tr key={row.key} className="group">
                                    <td>
                                        <span className="text-[#a855f7] text-xs font-black tracking-wider">{row.key}</span>
                                    </td>
                                    <td>
                                        {editing[row.key] !== undefined ? (
                                            <input
                                                value={editing[row.key]}
                                                onChange={e => setEditing(prev => ({ ...prev, [row.key]: e.target.value }))}
                                                autoFocus
                                                className="bg-black/60 border border-[#53389e]/50 rounded-lg px-3 py-1.5 text-white text-xs w-full focus:outline-none focus:border-[#a855f7] font-mono"
                                            />
                                        ) : (
                                            <span className="text-white text-xs">{row.value}</span>
                                        )}
                                    </td>
                                    <td className="text-[10px] text-[#334155]">
                                        {new Date(row.updatedAt).toLocaleTimeString()}
                                    </td>
                                    <td className="text-right">
                                        {editing[row.key] !== undefined ? (
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => saveEdit(row.key)} disabled={saving[row.key]}
                                                    className="p-1.5 rounded-lg bg-[#10b981]/15 text-[#10b981] hover:bg-[#10b981]/25 transition-colors disabled:opacity-50">
                                                    {saving[row.key] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                </button>
                                                <button onClick={() => cancelEdit(row.key)}
                                                    className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => startEdit(row.key, row.value)}
                                                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-white/[0.04] text-[#475569] hover:text-white hover:bg-[#53389e]/20 transition-all">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
