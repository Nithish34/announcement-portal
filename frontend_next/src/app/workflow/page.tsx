"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Settings, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import DynamicBackground from '@/components/DynamicBackground';

export default function WorkflowControl() {
    const { setWorkflowState, user } = useAuth();
    const router = useRouter();

    const handleSimulate = (teamId: string, result: 'winner' | 'loser', route: string) => {
        setWorkflowState(teamId, result);
        router.push(route);
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-8 bg-[#050508]">
            <DynamicBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-4xl"
            >
                <div className="text-center mb-12">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="inline-block mb-6"
                    >
                        <Settings className="w-20 h-20 text-[#a855f7]" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#a855f7] mb-4 tracking-widest uppercase">
                        Workflow Control Panel
                    </h1>
                    <p className="text-gray-400 tracking-widest uppercase text-sm">
                        Current Status: {user ? `${user.teamId} (${user.result})` : 'Not Authenticated'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Phase 1 Scenarios */}
                    <div className="bg-[#111] border border-[#a855f7]/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                        <h2 className="text-2xl font-black text-white mb-6 tracking-widest uppercase border-b border-white/10 pb-4">
                            Results Phase 1
                        </h2>

                        <div className="space-y-4">
                            <button
                                onClick={() => handleSimulate('TEAM-001', 'winner', '/results')}
                                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-[#10b981]/10 border border-white/10 hover:border-[#10b981]/50 rounded-xl transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="text-[#10b981] group-hover:scale-110 transition-transform" />
                                    <span className="text-white font-bold tracking-wider">Simulate Winner</span>
                                </div>
                                <ArrowRight className="text-gray-500 group-hover:text-[#10b981] group-hover:translate-x-1 transition-all" />
                            </button>

                            <button
                                onClick={() => handleSimulate('TEAM-006', 'loser', '/results')}
                                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/50 rounded-xl transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <XCircle className="text-red-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-white font-bold tracking-wider">Simulate Loser</span>
                                </div>
                                <ArrowRight className="text-gray-500 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>

                    {/* Phase 2 Scenarios */}
                    <div className="bg-[#111] border border-[#53389e]/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(83,56,158,0.1)]">
                        <h2 className="text-2xl font-black text-white mb-6 tracking-widest uppercase border-b border-white/10 pb-4">
                            Results Phase 2
                        </h2>

                        <div className="space-y-4">
                            <button
                                onClick={() => handleSimulate('USR-101', 'winner', '/results-2')}
                                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-[#10b981]/10 border border-white/10 hover:border-[#10b981]/50 rounded-xl transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="text-[#10b981] group-hover:scale-110 transition-transform" />
                                    <span className="text-white font-bold tracking-wider">Simulate Winner</span>
                                </div>
                                <ArrowRight className="text-gray-500 group-hover:text-[#10b981] group-hover:translate-x-1 transition-all" />
                            </button>

                            <button
                                onClick={() => handleSimulate('USR-105', 'loser', '/results-2')}
                                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/50 rounded-xl transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <XCircle className="text-red-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-white font-bold tracking-wider">Simulate Loser</span>
                                </div>
                                <ArrowRight className="text-gray-500 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
