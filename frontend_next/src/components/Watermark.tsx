"use client";

import Image from "next/image";

export default function Watermark() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-8 -rotate-[15deg] transform-gpu opacity-[0.06] mix-blend-plus-lighter">
                <div className="relative w-40 h-40 md:w-64 md:h-64">
                    <Image
                        src="/favicon.ico"
                        alt="EduSpine Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <span className="text-white font-bold tracking-[0.2em] text-5xl md:text-8xl whitespace-nowrap">
                    EduSpine
                </span>
            </div>
        </div>
    );
}
