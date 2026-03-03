'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGetAllConfig, apiBatchUpdateConfig } from '@/lib/api';
import { Clock, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type Toast = { msg: string; type: 'ok' | 'err' };

interface TimerField {
    key: string;
    label: string;
    hint: string;
    id: string;
}

const fields: TimerField[] = [
    { key: 'phase1_timer_seconds', label: 'Phase 1 Countdown', hint: 'Seconds before Phase 1 results are revealed', id: 'p1-timer' },
    { key: 'phase2_timer_seconds', label: 'Phase 2 Countdown', hint: 'Seconds before Phase 2 results are revealed', id: 'p2-timer' },
    { key: 'announcement_interval', label: 'Winner Reveal Interval', hint: 'Seconds per winner announcement (30 recommended)', id: 'announce-interval' },
    { key: 'max_slots', label: 'Max Slots (Phase 1)', hint: 'Total participant slots for Phase 1 advancement', id: 'max-slots' },
    { key: 'phase2_score_threshold', label: 'Phase 2 Score Threshold', hint: 'Minimum score (0-100) to qualify for Phase 3', id: 'p2-threshold' },
];

export default function TimersPage() {
    const [values, setValues] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);

    const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const loadConfig = useCallback(async () => {
        try {
            const rows = await apiGetAllConfig();
            const map: Record<string, string> = {};
            rows.forEach(r => { map[r.key] = r.value; });
            setValues(map);
        } catch { notify('Failed to load config', 'err'); }
        setLoading(false);
    }, []);

    useEffect(() => { loadConfig(); }, [loadConfig]);

    const save = async () => {
        setSaving(true);
        try {
            const updates = fields.map(f => ({ key: f.key, value: values[f.key] ?? '' }));
            await apiBatchUpdateConfig(updates);
            notify('✓ All timer and slot settings saved');
        } catch { notify('Failed to save settings', 'err'); }
        setSaving(false);
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-black tracking-[0.1em] uppercase text-white">Timer Settings</h1>
                <p className="text-xs text-gray-500 tracking-widest mt-1">Configure countdown timers and evaluation thresholds</p>
            </div>

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
                <div className="bg-[#0c0c12] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-[#53389e]/20 border border-[#53389e]/30 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-[#a855f7]" />
                        </div>
                        <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white">Timing & Slot Configuration</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        {fields.map(({ key, label, hint, id }) => (
                            <div key={key}>
                                <label htmlFor={id} className="block text-[10px] text-gray-400 font-black tracking-[0.25em] uppercase mb-1">
                                    {label}
                                </label>
                                <input
                                    id={id}
                                    type="number"
                                    min="1"
                                    value={values[key] ?? ''}
                                    onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#53389e] focus:ring-1 focus:ring-[#53389e]/50 transition-colors"
                                />
                                <p className="text-[9px] text-gray-600 mt-1 tracking-wide">{hint}</p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={save}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#53389e] to-[#a855f7] text-white font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(83,56,158,0.4)] hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving…' : 'Save All Settings'}
                    </button>
                </div>
            )}
        </div>
    );
}
