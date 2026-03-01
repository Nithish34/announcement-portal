"use client";

import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import DynamicBackground from '@/components/DynamicBackground';
import Image from 'next/image';

export default function BetterLuckCertificate() {
    const { user } = useAuth();
    const teamId = user?.teamId || 'TEAM-001';
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const handleDownload = () => {
        // Placeholder: replace with actual certificate PDF link or generation logic
        alert('Certificate download coming soon!');
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            <DynamicBackground />

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 gap-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center"
                >
                    <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[#53389e] tracking-widest uppercase drop-shadow-md">
                        Your Certificate
                    </h1>
                    <p className="text-[#53389e] text-sm md:text-base mt-2 font-semibold tracking-widest uppercase">
                        Participation Certificate — EduSpine Hackathon
                    </p>
                </motion.div>

                {/* Certificate Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full max-w-3xl"
                >
                    {/* Certificate Design */}
                    <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#0d0b1a] to-[#0a0a0a] border-2 border-[#53389e]/60 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(83,56,158,0.3)] p-10 md:p-14 text-center">
                        {/* Corner decorations */}
                        <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-[#53389e] rounded-tl-3xl opacity-70" />
                        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-[#53389e] rounded-tr-3xl opacity-70" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-[#53389e] rounded-bl-3xl opacity-70" />
                        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-[#53389e] rounded-br-3xl opacity-70" />

                        {/* Top glow */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#53389e] to-transparent opacity-80" />
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#53389e] to-transparent opacity-80" />

                        {/* Logo */}
                        <div className="flex justify-center mb-6">
                            <div className="relative w-16 h-16">
                                <Image src="/favicon.ico" alt="EduSpine" fill className="object-contain" />
                            </div>
                        </div>

                        <p className="text-[#53389e] text-xs tracking-[0.4em] uppercase font-bold mb-3">
                            EduSpine presents
                        </p>

                        <h2 className="text-2xl md:text-4xl font-black text-white tracking-widest uppercase mb-1">
                            Certificate of Participation
                        </h2>

                        <div className="my-6 h-px bg-gradient-to-r from-transparent via-[#53389e]/60 to-transparent" />

                        <p className="text-gray-400 text-sm tracking-wider mb-2">This certifies that</p>

                        <div className="inline-block bg-[#53389e]/10 border border-[#53389e]/40 px-8 py-4 rounded-xl mb-6 shadow-[0_0_20px_rgba(83,56,158,0.15)]">
                            <p className="font-mono text-[#53389e] font-black text-2xl md:text-3xl tracking-widest">
                                {teamId}
                            </p>
                        </div>

                        <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-6">
                            has successfully participated in the <span className="text-white font-bold">EduSpine Hackathon</span> and demonstrated
                            commendable skills, creativity, and dedication throughout the event.
                        </p>

                        <div className="my-6 h-px bg-gradient-to-r from-transparent via-[#53389e]/60 to-transparent" />

                        <div className="flex justify-between items-end px-4">
                            <div className="text-left">
                                <p className="text-gray-500 text-xs tracking-widest uppercase mb-1">Date Issued</p>
                                <p className="text-white font-bold text-sm">{today}</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 relative mx-auto mb-1">
                                    <Image src="/favicon.ico" alt="EduSpine Seal" fill className="object-contain opacity-30" />
                                </div>
                                <p className="text-[#53389e] text-xs font-bold tracking-widest uppercase">Official Seal</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-500 text-xs tracking-widest uppercase mb-1">Authorized by</p>
                                <p className="text-white font-bold text-sm">EduSpine Team</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Download Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <motion.button
                        onClick={handleDownload}
                        whileHover={{ scale: 1.07 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-[#53389e] to-[#7c3aed] text-white font-black tracking-widest uppercase px-10 py-4 rounded-full shadow-[0_0_30px_rgba(83,56,158,0.5)] hover:shadow-[0_0_50px_rgba(83,56,158,0.8)] transition-all duration-300 text-base border border-[#53389e]/60"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Certificate
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
}
