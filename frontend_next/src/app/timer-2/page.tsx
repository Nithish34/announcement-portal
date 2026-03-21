"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Lock, ShieldAlert, Github } from 'lucide-react';
import TransitionLoader from '@/components/TransitionLoader';
import DynamicBackground from '@/components/DynamicBackground';
import MovingBanner from '@/components/MovingBanner';
import DecryptingText from '@/components/DecryptingText';
import { useAuth } from '@/context/AuthContext';

export default function Timer2() {
    const [targetDate, setTargetDate] = useState<Date | null>(null);
    const [seconds, setSeconds] = useState<number | null>(null);
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const { user } = useAuth();
    
    // Reveal states
    const [showTimer, setShowTimer] = useState(false);

    // Fetch phase2_start_datetime from backend on mount
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/config/timers`)
            .then(r => r.json())
            .then(data => {
                if (data.phase2_start_datetime) {
                    const target = new Date(data.phase2_start_datetime);
                    setTargetDate(target);
                    setSeconds(Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000)));
                } else {
                    setSeconds(0); 
                }
            })
            .catch(() => setSeconds(0));
            
        // Trigger reveal sequence
        setTimeout(() => setShowTimer(true), 6000);
    }, []);

    // Tick every second
    useEffect(() => {
        if (seconds === null) return;
        router.prefetch('/results-2');

        if (seconds <= 0) {
            setIsRedirecting(true);
            router.replace('/results-2');
            return;
        }

        const timer = setInterval(() => {
            if (targetDate) {
                const remaining = Math.max(0, Math.floor((targetDate.getTime() - Date.now()) / 1000));
                setSeconds(remaining);
            } else {
                setSeconds(prev => (prev !== null ? Math.max(0, prev - 1) : 0));
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds, targetDate, router]);

    const s = seconds ?? 0;
    const days = Math.floor(s / (3600 * 24));
    const hours = Math.floor((s % (3600 * 24)) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const secs = s % 60;

    const formatTime = (num: number): string => String(num).padStart(2, '0');

    const TimerCircle = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center mx-2 md:mx-4">
            <div className="relative flex items-center justify-center w-20 h-20 md:w-28 md:h-28 rounded-full mb-3 bg-black/40 backdrop-blur-md shadow-neon-violet">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="48" stroke="#53389e" strokeOpacity="0.3" strokeWidth="2" fill="none" />
                </svg>
                <svg className="absolute inset-0 w-full h-full animate-[spin_4s_linear_infinite]" viewBox="0 0 100 100">
                    <circle
                        cx="50" cy="50" r="48"
                        stroke="url(#neonVioletGradient)"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="90 210"
                        strokeLinecap="round"
                    />
                </svg>
                <svg width="0" height="0">
                    <defs>
                        <linearGradient id="neonVioletGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#53389e" />
                            <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>
                    </defs>
                </svg>
                <motion.div
                    key={`${label}-${value}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-3xl md:text-4xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#53389e]"
                >
                    {formatTime(value)}
                </motion.div>
            </div>
            <div className="text-[10px] md:text-xs text-neon-violet tracking-[0.3em] uppercase font-bold">
                {label}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-black-true">
            <DynamicBackground />
            <MovingBanner direction="left" className="absolute top-0 left-0 right-0 z-50 opacity-80" />
            <MovingBanner direction="right" className="absolute bottom-0 left-0 right-0 z-50 opacity-80" />

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
                {/* Left Side: Ghost Protocol Reveal */}
                <div className="bg-black/80 backdrop-blur-xl border border-neon-violet p-8 rounded-2xl shadow-neon-violet h-full flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20 pointer-events-none" />
                    
                    <div className="flex items-center gap-4 mb-6 border-b border-neon-violet/30 pb-4 relative z-10">
                        <ShieldAlert className="w-8 h-8 text-neon-violet animate-pulse" />
                        <h2 className="text-2xl font-black tracking-widest text-white uppercase">
                            <DecryptingText text="GHOST PROTOCOL ACTIVATED" delay={500} duration={1500} />
                        </h2>
                    </div>
                    
                    <div className="space-y-6 font-mono relative z-10">
                        <div>
                            <p className="text-gray-500 text-xs mb-1 uppercase tracking-widest">Operative Status</p>
                            <p className="text-lg text-white">
                                <DecryptingText text="REASSIGNMENT COMPLETE" delay={2000} duration={1000} />
                            </p>
                        </div>
                        
                        <div>
                            <p className="text-gray-500 text-xs mb-1 uppercase tracking-widest">New Designation (Team ID)</p>
                            <div className="bg-black border border-neon-violet/50 p-3 rounded-lg flex items-center shadow-[inset_0_0_10px_rgba(83,56,158,0.2)]">
                                <Lock className="w-4 h-4 text-neon-violet mr-3" />
                                <span className="text-xl font-bold text-neon-violet drop-shadow-[0_0_8px_rgba(83,56,158,0.8)]">
                                    <DecryptingText text={user?.teamId || "AWAITING ASSIGNMENT"} delay={3500} duration={1500} />
                                </span>
                            </div>
                        </div>

                        <div>
                            <p className="text-gray-500 text-xs mb-1 uppercase tracking-widest">Secure Workspace (GitHub)</p>
                            <div className="bg-black border border-neon-violet/50 p-3 rounded-lg flex items-center shadow-[inset_0_0_10px_rgba(83,56,158,0.2)]">
                                <Github className="w-4 h-4 text-white mr-3" />
                                <span className="text-sm font-bold text-white break-all">
                                    <DecryptingText text={`https://github.com/Nithish34/${user?.teamId || "repo-pending"}`} delay={5000} duration={1500} />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Timer */}
                <AnimatePresence>
                    {showTimer && (
                        <motion.div 
                            initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            transition={{ duration: 1, type: "spring" }}
                            className="relative group w-full flex justify-center cursor-crosshair h-full"
                        >
                            <div className="bg-black/60 backdrop-blur-2xl rounded-3xl border border-neon-violet p-8 shadow-neon-violet flex flex-col items-center w-full relative overflow-hidden transition-all duration-700">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-gradient-to-r from-transparent via-[#53389e] to-transparent opacity-80" />

                                <motion.div
                                    animate={{ opacity: [0.7, 1, 0.7] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="mb-6 flex justify-center"
                                >
                                    <Clock className="w-16 h-16 text-neon-violet" />
                                </motion.div>

                                <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[#53389e] mb-8 tracking-widest uppercase text-center drop-shadow-lg">
                                    FINAL EVALUATION IN
                                </h1>

                                <div className="flex flex-wrap items-center justify-center mb-8 gap-y-4">
                                    <TimerCircle value={days} label="DAYS" />
                                    <TimerCircle value={hours} label="HOURS" />
                                    <TimerCircle value={minutes} label="MINUTES" />
                                    <TimerCircle value={secs} label="SECONDS" />
                                </div>

                                <motion.div
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="text-neon-violet text-xs tracking-[0.4em] uppercase text-center font-bold"
                                >
                                    {isRedirecting ? "FINALIZING SECURE TUNNEL..." : "EVALUATING INDIVIDUAL PERFORMANCES..."}
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <TransitionLoader isVisible={isRedirecting} />
        </div>
    );
}
