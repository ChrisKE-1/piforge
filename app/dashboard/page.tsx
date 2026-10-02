"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser, getTasks } from "@/lib/store";
import type { Pioneer, Task } from "@/lib/types";
import { Card, Badge, Button } from "@/components/ui";
import { formatPi, categoryLabel, formatRelativeTime } from "@/lib/utils";
import { Coins, Briefcase, CheckCircle, Clock } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<Pioneer | null>(null);
  const [myPosted, setMyPosted] = useState<Task[]>([]);
  const [myClaimed, setMyClaimed] = useState<Task[]>([]);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    if (u) {
      const all = getTasks();
      setMyPosted(all.filter((t) => t.posterUid === u.uid));
      setMyClaimed(all.filter((t) => t.assigneeUid === u.uid));
    }
  }, []);

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-400 mb-4">Connect your Pi Wallet to view your dashboard.</p>
        <Link href="/">
          <Button>Go to Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400">
          Welcome back, @{user.username}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="rounded-xl bg-pi-900/50 p-3">
            <Coins className="h-6 w-6 text-pi-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {formatPi(user.totalEarned)}
            </div>
            <div className="text-xs text-slate-500">Total Earned</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="rounded-xl bg-sky-900/40 p-3">
            <CheckCircle className="h-6 w-6 text-sky-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {user.completedTasks}
            </div>
            <div className="text-xs text-slate-500">Completed Tasks</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="rounded-xl bg-amber-900/40 p-3">
            <Briefcase className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {user.reputationScore.toFixed(1)}
            </div>
            <div className="text-xs text-slate-500">Reputation</div>
          </div>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">
          Tasks I Posted ({myPosted.length})
        </h2>
        {myPosted.length === 0 ? (
          <Card className="text-center text-slate-500 py-8">
            You haven&apos;t posted any tasks yet.{" "}
            <Link href="/post" className="text-pi-400 underline">
              Post one
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {myPosted.map((t) => (
              <Link key={t.id} href={`/tasks/${t.id}`}>
                <Card className="flex items-center justify-between hover:border-pi-700/50 transition">
                  <div>
                    <div className="font-medium text-white">{t.title}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {categoryLabel(t.category)} · {formatRelativeTime(t.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-pi-400 font-semibold">
                      {formatPi(t.rewardPi)}
                    </span>
                    <Badge
                      tone={
                        t.status === "completed"
                          ? "gold"
                          : t.status === "open"
                          ? "success"
                          : "warning"
                      }
                    >
                      {t.status}
                    </Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">
          Tasks I Claimed ({myClaimed.length})
        </h2>
        {myClaimed.length === 0 ? (
          <Card className="text-center text-slate-500 py-8">
            No claimed tasks yet. Browse the{" "}
            <Link href="/" className="text-pi-400 underline">
              marketplace
            </Link>
            .
          </Card>
        ) : (
          <div className="space-y-3">
            {myClaimed.map((t) => (
              <Link key={t.id} href={`/tasks/${t.id}`}>
                <Card className="flex items-center justify-between hover:border-pi-700/50 transition">
                  <div>
                    <div className="font-medium text-white">{t.title}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {categoryLabel(t.category)} · {formatRelativeTime(t.updatedAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-pi-400 font-semibold">
                      {formatPi(t.rewardPi)}
                    </span>
                    <Badge
                      tone={
                        t.status === "completed"
                          ? "gold"
                          : t.status === "submitted"
                          ? "info"
                          : "warning"
                      }
                    >
                      {t.status}
                    </Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
