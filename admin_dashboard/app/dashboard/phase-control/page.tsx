'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGetAllConfig, apiUpdateConfig } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Zap, ToggleLeft, ToggleRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type Toast = { msg: string; type: 'ok' | 'err' };

export default function PhaseControlPage() {
    const [config, setConfig] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<Toast | null>(null);
    const [saving, setSaving] = useState(false);

    const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const loadConfig = useCallback(async () => {
        try {
            const rows = await apiGetAllConfig();
            const map: Record<string, string> = {};
            rows.forEach(r => { map[r.key] = r.value; });
            setConfig(map);
        } catch { notify('Failed to load config', 'err'); }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadConfig();
        const socket = getSocket();
        socket.connect();
        socket.on('config:updated', ({ key, value }: { key: string; value: string }) => {
            setConfig(prev => ({ ...prev, [key]: value }));
        });
        return () => { socket.off('config:updated'); socket.disconnect(); };
    }, [loadConfig]);

    const patch = async (key: string, value: string) => {
        setSaving(true);
        try {
            await apiUpdateConfig(key, value);
            setConfig(prev => ({ ...prev, [key]: value }));
            notify(`✓ ${key} → "${value}"`);
        } catch { notify(`Failed to update ${key}`, 'err'); }
        setSaving(false);
    };

    const currentPhase = Number(config['current_phase'] ?? 1);
    const isRegOpen = config['registration_open'] === 'true';
    const isLocked = config['results_locked'] === 'true';

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Phase Control</h1>
                    <p className="page-subtitle">Control hackathon phase, registration gate, and result visibility</p>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type === 'ok' ? 'toast-ok' : 'toast-err'}`}>
                    {toast.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-52">
                    <Loader2 className="w-8 h-8 animate-spin text-[#53389e]" />
                </div>
            ) : (
                <div className="space-y-5">
                    {/* Active Phase */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-icon"><Zap className="w-4 h-4 text-[#a855f7]" /></div>
                            <div>
                                <p className="card-title">Active Phase</p>
                                <p className="text-[10px] text-[#475569] mt-0.5">Select which phase is currently running</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3].map(p => (
                                <button
                                    key={p}
                                    onClick={() => patch('current_phase', String(p))}
                                    disabled={saving}
                                    className={`
                                        py-5 rounded-xl font-black text-base tracking-widest uppercase transition-all duration-200
                                        ${currentPhase === p
                                            ? 'bg-gradient-to-br from-[#53389e] to-[#a855f7] text-white shadow-[0_0_24px_rgba(83,56,158,0.45)] scale-[1.02]'
                                            : 'bg-white/[0.03] border border-white/[0.08] text-[#475569] hover:text-white hover:border-[#53389e]/40'}
                                    `}
                                >
                                    Phase {p}
                                    {currentPhase === p && (
                                        <span className="block text-[9px] tracking-[0.3em] mt-1 text-[#c084fc]">ACTIVE</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Registration */}
                        <div className="card">
                            <p className="label mb-4">Registration Gate</p>
                            <button
                                onClick={() => patch('registration_open', isRegOpen ? 'false' : 'true')}
                                disabled={saving}
                                className={`toggle-btn ${isRegOpen
                                    ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981] shadow-[0_0_16px_rgba(16,185,129,0.1)]'
                                    : 'bg-red-500/8 border-red-500/30 text-red-400'}`}
                            >
                                <span className="font-black text-sm tracking-wide">
                                    Registration {isRegOpen ? 'OPEN' : 'CLOSED'}
                                </span>
                                {isRegOpen
                                    ? <ToggleRight className="w-7 h-7" />
                                    : <ToggleLeft className="w-7 h-7" />}
                            </button>
                            <p className="text-[10px] text-[#334155] mt-3 leading-relaxed">
                                When open, new teams can register via the public portal.
                            </p>
                        </div>

                        {/* Results Lock */}
                        <div className="card">
                            <p className="label mb-4">Results Visibility</p>
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    onClick={() => patch('results_locked', 'true')}
                                    disabled={saving || isLocked}
                                    className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm tracking-widest uppercase transition-all border
                                        ${isLocked
                                            ? 'bg-red-500/15 border-red-500/50 text-red-400 shadow-[0_0_16px_rgba(239,68,68,0.15)]'
                                            : 'bg-white/[0.03] border-white/[0.08] text-[#475569] hover:border-red-500/30 hover:text-red-400'}`}
                                >
                                    🔒 Lock
                                </button>
                                <button
                                    onClick={() => patch('results_locked', 'false')}
                                    disabled={saving || !isLocked}
                                    className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm tracking-widest uppercase transition-all border
                                        ${!isLocked
                                            ? 'bg-[#10b981]/15 border-[#10b981]/50 text-[#10b981] shadow-[0_0_16px_rgba(16,185,129,0.15)]'
                                            : 'bg-white/[0.03] border-white/[0.08] text-[#475569] hover:border-[#10b981]/30 hover:text-[#10b981]'}`}
                                >
                                    🔓 Release
                                </button>
                            </div>
                            <p className="text-[10px] text-[#334155] mt-3 leading-relaxed">
                                Releasing makes results visible to participants on the portal.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
