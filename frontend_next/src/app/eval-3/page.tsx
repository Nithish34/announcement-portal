"use client";

import { motion } from 'framer-motion';
import { ShieldCheck, Star, Zap, Network } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import DynamicBackground from '@/components/DynamicBackground';

export default function Eval3() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-8">
            <DynamicBackground />

            <div className="relative z-10 max-w-3xl w-full">
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-10"
                >
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-flex items-center justify-center w-36 h-36 bg-gradient-to-br from-[#53389e] to-fuchsia-500 rounded-full mb-8 shadow-[0_0_40px_rgba(83,56,158,0.6)] border-4 border-[#000000]"
                    >
                        <ShieldCheck className="w-24 h-24 text-white" />
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                        className="inline-block bg-[#000000]/60 backdrop-blur-md border border-[#53389e] text-[#53389e] px-10 py-3 rounded-full font-black text-lg md:text-2xl mb-8 shadow-[0_0_20px_rgba(83,56,158,0.3)] uppercase tracking-[0.2em]"
                    >
                        FINAL STAGE UNLOCKED
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[#53389e] mb-6 drop-shadow-md uppercase tracking-widest leading-tight">
                        OUTSTANDING<br />PERFORMANCE
                    </h1>
                    <p className="text-[#53389e] text-xl md:text-2xl mb-4 font-semibold tracking-wide drop-shadow-[0_0_2px_rgba(83,56,158,0.5)]">
                        You've officially advanced to Evaluation Round 3: The Ghost Protocol
                    </p>
                </motion.div>

                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-[#000000]/60 backdrop-blur-xl border border-[#53389e]/30 shadow-[0_0_30px_rgba(83,56,158,0.1)] rounded-2xl p-8 md:p-10 mb-8 relative overflow-hidden"
                >
                    {/* Accent glow line inside card */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#53389e] to-transparent opacity-60" />

                    <div className="flex items-center justify-center gap-4 mb-10 border-b border-white/10 pb-6">
                        <Star className="w-10 h-10 text-[#53389e]" />
                        <h2 className="text-3xl font-black text-white tracking-widest uppercase">Your Next Directives</h2>
                    </div>

                    <div className="space-y-6">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex items-start gap-5 p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-[#53389e]/10 hover:border-[#53389e]/40 transition-colors"
                        >
                            <div className="bg-[#53389e]/20 p-3 rounded-lg border border-[#53389e]/50 shadow-inner">
                                <Network className="w-7 h-7 text-[#53389e]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[#53389e] font-bold text-lg tracking-wider mb-2">Dynamic Team Reassignment</h3>
                                <p className="text-gray-300 leading-relaxed text-sm">
                                    Prepare for the "Ghost Protocol". You may be dynamically reassigned to a new elite strike team based on the synergistic needs of the final challenge.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="flex items-start gap-5 p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-[#53389e]/10 hover:border-[#53389e]/40 transition-colors"
                        >
                            <div className="bg-[#53389e]/20 p-3 rounded-lg border border-[#53389e]/50 shadow-inner">
                                <Zap className="w-7 h-7 text-[#53389e]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[#53389e] font-bold text-lg tracking-wider mb-2">Final Boss Challenge</h3>
                                <p className="text-gray-300 leading-relaxed text-sm">
                                    The ultimate architecture test awaits. Your new team will be tasked with solving a high-stakes scalability bottleneck live. Details will drop at exactly 09:00 AM AST.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-[#53389e] text-sm tracking-[0.4em] font-bold"
                    >
                        AWAITING SYSTEM SYNCHRONIZATION...
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
