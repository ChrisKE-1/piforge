"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, setCurrentUser, upsertPioneer } from "@/lib/store";
import type { Pioneer } from "@/lib/types";
import { Card, Button, Input, Textarea, Badge } from "@/components/ui";
import { formatPi, reputationTier } from "@/lib/utils";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<Pioneer | null>(null);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setUser(u);
      setBio(u.bio || "");
      setSkills((u.skills || []).join(", "));
    }
  }, []);

  function handleSave() {
    if (!user) return;
    const updated: Pioneer = {
      ...user,
      bio: bio.trim(),
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    upsertPioneer(updated);
    setCurrentUser(updated);
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!user) {
    return (
      <div className="py-20 text-center text-slate-400">
        Connect your Pi Wallet to view your profile.
      </div>
    );
  }

  const tier = reputationTier(user.reputationScore);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pi-500 to-pi-700 text-2xl font-bold text-white">
            {user.username.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">@{user.username}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge tone="success">KYC {user.kycStatus}</Badge>
              <span className={`text-sm font-medium ${tier.color}`}>
                {tier.label} · {user.reputationScore.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
          <div className="rounded-xl bg-slate-800/50 p-3">
            <div className="text-lg font-bold text-pi-400">
              {formatPi(user.totalEarned)}
            </div>
            <div className="text-xs text-slate-500">Earned</div>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-3">
            <div className="text-lg font-bold text-white">
              {user.completedTasks}
            </div>
            <div className="text-xs text-slate-500">Completed</div>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-semibold text-white">Edit Profile</h2>
        <div>
          <label className="mb-1.5 block text-sm text-slate-300">Bio</label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell posters about your skills and experience…"
            rows={3}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-slate-300">
            Skills (comma separated)
          </label>
          <Input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Swahili, Image labeling, Delivery, Graphic design"
          />
        </div>
        <Button onClick={handleSave}>{saved ? "Saved!" : "Save Profile"}</Button>
      </Card>

      <Link href="/dashboard">
        <Button variant="secondary" className="w-full">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
}
