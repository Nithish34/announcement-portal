"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Lock, Unlock, MonitorCheck } from 'lucide-react';
import RewardTransition from '@/components/RewardTransition';
import LoserRewardTransition from '@/components/LoserRewardTransition';
import DynamicBackground from '@/components/DynamicBackground';

const MAX_SLOTS = 20;

const mockTeams = [
  { id: 'TEAM-001', name: 'Code Warriors', members: 4 },
  { id: 'TEAM-002', name: 'Hack Masters', members: 4 },
  { id: 'TEAM-003', name: 'Dev Ninjas', members: 5 },
  { id: 'TEAM-004', name: 'Binary Beasts', members: 4 },
  { id: 'TEAM-005', name: 'Pixel Pirates', members: 3 }, // Total: 20 members (Exactly filled)
  { id: 'TEAM-006', name: 'Logic Lords', members: 4 },   // Exceeds 20, will be eliminated
  { id: 'TEAM-007', name: 'Byte Me', members: 5 }        // Exceeds 20, will be eliminated
];

// Dynamically calculate winners based on the slot limit
const evaluatedTeams = (() => {
  let currentMembers = 0;
  return mockTeams.map(team => {
    const isWinner = currentMembers + team.members <= MAX_SLOTS;
    if (isWinner) {
      currentMembers += team.members;
    }
    return { ...team, isWinner };
  });
})();

