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

    const startEdit = (key: string, current: string) =>
        setEditing(prev => ({ ...prev, [key]: current }));

    const cancelEdit = (key: string) =>
        setEditing(prev => { const n = { ...prev }; delete n[key]; return n; });

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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black tracking-[0.1em] uppercase text-white">Raw Config</h1>
                    <p className="text-xs text-gray-500 tracking-widest mt-1">Live key-value config store — click any row to edit inline</p>
                </div>
                <button onClick={load} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-[#53389e]/20 transition-all disabled:opacity-50">
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold shadow-2xl
          ${toast.type === 'ok' ? 'bg-[#0c0c12] border-[#10b981]/50 text-[#10b981]' : 'bg-[#0c0c12] border-red-500/50 text-red-400'}`}>
                    {toast.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-[#53389e]" /></div>
            ) : (
                <div className="bg-[#0c0c12] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
                        <Database className="w-4 h-4 text-[#a855f7]" />
                        <span className="text-xs font-black tracking-[0.2em] uppercase text-white">SystemConfig Table</span>
                        <span className="ml-auto text-[9px] text-gray-600 font-mono">{rows.length} rows</span>
                    </div>
                    <table className="w-full text-sm font-mono">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.015]">
                                <th className="text-left px-6 py-3 text-[9px] text-gray-500 font-black tracking-widest uppercase w-1/3">Key</th>
                                <th className="text-left px-4 py-3 text-[9px] text-gray-500 font-black tracking-widest uppercase">Value</th>
                                <th className="text-left px-4 py-3 text-[9px] text-gray-500 font-black tracking-widest uppercase">Last Updated</th>
                                <th className="px-4 py-3 w-24" />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(row => (
                                <tr key={row.key} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors group">
                                    <td className="px-6 py-3 text-[#a855f7] text-xs font-black tracking-wider">{row.key}</td>
                                    <td className="px-4 py-3">
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
                                    <td className="px-4 py-3 text-[10px] text-gray-600">
                                        {new Date(row.updatedAt).toLocaleTimeString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {editing[row.key] !== undefined ? (
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => saveEdit(row.key)} disabled={saving[row.key]}
                                                    className="p-1.5 rounded-lg bg-[#10b981]/20 text-[#10b981] hover:bg-[#10b981]/30 transition-colors disabled:opacity-50">
                                                    {saving[row.key] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                </button>
                                                <button onClick={() => cancelEdit(row.key)}
                                                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => startEdit(row.key, row.value)}
                                                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-white/5 text-gray-400 hover:text-white hover:bg-[#53389e]/20 transition-all">
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
