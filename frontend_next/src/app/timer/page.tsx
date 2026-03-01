"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Lock } from 'lucide-react';
import DynamicBackground from '@/components/DynamicBackground';
import MovingBanner from '@/components/MovingBanner';
import TransitionLoader from '@/components/TransitionLoader';

export default function Timer() {
  const [seconds, setSeconds] = useState<number>(10);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/results');

    if (seconds <= 0) {
      setIsRedirecting(true);
      router.replace('/results');
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, router]);

  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const formatTime = (num: number): string => String(num).padStart(2, '0');

  const TimerCircle = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center mx-2 md:mx-4">
      <div className="relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-full mb-3 md:mb-4 bg-[#000000]/40 backdrop-blur-md shadow-[0_0_20px_rgba(83,56,158,0.1)]">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" stroke="#53389e" strokeOpacity="0.1" strokeWidth="2" fill="none" />
        </svg>
        <svg className="absolute inset-0 w-full h-full animate-[spin_4s_linear_infinite]" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="48"
            stroke="url(#goldGradient)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="90 210"
            strokeLinecap="round"
          />
        </svg>
        <svg width="0" height="0">
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#53389e" />
              <stop offset="100%" stopColor="#ff8c00" />
            </linearGradient>
          </defs>
        </svg>
        <motion.div
          key={`${label}-${value}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl md:text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-[#53389e] to-[#fff]"
        >
          {formatTime(value)}
        </motion.div>
      </div>
      <div className="text-xs md:text-sm text-[#53389e] tracking-[0.3em] uppercase font-bold drop-shadow-[0_0_5px_rgba(83,56,158,0.5)]">
        {label}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center">
      <DynamicBackground />
      <MovingBanner direction="left" className="absolute top-0 left-0 right-0 z-50 opacity-80" />
      <MovingBanner direction="right" className="absolute bottom-0 left-0 right-0 z-50 opacity-80" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-5xl mx-auto px-4 flex justify-center"
      >
        <div className="relative group w-full max-w-4xl flex justify-center cursor-crosshair">
          {/* Actual Timer Dashboard (Always running, hidden behind doors initially) */}
          <div className="bg-[#000000]/60 backdrop-blur-2xl rounded-3xl border border-[#53389e]/20 p-8 md:p-16 shadow-[0_0_60px_rgba(83,56,158,0.5)] flex flex-col items-center w-full relative overflow-hidden transition-all duration-700 group-hover:shadow-[0_0_80px_rgba(83,56,158,0.3)]">
            {/* subtle accent glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-gradient-to-r from-transparent via-[#53389e] to-transparent opacity-50" />

            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-8 flex justify-center drop-shadow-[0_0_15px_rgba(83,56,158,0.8)]"
            >
              <Clock className="w-20 h-20 text-[#53389e]" />
            </motion.div>

            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[#53389e] mb-8 md:mb-16 tracking-widest text-center uppercase drop-shadow-lg">
              RESULTS ANNOUNCEMENT IN
            </h1>

            <div className="flex flex-wrap items-center justify-center mb-12 gap-y-4">
              <TimerCircle value={days} label="DAYS" />
              <TimerCircle value={hours} label="HOURS" />
              <TimerCircle value={minutes} label="MINUTES" />
              <TimerCircle value={secs} label="SECONDS" />
            </div>

            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[#53389e] text-sm tracking-[0.4em] text-center font-bold"
            >
              PREPARING RESULTS...
            </motion.div>
          </div>

          {/* The Mystery Block Covers (Doors that slide apart on hover) */}
          <div className="absolute inset-0 z-20 flex overflow-hidden rounded-3xl pointer-events-none transition-all duration-1000 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
            {/* Left Door */}
            <div className="w-1/2 h-full bg-gradient-to-br from-[#111] via-[#1a1528] to-[#0a0a0f] border border-white/5 flex items-center justify-end pr-0 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-x-full">
              {/* Glowing edge */}
              <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#53389e] to-transparent opacity-70 shadow-[0_0_10px_#53389e]" />
            </div>
            {/* Right Door */}
            <div className="w-1/2 h-full bg-gradient-to-bl from-[#111] via-[#1a1528] to-[#0a0a0f] border border-white/5 flex items-center justify-start pl-0 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] delay-[50ms] group-hover:translate-x-full">
              {/* Glowing edge */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#53389e] to-transparent opacity-70 shadow-[0_0_10px_#53389e]" />
            </div>

            {/* Center Badge (Fades and scales up on hover to disappear) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-500 ease-in-out group-hover:opacity-0 group-hover:scale-[1.5] group-hover:blur-md text-[#53389e]">
              <div className="bg-[#050508] p-6 rounded-full border border-[#53389e]/40 shadow-[0_0_40px_rgba(83,56,158,0.3)] relative">
                <div className="absolute inset-0 rounded-full border border-dashed border-[#53389e]/60 animate-[spin_8s_linear_infinite]" />
                <Lock className="w-12 h-12 mb-1" />
              </div>
              <p className="text-[10px] md:text-sm font-mono tracking-[0.4em] font-black mt-6 uppercase drop-shadow-md text-white bg-black/60 px-6 py-2 rounded-full border border-white/10 shadow-lg">
                Hover to Reveal
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <TransitionLoader isVisible={isRedirecting} />
    </div>
  );
}