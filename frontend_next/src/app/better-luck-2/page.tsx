"use client";

import { motion } from 'framer-motion';
import { UserX, MessageSquare, Briefcase, Github } from 'lucide-react';
import DynamicBackground from '@/components/DynamicBackground';

export default function BetterLuck2() {
    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-8">
            <DynamicBackground />

            <div className="relative z-10 max-w-2xl w-full">
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="bg-[#000000]/60 backdrop-blur-xl border border-[#53389e]/30 shadow-[0_0_30px_rgba(83,56,158,0.1)] rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
                >
                    {/* Accent glow line inside card */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#53389e] to-transparent opacity-60" />

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-28 h-28 bg-[#000000]/80 rounded-full mb-8 border-2 border-gray-600 shadow-inner"
                    >
                        <UserX className="w-12 h-12 text-gray-500 drop-shadow-md" />
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[#53389e] mb-6 tracking-widest uppercase drop-shadow-md">
                        JOURNEY PAUSED
                    </h1>

                    <p className="text-gray-300 text-lg md:text-xl mb-10 leading-relaxed text-justify px-4">
                        Thank you for giving it your all during Evaluation Phase 2. The individual metrics were incredibly competitive this year. While you won't be advancing to the ultimate Ghost Protocol stage, the skills you've demonstrated are highly commendable.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/5 border border-white/10 hover:border-[#53389e]/50 hover:bg-[#53389e]/10 transition-all p-5 rounded-xl flex items-center gap-4 shadow-sm"
                        >
                            <div className="bg-[#53389e]/10 p-3 rounded-lg border border-[#53389e]/30">
                                <MessageSquare className="w-8 h-8 text-[#53389e]" />
                            </div>
                            <div className="text-left">
                                <h4 className="text-white font-bold tracking-wider uppercase text-sm mb-1">Feedback Sent</h4>
                                <p className="text-gray-400 text-xs">Detailed notes emailed</p>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/5 border border-white/10 hover:border-[#53389e]/50 hover:bg-[#53389e]/10 transition-all p-5 rounded-xl flex items-center gap-4 shadow-sm"
                        >
                            <div className="bg-[#53389e]/10 p-3 rounded-lg border border-[#53389e]/30">
                                <Github className="w-8 h-8 text-[#53389e]" />
                            </div>
                            <div className="text-left">
                                <h4 className="text-white font-bold tracking-wider uppercase text-sm mb-1">Keep Building</h4>
                                <p className="text-gray-400 text-xs">Commit every day</p>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="p-5 bg-gradient-to-r from-transparent via-[#53389e]/10 to-transparent border-t border-b border-[#53389e]/30"
                    >
                        <div className="flex items-center justify-center gap-3 text-[#53389e]">
                            <Briefcase className="w-6 h-6" />
                            <span className="text-sm md:text-base font-bold tracking-wider uppercase drop-shadow-[0_0_5px_rgba(83,56,158,0.5)]">Talent pool profile updated. Keep an eye on your inbox!</span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
