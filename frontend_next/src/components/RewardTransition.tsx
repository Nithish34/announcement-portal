"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Star } from 'lucide-react';

interface RewardTransitionProps {
    onComplete?: () => void;
}

export default function RewardTransition({ onComplete }: RewardTransitionProps) {
    const [phase, setPhase] = useState<'idle' | 'shaking' | 'opening' | 'opened'>('idle');

    const onCompleteRef = React.useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        // 0.5s: Start shaking the gift
        const shakeTimer = setTimeout(() => setPhase('shaking'), 500);
        // 3.0s: The gift bursts open with particles and glow
        const openingTimer = setTimeout(() => setPhase('opening'), 3000);
        // 4.5s: Reveal the text content
        const openedTimer = setTimeout(() => setPhase('opened'), 4500);

        // 6.5s: Finish the transition
        const completeTimer = setTimeout(() => {
            if (onCompleteRef.current) onCompleteRef.current();
        }, 6500);

        return () => {
            clearTimeout(shakeTimer);
            clearTimeout(openingTimer);
            clearTimeout(openedTimer);
            clearTimeout(completeTimer);
        };
    }, []);

    // Pre-calculate particle properties for performance
    const particles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        angle: (i * 360) / 30,
        delay: Math.random() * 0.2,
        speed: Math.random() * 150 + 150
    }));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden">
            {/* Expanding background light when opening */}
            <motion.div
                animate={{
                    scale: phase === 'opening' || phase === 'opened' ? [1, 5, 10] : 1,
                    opacity: phase === 'opening' ? [0, 1, 0] : 0
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 bg-[radial-gradient(circle,rgba(83,56,158,0.3)_0%,transparent_50%)]"
            />

            <div className="relative flex flex-col items-center">
                {/* The Gift Box */}
                <AnimatePresence>
                    {phase !== 'opened' && (
                        <motion.div
                            key="gift-box"
                            initial={{ scale: 0, y: 50 }}
                            animate={
                                phase === 'shaking' ? {
                                    scale: 1.2,
                                    y: 0,
                                    rotate: [-5, 5, -5, 5, -8, 8, -5, 5, 0],
                                    transition: { repeat: Infinity, duration: 0.6, repeatDelay: 0.4 }
                                } : phase === 'opening' ? {
                                    scale: [1.2, 1.8, 0],
                                    filter: ['brightness(1)', 'brightness(5)', 'brightness(20)'],
                                    opacity: [1, 1, 0],
                                    transition: { duration: 0.6 }
                                } : { scale: 1, y: 0 }
                            }
                            exit={{ opacity: 0, scale: 0 }}
                            className="relative z-10"
                        >
                            <Gift className="w-32 h-32 md:w-48 md:h-48 text-[#53389e] drop-shadow-[0_0_30px_rgba(83,56,158,0.8)]" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Explosion Particles */}
                {phase === 'opening' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        {particles.map((p) => (
                            <motion.div
                                key={p.id}
                                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                                animate={{
                                    x: Math.cos((p.angle * Math.PI) / 180) * p.speed,
                                    y: Math.sin((p.angle * Math.PI) / 180) * p.speed,
                                    scale: Math.random() * 1.5 + 0.5,
                                    opacity: 0,
                                    rotate: 360
                                }}
                                transition={{ duration: 1.2, delay: p.delay, ease: "easeOut" }}
                                className="absolute text-[#53389e]"
                            >
                                <Star className={`w-${Math.floor(Math.random() * 4 + 4)} h-${Math.floor(Math.random() * 4 + 4)} fill-current`} />
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Revealed Content Text */}
                <AnimatePresence>
                    {phase === 'opened' && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
                            className="text-center z-30 px-4"
                        >
                            <div className="inline-block relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute -inset-10 border border-[#53389e]/20 rounded-full border-dashed"
                                />
                                <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#53389e] to-orange-300 mb-6 tracking-widest drop-shadow-[0_0_15px_rgba(83,56,158,0.6)] uppercase">
                                    REWARD UNLOCKED
                                </h2>
                            </div>
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="text-gray-300 tracking-[0.3em] uppercase text-sm font-semibold mt-8"
                            >
                                Transporting to your reward...
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
