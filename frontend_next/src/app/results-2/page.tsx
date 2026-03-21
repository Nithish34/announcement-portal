"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, User, Lock, Unlock } from 'lucide-react';
import TransitionLoader from '@/components/TransitionLoader';
import LoserRewardTransition from '@/components/LoserRewardTransition';
import DynamicBackground from '@/components/DynamicBackground';
import { getPhase2Results } from '@/lib/api';
import { socket } from '@/lib/socket';

interface IndividualData {
    id: string;
    email: string;
    role: string;
    result: 'WINNER' | 'LOSER' | null;
    team: { name: string };
}

export default function Results2() {
    const [individuals, setIndividuals] = useState<IndividualData[]>([]);
    const [showShutter, setShowShutter] = useState(true);
    const [showContent, setShowContent] = useState(false);

    const [visibleIndividuals, setVisibleIndividuals] = useState<IndividualData[]>([]);
    const [currentWinner, setCurrentWinner] = useState<IndividualData | null>(null);
    const [slottedCount, setSlottedCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const [isUnlocked, setIsUnlocked] = useState(false);
    const [evaluationComplete, setEvaluationComplete] = useState(false);
    const [showTransition, setShowTransition] = useState(false);

    const { user, isLoading } = useAuth();
    const router = useRouter();

    const userIndividualId = user?.id || '';
    const userIndividual = individuals.find(ind => ind.id === userIndividualId);
    const isUserTopPerformer = userIndividual?.result === 'WINNER';

    const isWinnerRef = useRef(isUserTopPerformer);
    // Track userIndividualId via ref so the async sequence reads the correct
    // value even when dep array doesn't include it
    const userIdRef = useRef(userIndividualId);
    const hasRunSequence = useRef(false);

    useEffect(() => {
        isWinnerRef.current = isUserTopPerformer;
        userIdRef.current = userIndividualId;
    }, [isUserTopPerformer, userIndividualId]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        const intervalId = setInterval(() => {
            setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft]);

    useEffect(() => {
        const loadResults = async () => {
            try {
                const data: IndividualData[] = await getPhase2Results();
                if (Array.isArray(data)) {
                    setIndividuals(data);
                    setVisibleIndividuals(data);
                }
            } catch (err) {
                console.error('Failed to load phase 2 results', err);
            }
        };
        loadResults();

        socket.connect();

        socket.on('phase2:results', (data) => {
            if (Array.isArray(data)) {
                setIndividuals(data);
                setVisibleIndividuals(data);
            }
        });

        socket.on('system:phase-change', (data) => {
            console.log('Phase changed to:', data.phase);
        });

        return () => {
            socket.off('phase2:results');
            socket.off('system:phase-change');
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        let unmounted = false;

        // Wait until auth session is fully restored before starting
        if (isLoading || individuals.length === 0 || hasRunSequence.current) return;
        hasRunSequence.current = true;

        const runSequence = async () => {
            // 1. Shutter Phase
            await new Promise(r => setTimeout(r, 2000));
            if (unmounted) return;
            setShowShutter(false);
            setShowContent(true);

            await new Promise(r => setTimeout(r, 600));
            if (unmounted) return;

            const winners = individuals.filter(ind => ind.result === 'WINNER');

            for (let i = 0; i < winners.length; i++) {
                const winner = winners[i];

                setTimeLeft(30);

                // Wait the full interval BEFORE showing the result (suspense)
                await new Promise(r => setTimeout(r, 30000));
                if (unmounted) return;

                setCurrentWinner(winner);

                // Big Popup highlight for 5s
                await new Promise(r => setTimeout(r, 5000));
                if (unmounted) return;

                setCurrentWinner(null);
                setSlottedCount(prev => prev + 1);

                // Use ref — correct user id even with empty dep array
                if (userIdRef.current === winner.id) {
                    setIsUnlocked(true);
                }
            }

            setTimeLeft(null);
            setEvaluationComplete(true);

            // Use ref — correct winner status
            if (!isWinnerRef.current) {
                setIsUnlocked(true);
            }
        };

        runSequence();

        return () => {
            unmounted = true;
            // Reset for React StrictMode double-invoke
            hasRunSequence.current = false;
        };
        // Only depend on individuals and isLoading — user values use refs above
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [individuals, isLoading]);

    const handleNext = () => {
        if (!isUnlocked) return;

        setShowTransition(true);

        if (isWinnerRef.current) {
            setTimeout(() => {
                router.push('/eval-3');
            }, 1500); // Wait for loader animation
        }
        // If not winner, the LoserRewardTransition handles its own navigation callback
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
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
                        <div className="bg-gradient-to-br from-[#111] to-[#000] border-4 border-[#ffd700] rounded-3xl p-8 lg:p-12 text-center shadow-[0_0_100px_rgba(255,215,0,0.6)] max-w-2xl w-[80%] mx-auto">
                            <Trophy className="w-20 h-20 md:w-32 md:h-32 text-[#ffd700] mx-auto mb-6 drop-shadow-[0_0_20px_rgba(255,215,0,1)]" />
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] to-white drop-shadow-xl mb-2 uppercase tracking-wider">
                                {currentWinner.email}
                            </h2>
                            <p className="text-[#ffd700] text-lg md:text-2xl font-mono tracking-[0.5em] uppercase font-bold mb-4">{currentWinner.role}</p>
                            <p className="text-white text-base md:text-xl font-mono uppercase bg-[#ffd700]/20 inline-block px-4 py-1.5 rounded-full border border-[#ffd700]">Slot Secured</p>
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
                        className="relative z-10 min-h-screen p-8 pb-32"
                    >
                        <div className="max-w-7xl mx-auto">
                            <motion.div
                                initial={{ y: -30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-center mb-6"
                            >
                                <Trophy className="w-12 h-12 md:w-16 md:h-16 text-neon-violet mx-auto mb-3 drop-shadow-[0_0_15px_rgba(83,56,158,0.8)]" />
                                <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[#53389e] mb-1 drop-shadow-lg tracking-widest uppercase">
                                    PHASE 2 SUMMARY
                                </h1>
                                <p className="text-neon-violet text-[10px] md:text-xs font-semibold tracking-wider uppercase">Individual Participant Rankings</p>
                            </motion.div>

                            <motion.div
                                initial={{ y: -30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-6 lg:gap-8"
                            >
                                {/* Left Empty Space / Placeholder Block */}
                                <div className="flex flex-col gap-3 w-full lg:w-1/3">
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
                                                strokeDasharray="289.02" // 2 * pi * 46
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
                                </div>

                                {/* Right Stats Block */}
                                <div className="flex flex-col gap-3 w-full lg:w-1/3">
                                    <div className="bg-[#0f0f13]/90 backdrop-blur border border-neon-violet/20 rounded-xl p-3 md:p-4 shadow-[0_8px_30px_rgba(83,56,158,0.05)] flex justify-between items-center relative overflow-hidden">
                                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#53389e] shadow-[0_0_15px_#53389e]" />
                                        <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Selections Made</div>
                                        <div className="text-xl md:text-2xl font-black text-neon-violet font-mono tracking-wider">{slottedCount}</div>
                                    </div>
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <AnimatePresence>
                                    {visibleIndividuals.map((person) => {
                                        const isUserCard = person.id === userIndividualId;

                                        return (
                                            <motion.div
                                                layout
                                                key={person.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.8, y: -50 }}
                                                transition={{ duration: 0.5, layout: { duration: 0.5 } }}
                                                className={`relative p-4 rounded-xl backdrop-blur-xl transition-all overflow-hidden ${isUserCard
                                                    ? 'bg-gradient-to-br from-[#53389e]/10 to-[#3e1c84]/20 border-2 border-neon-violet shadow-[0_0_30px_rgba(83,56,158,0.2)]'
                                                    : 'bg-black-true/60 border border-white/10'
                                                    }`}
                                            >
                                                {isUserCard && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#53389e] to-transparent opacity-80" />}

                                                {isUserCard && (
                                                    <div className="absolute top-4 left-4 bg-[#53389e] text-[#ffffff] px-3 py-1 rounded-full text-xs font-black tracking-widest shadow-[0_0_15px_rgba(83,56,158,0.8)] z-10">
                                                        YOUR SCORE
                                                    </div>
                                                )}

                                                <div className="flex items-start justify-between mb-2 mt-6">
                                                    <div className="min-w-0 pr-2">
                                                        <h3 className={`text-base font-black tracking-wide truncate ${isUserCard ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#53389e] to-white drop-shadow-sm' : 'text-white'}`}>
                                                            {person.email}
                                                        </h3>
                                                        <div className="flex flex-col gap-1 mt-1 border-l-2 border-neon-violet pl-2">
                                                            <p className="text-gray-400 text-[10px] font-mono tracking-widest">{person.id}</p>
                                                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-[#53389e]/30 text-white border border-neon-violet/80 inline-block w-fit">
                                                                {person.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className={`p-2 rounded-lg border shrink-0 ${isUserCard ? 'bg-[#53389e]/10 border-neon-violet/50' : 'bg-white/5 border-white/10'}`}>
                                                        <User className={`w-4 h-4 ${isUserCard ? 'text-neon-violet' : 'text-gray-400'}`} />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1 items-start bg-black/40 rounded-lg p-2 mt-2 border border-white/5">
                                                    <span className="text-gray-400 text-[10px] font-semibold tracking-wider">RESULT STATUS:</span>
                                                    <span className={`font-mono font-black text-lg ${isUserCard ? 'text-neon-violet drop-shadow-[0_0_5px_rgba(83,56,158,0.5)]' : person.result === 'WINNER' ? 'text-[#ffd700]' : 'text-white'}`}>
                                                        {person.result ?? 'PENDING'}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {!evaluationComplete && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    className="mt-16 text-center"
                                >
                                    <motion.div
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="text-neon-violet text-sm md:text-base font-bold tracking-[0.3em] uppercase drop-shadow-[0_0_5px_rgba(83,56,158,0.5)] mb-6"
                                    >
                                        Evaluating Individual Performances...
                                    </motion.div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showContent && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent z-[90] flex justify-end"
                >
                    <button
                        onClick={handleNext}
                        disabled={!isUnlocked}
                        className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-xl tracking-widest transition-all duration-300 uppercase
                     ${isUnlocked
                                ? (isUserTopPerformer ? 'bg-[#53389e] text-[#ffffff] shadow-[0_0_40px_rgba(83,56,158,0.6)] hover:scale-105 hover:bg-violet-400' : 'bg-[#53389e] text-white shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-105 hover:bg-[#b06bf6]')
                                : 'bg-gray-800 text-gray-400 border border-gray-700 cursor-not-allowed opacity-80'}`}
                    >
                        {isUnlocked ? (
                            <>
                                Proceed to Next Action
                                <Unlock className="w-6 h-6" />
                            </>
                        ) : (
                            <>
                                Wait for Selections
                                <Lock className="w-6 h-6" />
                            </>
                        )}
                    </button>
                </motion.div>
            )}

            {/* The Transition Overlay */}
            {showTransition && isWinnerRef.current && (
                <TransitionLoader isVisible={true} />
            )}

            {showTransition && !isWinnerRef.current && (
                <LoserRewardTransition onComplete={() => router.push('/better-luck-2')} />
            )}
        </div>
    );
}
