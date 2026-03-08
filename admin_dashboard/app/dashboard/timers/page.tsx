'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGetAllConfig, apiBatchUpdateConfig } from '@/lib/api';
import { Clock, Save, CheckCircle, AlertCircle, Loader2, Calendar, Hash } from 'lucide-react';

type Toast = { msg: string; type: 'ok' | 'err' };

// ── datetime helpers ─────────────────────────────────────────────────────────
function isoToLocal(iso: string | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        `T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
}
function localToISO(local: string): string {
    if (!local) return '';
    return new Date(local).toISOString();
}
function formatDisplay(iso: string | undefined): string {
    if (!iso) return 'Not set';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZoneName: 'short',
    });
}

// ── slot fields ───────────────────────────────────────────────────────────────
interface NumField { key: string; label: string; hint: string; id: string; unit: string; color: string; }
const slotFields: NumField[] = [
    {
        key: 'max_slots',
        label: 'Max Slots — Evaluation 1',
        hint: 'Maximum number of teams that can advance from Evaluation 1',
        id: 'max-slots-eval1',
        unit: 'teams',
        color: '#f59e0b',
    },
    {
        key: 'max_slots_eval2',
        label: 'Max Slots — Evaluation 2',
        hint: 'Maximum number of individual participants that can advance from Evaluation 2',
        id: 'max-slots-eval2',
        unit: 'individuals',
        color: '#10b981',
    },
    {
        key: 'announcement_interval',
        label: 'Winner Reveal Interval',
        hint: 'Delay in seconds between each winner card reveal on the results page',
        id: 'announce-interval',
        unit: 'sec',
        color: '#06b6d4',
    },
];

export default function SettingsPage() {
    const [values, setValues] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);

    const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const loadConfig = useCallback(async () => {
        try {
            const rows = await apiGetAllConfig();
            const map: Record<string, string> = {};
            rows.forEach(r => { map[r.key] = r.value; });
            setValues(map);
        } catch { notify('Failed to load settings', 'err'); }
        setLoading(false);
    }, []);

    useEffect(() => { loadConfig(); }, [loadConfig]);

    const save = async () => {
        setSaving(true);
        try {
            const updates: { key: string; value: string }[] = [];

            // Datetime fields — convert local → ISO
            ['phase1_start_datetime', 'phase2_start_datetime'].forEach(key => {
                const local = values[key] ?? '';
                const iso = localToISO(local);
                if (iso) updates.push({ key, value: iso });
            });

            // Slot / numeric fields
            slotFields.forEach(f => {
                if (values[f.key] !== undefined && values[f.key] !== '') {
                    updates.push({ key: f.key, value: values[f.key] });
                }
            });

            if (updates.length === 0) { notify('Nothing to save', 'err'); setSaving(false); return; }
            await apiBatchUpdateConfig(updates);
            notify('✓ Settings saved');
        } catch { notify('Failed to save settings', 'err'); }
        setSaving(false);
    };

    const setDatetimeLocal = (key: string, localVal: string) =>
        setValues(prev => ({ ...prev, [key]: localVal }));

    const getDatetimeLocal = (key: string): string => {
        const raw = values[key] ?? '';
        if (raw && !raw.includes('Z') && !raw.includes('+')) return raw;
        return isoToLocal(raw);
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Configure timers, slot limits, and reveal intervals</p>
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
                <div className="space-y-5">

                    {/* ── Evaluation Start Datetimes ─────────────────────── */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-icon"><Calendar className="w-4 h-4 text-[#a855f7]" /></div>
                            <div>
                                <p className="card-title">Evaluation Start Times</p>
                                <p className="text-[10px] text-[#475569] mt-0.5">
                                    The participant countdown timer targets these datetimes. When it hits zero, participants are redirected to results.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { key: 'phase1_start_datetime', label: 'Evaluation 1 Starts', color: '#a855f7' },
                                { key: 'phase2_start_datetime', label: 'Evaluation 2 Starts', color: '#06b6d4' },
                            ].map(({ key, label, color }) => (
                                <div key={key}>
                                    <label className="label mb-2" style={{ color: `${color}99` }}>{label}</label>

                                    <div className="relative">
                                        <Calendar
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                                            style={{ color }}
                                        />
                                        <input
                                            type="datetime-local"
                                            value={getDatetimeLocal(key)}
                                            onChange={e => setDatetimeLocal(key, e.target.value)}
                                            className="input input-with-icon font-mono"
                                            style={{ colorScheme: 'dark' }}
                                        />
                                    </div>

                                    <div className="mt-2 flex items-center gap-2">
                                        <Clock className="w-3 h-3 shrink-0" style={{ color: `${color}80` }} />
                                        <p className="text-[10px] leading-relaxed" style={{ color: `${color}80` }}>
                                            {values[key]
                                                ? <>Currently: <span className="font-bold">{formatDisplay(
                                                    values[key].includes('Z') || values[key].includes('+')
                                                        ? values[key]
                                                        : localToISO(values[key])
                                                )}</span></>
                                                : 'Not set yet'
                                            }
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Slot Limits & Intervals ────────────────────────── */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-icon"><Hash className="w-4 h-4 text-[#a855f7]" /></div>
                            <div>
                                <p className="card-title">Slot Limits & Intervals</p>
                                <p className="text-[10px] text-[#475569] mt-0.5">
                                    These values control selection caps in the Evaluation page.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {slotFields.map(({ key, label, hint, id, unit, color }) => (
                                <div key={key}>
                                    <label htmlFor={id} className="label" style={{ color: `${color}99` }}>{label}</label>
                                    <div className="relative mt-1">
                                        <input
                                            id={id}
                                            type="number"
                                            min="1"
                                            value={values[key] ?? ''}
                                            onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
                                            className="input font-mono pr-24"
                                            placeholder="—"
                                            style={{ borderColor: values[key] ? `${color}30` : undefined }}
                                        />
                                        <span
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-wider"
                                            style={{ color: `${color}60` }}
                                        >
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
                </div>
            )}
        </div>
    );
}
