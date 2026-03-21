"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface DecryptingTextProps {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
  onComplete?: () => void;
}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";

export default function DecryptingText({
  text,
  delay = 0,
  duration = 2000, // in ms
  className = "",
  onComplete
}: DecryptingTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [isDecrypted, setIsDecrypted] = useState(false);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (elapsed < delay) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min((elapsed - delay) / duration, 1);
      
      let currentText = "";
      for (let i = 0; i < text.length; i++) {
        // If this character's turn to decrypt has passed based on progress
        if (progress > i / text.length) {
          currentText += text[i];
        } else {
          // If it's a space, keep it a space
          if (text[i] === " ") {
            currentText += " ";
          } else {
            currentText += chars[Math.floor(Math.random() * chars.length)];
          }
        }
      }

      setDisplayText(currentText);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setIsDecrypted(true);
        if (onComplete) onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [text, delay, duration, onComplete]);

  return (
    <motion.span 
      className={`${className} ${!isDecrypted ? 'text-neon-violet opacity-80' : ''}`}
      animate={isDecrypted ? { textShadow: "0px 0px 8px rgba(255,255,255,0.8)" } : {}}
    >
      {displayText}
    </motion.span>
  );
}
