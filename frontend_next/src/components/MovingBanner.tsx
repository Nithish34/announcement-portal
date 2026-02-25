import React from 'react';
import { motion } from 'framer-motion';

const BannerItem = () => (
    <div className="flex items-center gap-4 mx-6 md:mx-10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-white w-6 h-6 md:w-8 md:h-8">
            <path d="M15 4H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

            <path d="M7 8H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="18" cy="8" r="2.5" fill="currentColor" />

            <path d="M4 12H11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

            <path d="M4 16H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="4" cy="16" r="2.5" fill="currentColor" />

            <path d="M4 20H8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="text-white text-xl md:text-3xl font-black tracking-widest uppercase">
            Eduspine..
        </span>
    </div>
);

interface MovingBannerProps {
    direction?: 'left' | 'right';
    className?: string;
    speed?: number;
}

export default function MovingBanner({ direction = 'left', className = '', speed = 30 }: MovingBannerProps) {
    return (
        <div className={`overflow-hidden whitespace-nowrap py-4 bg-transparent pointer-events-none select-none ${className}`}>
            <motion.div
                className="flex inline-flex items-center"
                animate={{ x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'] }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: speed
                }}
            >
                {[...Array(20)].map((_, i) => (
                    <BannerItem key={i} />
                ))}
            </motion.div>
        </div>
    );
}
