'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Shield, Mail, Lock, Loader2, AlertCircle, Zap } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const ok = await login(email, password);
            if (ok) {
                router.push('/dashboard');
            } else {
                setError('Invalid credentials or insufficient privileges. ADMIN role required.');
            }
        } catch {
            setError('Cannot connect to the Ghost Protocol backend. Is it running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#050508]">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-1/4 w-[700px] h-[700px] bg-[#53389e]/8 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-1/4 w-[500px] h-[500px] bg-[#a855f7]/5 rounded-full blur-[120px]" />
                {/* Subtle grid */}
                <div className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(168,85,247,1) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,1) 1px, transparent 1px)',
                        backgroundSize: '64px 64px',
                    }}
                />
            </div>

            <div className="relative w-full max-w-[400px]">
                {/* Logo */}
                <div className="text-center mb-9">
                    <div className="relative inline-flex items-center justify-center w-[72px] h-[72px] rounded-2xl
                        bg-gradient-to-br from-[#53389e] to-[#a855f7] shadow-[0_0_40px_rgba(83,56,158,0.55)] mb-5">
                        <Shield className="w-9 h-9 text-white" strokeWidth={1.75} />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#10b981] rounded-full shadow-[0_0_8px_#10b981] animate-pulse-glow" />
                    </div>
                    <h1 className="text-[1.6rem] font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#a855f7]">
                        Ghost Protocol
                    </h1>
                    <p className="text-[10px] text-[#7c3aed] tracking-[0.3em] uppercase font-bold mt-1.5">Admin Control System</p>
                </div>

                {/* Card */}
                <div className="bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-7
                    shadow-[0_0_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(83,56,158,0.08)]">

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="label">Admin Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#53389e]" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    disabled={loading}
                                    required
                                    placeholder="admin@eduspine.com"
                                    className="input input-with-icon"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#53389e]" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={loading}
                                    required
                                    placeholder="••••••••"
                                    className="input input-with-icon"
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/25 text-red-400 text-[11px] font-semibold leading-relaxed">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full justify-center py-3 text-sm mt-2"
                        >
                            {loading
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating…</>
                                : <><Zap className="w-4 h-4" /> Access Control System</>
                            }
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-white/[0.05] flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_6px_#10b981] animate-pulse-glow" />
                        <span className="text-[10px] text-[#334155] tracking-widest uppercase font-bold">
                            Secure connection to Ghost Protocol Backend
                        </span>
                    </div>
                </div>

                <p className="text-center text-[#1e293b] text-[10px] mt-5 tracking-widest uppercase">
                    EDUSPINE — RESTRICTED ADMIN ACCESS ONLY
                </p>
            </div>
        </div>
    );
}
