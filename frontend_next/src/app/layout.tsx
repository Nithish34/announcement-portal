import { AuthProvider } from '@/context/AuthContext';
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Watermark from "@/components/Watermark";
import ConnectionStatus from "@/components/ConnectionStatus";
import GlobalPhaseController from "@/components/GlobalPhaseController";

const inter = Inter({
  variable: "--font-geist-sans", // Keep variable name for tailwind config compatibility
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghost Protocol | Hackathon",
  description: "Secure Hackathon Participant Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-black text-white selection:bg-neon-violet selection:text-white`}
      >
        <AuthProvider>
          <ConnectionStatus />
          <GlobalPhaseController />
          {children}
        </AuthProvider>
        <Watermark />
      </body>
    </html>
  );
}
