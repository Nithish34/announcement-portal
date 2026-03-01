"use client";

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import DynamicBackground from '@/components/DynamicBackground';

export default function BetterLuck2Video() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoEnded, setVideoEnded] = useState(false);
    const [playing, setPlaying] = useState(false);
    const router = useRouter();

    const handlePlay = () => {
        videoRef.current?.play();
        setPlaying(true);
    };

    const handleEnded = () => {
        setVideoEnded(true);
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
                        A Message For You
                    </h1>
                    <p className="text-[#53389e] text-sm md:text-base mt-2 font-semibold tracking-widest uppercase">
                        From the EduSpine Team
                    </p>
                </motion.div>

                {/* Video Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="w-full max-w-3xl bg-[#000000]/70 backdrop-blur-xl border border-[#53389e]/30 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(83,56,158,0.2)] relative"
                >
                    {/* Top glow bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#53389e] to-transparent opacity-60 z-10" />

                    <div className="relative aspect-video bg-black">
                        {/* Actual video — replace src with real video path */}
                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            onEnded={handleEnded}
                            playsInline
                            controls={playing}
                        >
                            {/* Replace the src below with the actual video file path */}
                            <source src="/videos/better-luck-2-message.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>

                        {/* Play overlay — shown before user clicks play */}
                        <AnimatePresence>
                            {!playing && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm gap-5"
                                >
                                    <div className="w-20 h-20 border-2 border-[#53389e] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(83,56,158,0.6)]">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-10 h-10 text-[#53389e] ml-1"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                    <motion.button
                                        onClick={handlePlay}
                                        whileHover={{ scale: 1.07 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-gradient-to-r from-[#53389e] to-[#7c3aed] text-white font-black tracking-widest uppercase px-8 py-3 rounded-full shadow-[0_0_30px_rgba(83,56,158,0.5)] hover:shadow-[0_0_50px_rgba(83,56,158,0.8)] transition-all duration-300 text-sm"
                                    >
                                        Play Message
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Certificate Button — appears after video ends */}
                <AnimatePresence>
                    {videoEnded && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col items-center gap-3 text-center"
                        >
                            <p className="text-gray-300 text-sm tracking-wider">
                                We hope that message inspired you. Your certificate awaits!
                            </p>
                            <motion.button
                                onClick={() => router.push('/better-luck-2/certificate')}
                                whileHover={{ scale: 1.07 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#53389e] to-[#7c3aed] text-white font-black tracking-widest uppercase px-10 py-4 rounded-full shadow-[0_0_30px_rgba(83,56,158,0.5)] hover:shadow-[0_0_50px_rgba(83,56,158,0.8)] transition-all duration-300 text-base border border-[#53389e]/60"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                View My Certificate
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Skip option */}
                {playing && !videoEnded && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 5 }}
                        onClick={() => setVideoEnded(true)}
                        className="text-gray-500 text-xs tracking-widest uppercase hover:text-[#53389e] transition-colors underline underline-offset-4"
                    >
                        Skip to Certificate
                    </motion.button>
                )}
            </div>
        </div>
    );
}
