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
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#53389e]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#a855f7]/5 rounded-full blur-[100px]" />
                {/* Grid lines */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(#a855f7 1px, transparent 1px), linear-gradient(90deg, #a855f7 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo / Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#53389e] to-[#a855f7] shadow-[0_0_40px_rgba(83,56,158,0.6)] mb-6 relative">
                        <Shield className="w-10 h-10 text-white" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#10b981] rounded-full shadow-[0_0_8px_#10b981] animate-pulse-glow" />
                    </div>
                    <h1 className="text-3xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-[#a855f7]">
                        Ghost Protocol
                    </h1>
                    <p className="text-[#53389e] text-xs tracking-[0.3em] uppercase font-bold mt-1">Admin Control System</p>
                </div>

                {/* Card */}
                <div className="bg-[#0c0c12]/80 backdrop-blur-xl border border-white/8 rounded-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-[10px] text-gray-400 font-black tracking-[0.25em] uppercase mb-2">
                                Admin Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#53389e]" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    disabled={loading}
                                    required
                                    placeholder="admin@eduspine.com"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#53389e] focus:ring-1 focus:ring-[#53389e]/50 transition-all disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[10px] text-gray-400 font-black tracking-[0.25em] uppercase mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#53389e]" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={loading}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#53389e] focus:ring-1 focus:ring-[#53389e]/50 transition-all disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#53389e] to-[#a855f7] text-white font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(83,56,158,0.4)] hover:shadow-[0_0_30px_rgba(83,56,158,0.6)] hover:scale-[1.01] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> AUTHENTICATING...</>
                            ) : (
                                <><Zap className="w-4 h-4" /> ACCESS CONTROL SYSTEM</>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_6px_#10b981] animate-pulse-glow" />
                        <span className="text-[10px] text-gray-500 tracking-widest uppercase font-bold">
                            Secure connection to Ghost Protocol Backend
                        </span>
                    </div>
                </div>

                <p className="text-center text-gray-600 text-xs mt-6 tracking-widest">
                    EDUSPINE — RESTRICTED ADMIN ACCESS ONLY
                </p>
            </div>
        </div>
    );
}
