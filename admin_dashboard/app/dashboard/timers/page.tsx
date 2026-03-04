'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGetAllConfig, apiBatchUpdateConfig } from '@/lib/api';
import { Clock, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type Toast = { msg: string; type: 'ok' | 'err' };

interface TimerField { key: string; label: string; hint: string; id: string; unit: string; }

const fields: TimerField[] = [
    { key: 'phase1_timer_seconds', label: 'Phase 1 Countdown', hint: 'Seconds before Phase 1 results are revealed', id: 'p1-timer', unit: 'sec' },
    { key: 'phase2_timer_seconds', label: 'Phase 2 Countdown', hint: 'Seconds before Phase 2 results are revealed', id: 'p2-timer', unit: 'sec' },
    { key: 'announcement_interval', label: 'Winner Reveal Interval', hint: 'Seconds per winner announcement (30 recommended)', id: 'announce-interval', unit: 'sec' },
    { key: 'max_slots', label: 'Max Slots (Phase 1)', hint: 'Total participant slots for Phase 1 advancement', id: 'max-slots', unit: 'slots' },
    { key: 'phase2_score_threshold', label: 'Phase 2 Score Threshold', hint: 'Minimum score (0–100) to qualify for Phase 3', id: 'p2-threshold', unit: 'pts' },
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
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Timer Settings</h1>
                    <p className="page-subtitle">Configure countdown timers and evaluation thresholds</p>
                </div>
                <button onClick={save} disabled={saving || loading} className="btn btn-primary">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {saving ? 'Saving…' : 'Save All'}
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
                <div className="flex items-center justify-center h-52">
                    <Loader2 className="w-8 h-8 animate-spin text-[#53389e]" />
                </div>
            ) : (
                <div className="card">
                    <div className="card-header">
                        <div className="card-icon"><Clock className="w-4 h-4 text-[#a855f7]" /></div>
                        <div>
                            <p className="card-title">Timing &amp; Slot Configuration</p>
                            <p className="text-[10px] text-[#475569] mt-0.5">All numeric values — changes apply on next phase trigger</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {fields.map(({ key, label, hint, id, unit }) => (
                            <div key={key}>
                                <label htmlFor={id} className="label">{label}</label>
                                <div className="relative">
                                    <input
                                        id={id}
                                        type="number"
                                        min="1"
                                        value={values[key] ?? ''}
                                        onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
                                        className="input font-mono pr-14"
                                        placeholder="—"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#475569] font-bold uppercase tracking-wider">
                                        {unit}
                                    </span>
                                </div>
                                <p className="text-[9px] text-[#334155] mt-1.5 leading-relaxed">{hint}</p>
                            </div>
                        ))}
                    </div>

                    <div className="divider" />
                    <div className="flex justify-end">
                        <button onClick={save} disabled={saving} className="btn btn-primary">
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            {saving ? 'Saving…' : 'Save All Settings'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
