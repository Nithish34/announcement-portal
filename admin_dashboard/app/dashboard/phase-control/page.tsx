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
            notify(`✓ ${key} updated to "${value}"`);
        } catch { notify(`Failed to update ${key}`, 'err'); }
        setSaving(false);
    };

    const currentPhase = Number(config['current_phase'] ?? 1);
    const isRegOpen = config['registration_open'] === 'true';
    const isLocked = config['results_locked'] === 'true';

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-black tracking-[0.1em] uppercase text-white">Phase Control</h1>
                <p className="text-xs text-gray-500 tracking-widest mt-1">Control hackathon phase, registration and result visibility</p>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold shadow-2xl
          ${toast.type === 'ok' ? 'bg-[#0c0c12] border-[#10b981]/50 text-[#10b981]' : 'bg-[#0c0c12] border-red-500/50 text-red-400'}`}>
                    {toast.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-[#53389e]" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Current Phase */}
                    <div className="bg-[#0c0c12] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-xl bg-[#53389e]/20 border border-[#53389e]/30 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-[#a855f7]" />
                            </div>
                            <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white">Active Phase</h2>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3].map(p => (
                                <button
                                    key={p}
                                    onClick={() => patch('current_phase', String(p))}
                                    disabled={saving}
                                    className={`py-5 rounded-xl font-black text-lg tracking-widest uppercase transition-all duration-200
                    ${currentPhase === p
                                            ? 'bg-gradient-to-br from-[#53389e] to-[#a855f7] text-white shadow-[0_0_25px_rgba(83,56,158,0.5)] scale-[1.03]'
                                            : 'bg-white/5 border border-white/10 text-gray-400 hover:border-[#53389e]/40 hover:text-white'}`}
                                >
                                    Phase {p}
                                    {currentPhase === p && (
                                        <span className="block text-[9px] tracking-[0.3em] mt-1 text-[#a855f7]">ACTIVE</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Registration & Results Lock */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Registration Toggle */}
                        <div className="bg-[#0c0c12] border border-white/5 rounded-2xl p-6">
                            <p className="text-[10px] text-gray-400 font-black tracking-[0.25em] uppercase mb-4">Registration Gate</p>
                            <button
                                onClick={() => patch('registration_open', isRegOpen ? 'false' : 'true')}
                                disabled={saving}
                                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border font-bold text-sm tracking-wide transition-all
                  ${isRegOpen
                                        ? 'bg-[#10b981]/10 border-[#10b981]/50 text-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                        : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
                            >
                                <span>{isRegOpen ? 'Registration OPEN' : 'Registration CLOSED'}</span>
                                {isRegOpen
                                    ? <ToggleRight className="w-7 h-7" />
                                    : <ToggleLeft className="w-7 h-7" />}
                            </button>
                            <p className="text-[10px] text-gray-600 mt-3">
                                When open, new teams can register via the public portal.
                            </p>
                        </div>

                        {/* Results Lock */}
                        <div className="bg-[#0c0c12] border border-white/5 rounded-2xl p-6">
                            <p className="text-[10px] text-gray-400 font-black tracking-[0.25em] uppercase mb-4">Results Visibility</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => patch('results_locked', 'true')}
                                    disabled={saving || isLocked}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-all
                    ${isLocked
                                            ? 'bg-red-500/20 border-2 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                                            : 'bg-white/5 border border-white/10 text-gray-400 hover:border-red-500/30'}`}
                                >
                                    🔒 Lock
                                </button>
                                <button
                                    onClick={() => patch('results_locked', 'false')}
                                    disabled={saving || !isLocked}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-all
                    ${!isLocked
                                            ? 'bg-[#10b981]/20 border-2 border-[#10b981] text-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                            : 'bg-white/5 border border-white/10 text-gray-400 hover:border-[#10b981]/30'}`}
                                >
                                    🔓 Release
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-600 mt-3">
                                Releasing makes results visible to participants via the portal.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