export default function Results() {
  const [showShutter, setShowShutter] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [visibleTeams, setVisibleTeams] = useState<typeof evaluatedTeams>([]);
  const [currentWinner, setCurrentWinner] = useState<typeof evaluatedTeams[0] | null>(null);
  const [currentFilledSlots, setCurrentFilledSlots] = useState(0);
  const [announcedWinnerIds, setAnnouncedWinnerIds] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showTransition, setShowTransition] = useState(false);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [evaluationComplete, setEvaluationComplete] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  // Use logged in user's teamId or default to TEAM-003 for testing
  const userTeam = evaluatedTeams.find(t => t.id === (user?.teamId || 'TEAM-003'));

  const isUserWinner = userTeam?.isWinner ?? false;
  const isWinnerRef = useRef(isUserWinner);

  useEffect(() => {
    isWinnerRef.current = isUserWinner;
  }, [isUserWinner]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  useEffect(() => {
    let unmounted = false;

    const runSequence = async () => {
      // 1. Shutter Phase
      await new Promise(r => setTimeout(r, 2000));
      if (unmounted) return;
      setShowShutter(false);
      setShowContent(true);

      setVisibleTeams(evaluatedTeams);

      await new Promise(r => setTimeout(r, 600));
      if (unmounted) return;

      const winners = evaluatedTeams.filter(t => t.isWinner);

      for (let i = 0; i < winners.length; i++) {
        const winner = winners[i];

        setTimeLeft(30);

        await new Promise(r => setTimeout(r, 1000));
        if (unmounted) return;

        setCurrentWinner(winner);

        // Big Popup Time
        await new Promise(r => setTimeout(r, 5000));
        if (unmounted) return;

        setCurrentWinner(null);
        setCurrentFilledSlots(prev => prev + winner.members);
        setAnnouncedWinnerIds(prev => [...prev, winner.id]);

        if (userTeam?.id === winner.id) {
          setIsUnlocked(true);
        }

        // Wait the remaining 24s from the 30s cycle
        await new Promise(r => setTimeout(r, 24000));
        if (unmounted) return;
      }

      setTimeLeft(null);
      setEvaluationComplete(true);

      if (!isUserWinner) {
        setIsUnlocked(true);
      }
    };

    runSequence();

    return () => {
      unmounted = true;
    };
  }, [router, isUserWinner, userTeam?.id]);

  const handleNext = () => {
    if (!isUnlocked) return;
    setShowTransition(true);
  };

  return (
    <>
      <div className="min-h-screen relative overflow-hidden bg-[#050508]">
        <DynamicBackground />

        <AnimatePresence>
          {showShutter && (
            <>
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="fixed top-0 left-0 right-0 h-1/2 bg-black z-50 origin-top"
              />
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="fixed bottom-0 left-0 right-0 h-1/2 bg-black z-50 origin-bottom"
              />
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {currentWinner && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
            >
              <div className="bg-gradient-to-br from-[#111] to-[#000] border-4 border-[#ffd700] rounded-3xl p-8 lg:p-12 text-center shadow-[0_0_100px_rgba(255,215,0,0.6)] max-w-2xl w-[80%] mx-auto relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                <Trophy className="w-20 h-20 md:w-32 md:h-32 text-[#ffd700] mx-auto mb-6 drop-shadow-[0_0_20px_rgba(255,215,0,1)]" />
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] to-white drop-shadow-xl mb-4 uppercase tracking-wider">
                  {currentWinner.name}
                </h2>
                <p className="text-[#ffd700] text-lg md:text-2xl font-mono tracking-[0.5em] uppercase font-bold">Slot Secured!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="relative z-10 min-h-screen p-4 md:p-8 pb-32 max-w-7xl mx-auto"
            >
              {/* Header Title with Trophy */}
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-6"
              >
                <Trophy className="w-12 h-12 md:w-16 md:h-16 text-[#53389e] mx-auto mb-3 drop-shadow-[0_0_15px_rgba(83,56,158,0.8)]" />
                <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[#53389e] mb-1 drop-shadow-lg tracking-widest uppercase">
                  OPERATIVE COMMAND
                </h1>
                <p className="text-[#a855f7] text-[10px] md:text-xs font-semibold tracking-wider uppercase">SECTOR 7 | DEPLOYMENT ACTIVE</p>
              </motion.div>

              {/* Dashboard Header Style based on image reference */}
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-6 lg:gap-8"
              >
                {/* Left Stats Block */}
                <div className="flex flex-col gap-3 w-full lg:w-1/3">
                  <div className="bg-[#0f0f13]/90 backdrop-blur border border-white/5 rounded-xl p-3 md:p-4 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col items-start relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#53389e]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
                      <Users className="w-3 h-3 text-[#a855f7]" /> Total Teams
                    </div>
                    <div className="text-xl md:text-2xl font-black text-[#e2e8f0] font-mono tracking-widest">{mockTeams.length}</div>
                  </div>

                  <div className="bg-[#0f0f13]/90 backdrop-blur border border-[#10b981]/20 rounded-xl p-3 md:p-4 shadow-[0_8px_30px_rgba(16,185,129,0.05)] flex flex-col items-start relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#10b981] shadow-[0_0_15px_#10b981]" />
                    <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
                      <MonitorCheck className="w-3 h-3 text-[#10b981]" /> Network Status
                    </div>
                    <div className="text-lg md:text-xl font-black text-[#10b981] tracking-widest uppercase origin-left animate-pulse">
                      OPTIMAL
                    </div>
                  </div>
                </div>

                {/* Center Timer Block */}
                <div className="flex flex-col items-center justify-center w-full lg:w-1/3 py-2">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="46" stroke="#1c1132" strokeWidth="3" fill="none" />
                    </svg>
                    <svg className="absolute inset-0 w-full h-full -rotate-90 origin-center" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        stroke="#a855f7"
                        strokeWidth="5"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray="289.02"
                        strokeDashoffset={timeLeft !== null ? 289.02 - (timeLeft / 30) * 289.02 : 0}
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <div className="text-center z-10 bg-[#0f0f13]/80 w-24 h-24 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center border border-white/5 backdrop-blur-sm">
                      <div className="text-2xl md:text-3xl font-black text-white font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        00:{timeLeft !== null ? timeLeft.toString().padStart(2, '0') : '00'}
                      </div>
                      <div className="text-[8px] md:text-[9px] text-gray-400 uppercase tracking-widest mt-1 font-bold">Seconds Left</div>
                    </div>
                  </div>

                  <div className="mt-4 text-center bg-[#0f0f13]/90 backdrop-blur px-5 py-3 rounded-xl border border-white/5 w-full max-w-[200px] shadow-lg relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#a855f7] to-transparent opacity-50" />
                    <div className="text-[9px] text-[#a855f7] font-bold tracking-[0.2em] uppercase mb-1">Process Action</div>
                    <div className="text-lg md:text-xl font-black text-white uppercase tracking-[0.3em] drop-shadow-sm">
                      SLOT-{currentFilledSlots.toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>

                {/* Right Stats Block */}
                <div className="flex flex-col gap-3 w-full lg:w-1/3">
                  <div className="bg-[#0f0f13]/90 backdrop-blur border border-white/5 rounded-xl p-3 md:p-4 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col items-end relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-l from-[#53389e]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">Objective</div>
                    <div className="text-lg md:text-xl font-black text-white tracking-widest uppercase text-right">EVALUATION-1</div>
                  </div>

                  <div className="bg-[#0f0f13]/90 backdrop-blur border border-[#53389e]/20 rounded-xl p-3 md:p-4 shadow-[0_8px_30px_rgba(83,56,158,0.05)] flex justify-between items-center relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#53389e] shadow-[0_0_15px_#53389e]" />
                    <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Slots Filled</div>
                    <div className="text-xl md:text-2xl font-black text-[#53389e] font-mono tracking-wider">{currentFilledSlots} / {MAX_SLOTS}</div>
                  </div>
                </div>
              </motion.div>

              {/* Main Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10 mt-8">
                <AnimatePresence>
                  {visibleTeams.map((team) => {
                    const isUserTeam = team.id === userTeam?.id;
                    const isAnnouncedWinner = announcedWinnerIds.includes(team.id);

                    return (
                      <motion.div
                        layout
                        key={team.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, y: -50 }}
                        transition={{ duration: 0.5, layout: { duration: 0.5 } }}
                        className={`relative p-3 rounded-xl backdrop-blur-xl transition-all flex items-center gap-3 group overflow-hidden ${isAnnouncedWinner
                          ? 'bg-[#14121a] border-2 border-[#ffd700] shadow-[0_0_25px_rgba(255,215,0,0.2)]'
                          : isUserTeam ? 'bg-gradient-to-br from-[#1a1528] to-[#2d1b4e] border border-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                            : 'bg-[#0f0f13]/80 border border-white/5 hover:border-white/10'
                          }`}
                      >
                        {isUserTeam && isAnnouncedWinner && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent opacity-80" />
                        )}

                        {isUserTeam && !isAnnouncedWinner && (
                          <div className="absolute top-0 right-0 px-3 py-1 bg-[#a855f7] text-white text-[9px] font-black uppercase tracking-widest rounded-bl-lg">
                            Your Team
                          </div>
                        )}

                        {/* Icon Square */}
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${isAnnouncedWinner ? 'bg-gradient-to-br from-[#ffd700]/20 to-[#ffd700]/5 border border-[#ffd700]/50' : isUserTeam ? 'bg-gradient-to-br from-[#a855f7]/20 to-[#a855f7]/5 border border-[#a855f7]/30' : 'bg-[#1a1a24] border border-white/5'}`}>
                          <Users className={`w-5 h-5 md:w-6 md:h-6 ${isAnnouncedWinner ? 'text-[#ffd700] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]' : isUserTeam ? 'text-[#a855f7]' : 'text-gray-500'}`} />
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm md:text-base font-black tracking-widest uppercase truncate ${isAnnouncedWinner ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] to-white drop-shadow-sm' : 'text-gray-200 group-hover:text-white transition-colors'}`}>
                            {team.name}
                          </h3>
                          <div className="text-[10px] text-gray-500 tracking-widest font-mono uppercase mt-0.5">ID: {team.id}</div>

                          <div className="flex items-center gap-2 mt-2">
                            <div className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${isAnnouncedWinner ? 'bg-[#10b981] text-[#10b981]' : 'bg-gray-600'}`}></div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${isAnnouncedWinner ? 'text-[#10b981]' : 'text-gray-500'}`}>
                              {isAnnouncedWinner ? 'Slot Secured' : 'Awaiting Output'}
                            </span>
                          </div>
                        </div>

                        {/* Member Count Pill */}
                        <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-black ${isAnnouncedWinner ? 'bg-[#ffd700]/10 border-[#ffd700]/30 text-[#ffd700]' : 'bg-black/40 border-white/5 text-gray-400'}`}>
                          {team.members} MEM
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="fixed bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-[#050508] via-[#050508]/90 to-transparent z-[90] flex justify-end"
          >
            <button
              onClick={handleNext}
              disabled={!isUnlocked}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-sm md:text-lg tracking-widest transition-all duration-300 uppercase
                 ${isUnlocked
                  ? (isUserWinner ? 'bg-[#53389e] text-[#ffffff] shadow-[0_0_40px_rgba(83,56,158,0.4)] hover:scale-105 hover:bg-violet-400' : 'bg-[#a855f7] text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 hover:bg-[#b06bf6]')
                  : 'bg-[#0f0f13] text-gray-500 border border-white/10 cursor-not-allowed opacity-80 backdrop-blur-md'}`}
            >
              {isUnlocked ? (
                <>
                  Proceed to Next Phase
                  <Unlock className="w-5 h-5 md:w-6 md:h-6" />
                </>
              ) : (
                <>
                  Lock Engaged
                  <Lock className="w-5 h-5 md:w-6 md:h-6" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>

      {showTransition && isWinnerRef.current && (
        <RewardTransition onComplete={() => router.push('/eval-2')} />
      )}
      {showTransition && !isWinnerRef.current && (
        <LoserRewardTransition onComplete={() => router.push('/better-luck')} />
      )}
    </>
  );
}