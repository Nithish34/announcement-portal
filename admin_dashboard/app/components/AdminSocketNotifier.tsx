'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldAlert, GitMerge } from 'lucide-react';

interface EventToast {
    id: string;
    msg: string;
    type: 'system' | 'repo' | 'alert';
}

export default function AdminSocketNotifier() {
    const [events, setEvents] = useState<EventToast[]>([]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket.connected) socket.connect();

        const addEvent = (msg: string, type: 'system' | 'repo' | 'alert') => {
            const id = Math.random().toString(36).substring(7);
            setEvents(prev => [...prev, { id, msg, type }]);
            setTimeout(() => {
                setEvents(prev => prev.filter(e => e.id !== id));
            }, 5000);
        };

        socket.on('repo:provisioned', (data: { teamId: string, url: string }) => {
            addEvent(`Team ${data.teamId} repo provisioned`, 'repo');
        });

        socket.on('system:phase-change', (data: { phase: string }) => {
            addEvent(`System overridden to phase: ${data.phase}`, 'system');
        });

        socket.on('ghost:activated', () => {
            addEvent(`GHOST PROTOCOL INITIATED`, 'alert');
        });

        socket.on('user:disconnected', (data: { userId: string }) => {
            addEvent(`User ${data.userId} disconnected`, 'system');
        });

        return () => {
            socket.off('repo:provisioned');
            socket.off('system:phase-change');
            socket.off('ghost:activated');
            socket.off('user:disconnected');
            // don't completely disconnect socket if other components need it, but ok to just off
        };
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {events.map((event) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md shadow-lg min-w-[280px] pointer-events-auto
                            ${event.type === 'alert' 
                                ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                                : event.type === 'repo'
                                    ? 'bg-[#10b981]/10 border-[#10b981]/50 text-[#10b981]'
                                    : 'bg-[#53389e]/10 border-[#53389e]/50 text-[#a855f7]'
                            }
                        `}
                    >
                        {event.type === 'alert' && <ShieldAlert className="w-5 h-5 shrink-0" />}
                        {event.type === 'repo' && <GitMerge className="w-5 h-5 shrink-0" />}
                        {event.type === 'system' && <Terminal className="w-5 h-5 shrink-0" />}
                        <span className="text-xs font-mono font-bold tracking-wider">{event.msg}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
