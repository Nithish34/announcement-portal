"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalPhaseController() {
  const router = useRouter();
  const [isGlitching, setIsGlitching] = useState(false);
  const [glitchText, setGlitchText] = useState("");

  useEffect(() => {
    function onPhaseChange(data: { phase: string; forceRedirect?: string }) {
      if (data.forceRedirect) {
        setGlitchText(`SYSTEM OVERRIDE: INITIATING PHASE ${data.phase.toUpperCase()}`);
        setIsGlitching(true);
        // Wait for glitch animation before redirecting
        setTimeout(() => {
          router.push(data.forceRedirect as string);
          // Hide glitch after redirect finishes
          setTimeout(() => setIsGlitching(false), 800);
        }, 1500);
      }
    }

    socket.on("system:phase-change", onPhaseChange);

    return () => {
      socket.off("system:phase-change", onPhaseChange);
    };
  }, [router]);

  return (
    <AnimatePresence>
      {isGlitching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[99999] bg-black-true flex items-center justify-center pointer-events-none"
        >
          {/* CRT Scanline Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 pointer-events-none opacity-50" />
          
          <motion.div
            animate={{ 
              x: [-10, 10, -5, 5, 0],
              y: [5, -5, 10, -10, 0],
              filter: [
                "hue-rotate(90deg) blur(2px)",
                "hue-rotate(-90deg) blur(0px)",
                "hue-rotate(180deg) blur(4px)",
                "hue-rotate(0deg) blur(0px)"
              ]
            }}
            transition={{ duration: 0.3, repeat: Infinity, repeatType: "mirror" }}
            className="text-white text-3xl md:text-5xl font-mono font-black tracking-[0.5em] text-center z-20 mix-blend-difference"
          >
            {glitchText}
          </motion.div>
          
          {/* Glitch Boxes */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                scaleX: Math.random() * 5,
                scaleY: Math.random() * 0.5,
                opacity: 0
              }}
              animate={{
                opacity: [0, 1, 0],
                x: Math.random() * window.innerWidth
              }}
              transition={{ 
                duration: Math.random() * 0.5 + 0.1, 
                repeat: Infinity, 
                repeatType: "mirror" 
              }}
              className="absolute bg-neon-violet/50 z-30"
              style={{
                width: `${Math.random() * 100}px`,
                height: `${Math.random() * 20}px`,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
