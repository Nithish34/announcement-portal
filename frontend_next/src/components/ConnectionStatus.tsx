"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { motion, AnimatePresence } from "framer-motion";

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
      <div className="relative flex h-2.5 w-2.5">
        {isConnected ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39ff14] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#39ff14] shadow-[0_0_8px_#39ff14]"></span>
          </>
        ) : (
          <>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff0000] shadow-[0_0_8px_#ff0000]"></span>
          </>
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.span
          key={isConnected ? "connected" : "disconnected"}
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
            isConnected ? "text-[#39ff14]" : "text-[#ff0000]"
          }`}
        >
          {isConnected ? "SECURE LINK" : "OFFLINE"}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
