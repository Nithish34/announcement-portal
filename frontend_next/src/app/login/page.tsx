"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, User } from 'lucide-react';
import DynamicBackground from '@/components/DynamicBackground';
import MovingBanner from '@/components/MovingBanner';

export default function Login() {
  const [teamId, setTeamId] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (teamId && password) {
      login(teamId, password);
      router.push('/timer');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <DynamicBackground />
      <MovingBanner direction="left" className="absolute top-0 left-0 right-0 z-50 opacity-80" />
      <MovingBanner direction="right" className="absolute bottom-0 left-0 right-0 z-50 opacity-80" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-[#000000]/60 backdrop-blur-xl border border-[#53389e]/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(83,56,158,0.1)]">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center justify-center mb-8 mt-2"
          >
            <h1 className="text-4xl font-black text-[#53389e] text-center mb-2 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(83,56,158,0.5)]">
              HACKATHON
            </h1>
            <p className="text-gray-300 text-center text-sm tracking-wider uppercase">Access Portal</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-center text-[#53389e] text-sm font-semibold mb-3 tracking-[0.2em]">
                TEAM ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full bg-[#000000]/70 border border-[#53389e]/30 rounded-xl px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#53389e] focus:ring-1 focus:ring-[#53389e] transition-all shadow-inner"
                  placeholder="Enter Team ID"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-center text-[#53389e] text-sm font-semibold mb-3 tracking-[0.2em]">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#000000]/70 border border-[#53389e]/30 rounded-xl px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#53389e] focus:ring-1 focus:ring-[#53389e] transition-all shadow-inner"
                  placeholder="Enter Password"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full mt-8 bg-gradient-to-r from-[#53389e] to-[#6b47c9] text-white font-black tracking-widest py-4 rounded-xl hover:from-[#6b47c9] hover:to-[#53389e] transition-all duration-300 shadow-[0_0_20px_rgba(83,56,158,0.4)]"
            >
              ACCESS PORTAL
            </motion.button>
          </form>

          <div className="mt-8 text-center pb-2">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[#53389e] text-xs tracking-[0.2em] font-bold"
            >
              SECURE CONNECTION ESTABLISHED
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
