"use client";

import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, Trophy, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DynamicBackground from '@/components/DynamicBackground';

export default function Eval2() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <DynamicBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl w-full"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="inline-flex items-center justify-center w-36 h-36 bg-gradient-to-br from-[#53389e] to-fuchsia-500 rounded-full mb-8 shadow-[0_0_40px_rgba(83,56,158,0.6)] border-4 border-[#000000]"
            >
              <CheckCircle className="w-24 h-24 text-white" />
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              className="inline-block bg-[#000000]/60 backdrop-blur-md border border-[#53389e] text-[#53389e] px-10 py-3 rounded-full font-black text-2xl mb-8 shadow-[0_0_20px_rgba(83,56,158,0.3)] uppercase tracking-widest"
            >
              ACCESS GRANTED
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[#53389e] mb-4 drop-shadow-md uppercase tracking-wider">
              CONGRATULATIONS!
            </h1>
            <p className="text-[#53389e] text-xl md:text-2xl mb-4 font-semibold tracking-wide drop-shadow-[0_0_2px_rgba(83,56,158,0.5)]">
              You've Advanced to Evaluation Round 2
            </p>
            <div className="inline-block bg-white/5 border border-white/10 px-6 py-2 rounded-lg">
              <span className="text-gray-400 mr-2 tracking-widest text-sm font-semibold">TEAM ID:</span>
              <span className="font-mono text-[#53389e] text-lg font-black">{user?.teamId || 'TEAM-001'}</span>
            </div>
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
              <Trophy className="w-10 h-10 text-[#53389e]" />
              <h2 className="text-3xl font-black text-white tracking-widest uppercase">Next Steps</h2>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-start gap-5 p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-[#53389e]/10 hover:border-[#53389e]/40 transition-colors"
              >
                <div className="bg-[#53389e]/20 p-3 rounded-lg border border-[#53389e]/50 shadow-inner">
                  <Calendar className="w-7 h-7 text-[#53389e]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#53389e] font-bold text-lg tracking-wider mb-2">Schedule Your Interview</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    You will receive an email within 24 hours with available time slots for your 1-on-1 HR interview.
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
                  <Clock className="w-7 h-7 text-[#53389e]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#53389e] font-bold text-lg tracking-wider mb-2">Interview Duration</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    The interview will last approximately 45-60 minutes and will cover technical skills, problem-solving abilities, and team collaboration.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex items-start gap-5 p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-[#53389e]/10 hover:border-[#53389e]/40 transition-colors"
              >
                <div className="bg-[#53389e]/20 p-3 rounded-lg border border-[#53389e]/50 shadow-inner">
                  <Star className="w-7 h-7 text-[#53389e]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#53389e] font-bold text-lg tracking-wider mb-2">Prepare for Success</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Review your hackathon project, prepare to discuss your approach, challenges overcome, and lessons learned.
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
              className="text-[#53389e] text-sm tracking-[0.4em] mb-10 font-bold"
            >
              CHECK YOUR EMAIL FOR FURTHER INSTRUCTIONS
            </motion.div>

            <motion.button
              onClick={() => router.push('/timer-2')}
              whileHover={{ scale: 1.05, textShadow: "0px 0px 8px rgb(0,0,0)" }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center justify-center gap-3 mx-auto bg-gradient-to-r from-[#53389e] to-[#3e1c84] text-white px-10 py-5 rounded-full font-black text-xl shadow-[0_0_20px_rgba(83,56,158,0.4)] hover:shadow-[0_0_40px_rgba(83,56,158,0.6)] transition-all uppercase tracking-widest w-full md:w-auto"
            >
              Proceed to Phase 2
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
