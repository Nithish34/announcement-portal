"use client";

import { motion } from 'framer-motion';
import { Heart, Lightbulb, Users, Award } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import DynamicBackground from '@/components/DynamicBackground';
import { useRouter } from 'next/navigation';

export default function BetterLuck() {
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
          className="max-w-4xl w-full"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-[#53389e]/20 to-orange-500/10 rounded-full mb-8 border-2 border-[#53389e]"
            >
              <Heart className="w-16 h-16 text-[#53389e] drop-shadow-[0_0_15px_rgba(83,56,158,0.8)]" />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[#53389e] mb-4 drop-shadow-md tracking-widest uppercase">
              Thank You for Participating
            </h1>
            <p className="text-[#53389e] text-lg mb-6 font-semibold tracking-wider">
              Your journey in this hackathon has been valuable
            </p>
            <div className="inline-block bg-[#000000]/60 backdrop-blur-md border border-[#53389e]/30 px-6 py-3 rounded-full shadow-[0_0_20px_rgba(83,56,158,0.2)]">
              <span className="text-gray-300 mr-2 tracking-widest text-sm font-semibold">TEAM ID:</span>
              <span className="font-mono text-[#53389e] font-black text-lg">{user?.teamId || 'TEAM-001'}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-[#000000]/60 backdrop-blur-xl border border-[#53389e]/30 shadow-[0_0_30px_rgba(83,56,158,0.1)] rounded-2xl p-8 md:p-10 mb-8 relative overflow-hidden"
          >
            {/* Accent glow line inside card */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#53389e] to-transparent opacity-60" />

            <h2 className="text-2xl md:text-3xl font-black text-white mb-8 text-center uppercase tracking-widest">
              A Message From Our Team
            </h2>

            <p className="text-gray-300 text-center text-base mb-8 leading-relaxed max-w-xl mx-auto">
              We have a heartfelt message for you from the EduSpine team. Click below to watch it.
            </p>

            <div className="flex justify-center">
              <motion.button
                onClick={() => router.push('/better-luck/video')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#53389e] to-[#7c3aed] text-white font-black tracking-widest uppercase px-10 py-4 rounded-full shadow-[0_0_30px_rgba(83,56,158,0.5)] hover:shadow-[0_0_50px_rgba(83,56,158,0.8)] transition-all duration-300 text-base border border-[#53389e]/60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Our Message
              </motion.button>
            </div>

            <p className="text-[#53389e] text-center text-lg italic font-medium tracking-wide mt-8">
              "Every experience is a stepping stone to success. Keep building, keep learning."
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="grid md:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-[#000000]/60 backdrop-blur-md border border-[#53389e]/20 rounded-xl p-6 text-center hover:bg-[#53389e]/10 hover:border-[#53389e]/50 transition-colors">
              <Lightbulb className="w-12 h-12 text-[#53389e] mx-auto mb-4 drop-shadow-[0_0_10px_rgba(83,56,158,0.5)]" />
              <h3 className="text-white font-bold tracking-wider uppercase mb-2">Keep Learning</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Every challenge is an opportunity to grow your skills
              </p>
            </div>

            <div className="bg-[#000000]/60 backdrop-blur-md border border-[#53389e]/20 rounded-xl p-6 text-center hover:bg-[#53389e]/10 hover:border-[#53389e]/50 transition-colors">
              <Users className="w-12 h-12 text-[#53389e] mx-auto mb-4 drop-shadow-[0_0_10px_rgba(83,56,158,0.5)]" />
              <h3 className="text-white font-bold tracking-wider uppercase mb-2">Stay Connected</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Join our community and network with fellow developers
              </p>
            </div>

            <div className="bg-[#000000]/60 backdrop-blur-md border border-[#53389e]/20 rounded-xl p-6 text-center hover:bg-[#53389e]/10 hover:border-[#53389e]/50 transition-colors">
              <Award className="w-12 h-12 text-[#53389e] mx-auto mb-4 drop-shadow-[0_0_10px_rgba(83,56,158,0.5)]" />
              <h3 className="text-white font-bold tracking-wider uppercase mb-2">Try Again</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Watch for announcements about our next hackathon
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
