"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

interface TransitionLoaderProps {
  isVisible: boolean;
}

const techWords = ["PROCESSING...", "TESTING...", "FINALIZING..."];

export default function TransitionLoader({ isVisible }: TransitionLoaderProps) {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % techWords.length);
    }, 1200); // Change word every 1.2 seconds

    return () => clearInterval(interval);
  }, [isVisible]);

  // Generate random static background text map to avoid jump on re-render
  const grid = useMemo(() => {
    const rows = 40;
    const g = [];
    const chars = "10<>/{}[];:=+-_*&^%$#@!ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < rows; i++) {
      let rowString = "";
      for (let j = 0; j < 80; j++) {
        rowString += chars[Math.floor(Math.random() * chars.length)] + " ";
      }
      g.push({
        text: rowString,
        delay: Math.random() * 2,
        duration: 1.5 + Math.random() * 2,
        yOffset: Math.random() * 20 - 10
      });
    }
    return g;
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
        >
          {/* Coding Matrix Background */}
          <div className="absolute inset-0 overflow-hidden opacity-40 pointer-events-none text-[#53389e] font-mono text-lg whitespace-pre select-none flex flex-col justify-between" style={{ filter: 'blur(0.5px)' }}>
            {grid.map((row, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: row.yOffset }}
                animate={{ opacity: [0.1, 0.5, 0.1] }}
                transition={{ repeat: Infinity, duration: row.duration, delay: row.delay, ease: 'easeInOut' }}
              >
                {row.text}
              </motion.div>
            ))}
          </div>

          <div className="relative flex items-center justify-center">
            {/* Outer Glowing Violet Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute w-48 h-48 border-t-2 border-b-2 border-[#53389e] rounded-full shadow-[0_0_15px_rgba(83,56,158,0.5)] z-10"
            />

            {/* Central Eduspine Logo (SVG) */}
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="z-20 relative drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
              {/* 1. Top short dash */}
              <motion.line x1="55" y1="25" x2="85" y2="25" stroke="white" strokeWidth="8" strokeLinecap="round"
                animate={{ x: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }} />

              {/* 2. Second long line with dot on right */}
              <motion.g animate={{ x: [5, -5, 5] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                <line x1="25" y1="45" x2="80" y2="45" stroke="white" strokeWidth="8" strokeLinecap="round" />
                <circle cx="95" cy="45" r="8" fill="white" />
              </motion.g>

              {/* 3. Third medium dash */}
              <motion.line x1="25" y1="65" x2="65" y2="65" stroke="white" strokeWidth="8" strokeLinecap="round"
                animate={{ x: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} />

              {/* 4. Fourth long line with dot on left */}
              <motion.g animate={{ x: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}>
                <circle cx="25" cy="85" r="8" fill="white" />
                <line x1="40" y1="85" x2="95" y2="85" stroke="white" strokeWidth="8" strokeLinecap="round" />
              </motion.g>

              {/* 5. Bottom short dash */}
              <motion.line x1="25" y1="105" x2="50" y2="105" stroke="white" strokeWidth="8" strokeLinecap="round"
                animate={{ x: [6, -6, 6] }} transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }} />
            </svg>
          </div>

          {/* Animated Tech Words */}
          <div className="mt-16 h-8 relative z-20 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={wordIndex}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="absolute text-[#53389e] font-mono text-xl tracking-[0.2em] font-bold drop-shadow-[0_0_10px_rgba(83,56,158,0.8)]"
              >
                {techWords[wordIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}