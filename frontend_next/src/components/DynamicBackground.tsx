"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function DynamicBackground() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="fixed inset-0 bg-[#000000] z-[-1]" />;

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#000000]">
            {/* Base gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(83,56,158,0.15),_rgba(0,0,0,1)_80%)]" />

            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage: 'linear-gradient(#53389e 1px, transparent 1px), linear-gradient(90deg, #53389e 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
                    transformOrigin: 'top center'
                }}
            />

            {/* Animated Glowing Orbs (Violet) */}
            <motion.div
                animate={{
                    x: [0, 100, -100, 0],
                    y: [0, -100, 100, 0],
                    scale: [1, 1.2, 0.8, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-[#53389e] rounded-full mix-blend-screen filter blur-[120px] opacity-40"
            />

            <motion.div
                animate={{
                    x: [0, -150, 150, 0],
                    y: [0, 150, -150, 0],
                    scale: [1, 1.5, 0.9, 1],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-[#53389e] rounded-full mix-blend-screen filter blur-[100px] opacity-30"
            />

            {/* Floating Gold Particles */}
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                        opacity: Math.random() * 0.5 + 0.1,
                        scale: Math.random() * 2,
                    }}
                    animate={{
                        y: [null, Math.random() * -500],
                        opacity: [null, 0],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 5,
                    }}
                    className="absolute w-1 h-1 bg-[#53389e] rounded-full shadow-[0_0_10px_#53389e]"
                />
            ))}

            {/* Vignette */}
            <div className="absolute inset-0 bg-[#000000] opacity-40 mix-blend-multiply pointer-events-none" />
        </div>
    );
}
