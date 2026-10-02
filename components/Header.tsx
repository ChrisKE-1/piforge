"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui";
import { getCurrentUser, setCurrentUser, upsertPioneer } from "@/lib/store";
import { authenticatePioneer, initPiSDK, isPiBrowser } from "@/lib/pi-sdk";
import type { Pioneer } from "@/lib/types";
import { formatPi, reputationTier } from "@/lib/utils";

export default function Header() {
  const [user, setUser] = useState<Pioneer | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initPiSDK(false); // set true for sandbox testing
    const existing = getCurrentUser();
    if (existing) setUser(existing);
  }, []);

  async function handleLogin() {
    setLoading(true);
    try {
      const auth = await authenticatePioneer();
      if (!auth) {
        alert("Authentication cancelled or failed. Please try again inside Pi Browser.");
        return;
      }

      const pioneer: Pioneer = {
        uid: auth.user.uid,
        username: auth.user.username,
        kycStatus: "passed", // In production, query your backend / Pi KYC status
        reputationScore: 3.8,
        completedTasks: 0,
        totalEarned: 0,
        skills: [],
        createdAt: new Date().toISOString(),
      };

      // Merge with any existing local data
      const existing = getCurrentUser();
      if (existing && existing.uid === pioneer.uid) {
        pioneer.reputationScore = existing.reputationScore;
        pioneer.completedTasks = existing.completedTasks;
        pioneer.totalEarned = existing.totalEarned;
        pioneer.skills = existing.skills;
        pioneer.bio = existing.bio;
      }

      upsertPioneer(pioneer);
      setCurrentUser(pioneer);
      setUser(pioneer);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setCurrentUser(null);
    setUser(null);
  }

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pi-500 to-pi-700 font-bold text-white shadow-lg">
            π
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-white">
              PiForge
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              Verified Work OS
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link href="/" className="hover:text-white transition">
            Marketplace
          </Link>
          <Link href="/post" className="hover:text-white transition">
            Post Task
          </Link>
          <Link href="/dashboard" className="hover:text-white transition">
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!isPiBrowser() && (
            <span className="hidden text-xs text-amber-400/80 sm:inline">
              Open in Pi Browser for full features
            </span>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-1.5 border border-slate-800 hover:border-pi-600 transition"
              >
                <div className="h-7 w-7 rounded-full bg-pi-700 flex items-center justify-center text-xs font-bold">
                  {user.username.slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-white">
                    @{user.username}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {reputationTier(user.reputationScore).label} ·{" "}
                    {formatPi(user.totalEarned)} earned
                  </div>
                </div>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          ) : (
            <Button onClick={handleLogin} disabled={loading} size="md">
              {loading ? "Connecting…" : "Connect Pi Wallet"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
