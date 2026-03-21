'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface HoldButtonProps {
    onTrigger: () => void;
    holdTimeMs?: number;
    idleText?: string;
    holdingText?: string;
    successText?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export default function HoldButton({
    onTrigger,
    holdTimeMs = 3000,
    idleText = 'HOLD TO TRIGGER',
    holdingText = 'INITIALIZING...',
    successText = 'TRIGGERED!',
    icon,
    disabled = false
}: HoldButtonProps) {
    const [status, setStatus] = useState<'idle' | 'holding' | 'success'>('idle');
    const controls = useAnimation();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startHold = () => {
        if (disabled || status === 'success') return;
        setStatus('holding');
        
        controls.start({
            width: '100%',
            transition: { duration: holdTimeMs / 1000, ease: 'linear' }
        });

        timerRef.current = setTimeout(() => {
            setStatus('success');
            onTrigger();
            setTimeout(() => setStatus('idle'), 3000); // reset after 3s
        }, holdTimeMs);
    };

    const cancelHold = () => {
        if (status === 'success') return;
        if (timerRef.current) clearTimeout(timerRef.current);
        setStatus('idle');
        controls.stop();
        controls.set({ width: '0%' });
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <div 
            className="relative overflow-hidden"
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchStart={startHold}
            onTouchEnd={cancelHold}
            style={{ touchAction: 'none' }}
        >
            <button
                disabled={disabled}
                className={`w-full relative py-4 px-6 rounded-xl border-2 font-black text-sm tracking-widest uppercase transition-colors z-10 flex items-center justify-center gap-3
                    ${disabled 
                        ? 'border-white/10 text-white/30 bg-black cursor-not-allowed' 
                        : status === 'success'
                            ? 'border-red-500 text-white bg-red-500/20'
                            : 'border-red-500/50 text-red-500 hover:border-red-500 hover:bg-red-500/10 cursor-pointer'
                    }
                `}
            >
                {icon}
                {status === 'idle' && idleText}
                {status === 'holding' && holdingText}
                {status === 'success' && successText}
            </button>
            
            {/* Progress Bar */}
            <motion.div 
                animate={controls}
                initial={{ width: '0%' }}
                className="absolute top-0 left-0 bottom-0 bg-red-500/30 z-0 pointer-events-none"
            />
        </div>
    );
}
