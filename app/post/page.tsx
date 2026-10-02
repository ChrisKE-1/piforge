"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Textarea, Select } from "@/components/ui";
import { getCurrentUser, upsertTask } from "@/lib/store";
import type { Task, TaskCategory, Pioneer } from "@/lib/types";
import { createPiPayment } from "@/lib/pi-sdk";

export default function PostTaskPage() {
  const router = useRouter();
  const [user, setUser] = useState<Pioneer | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("ai_data");
  const [reward, setReward] = useState("5");
  const [requirements, setRequirements] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setError("Connect your Pi Wallet first.");
      return;
    }
    if (user.kycStatus !== "passed") {
      setError("Only KYC-verified Pioneers can post paid tasks.");
      return;
    }
    const rewardNum = parseFloat(reward);
    if (!title.trim() || !description.trim() || isNaN(rewardNum) || rewardNum <= 0) {
      setError("Please fill all required fields with a valid reward.");
      return;
    }

    setLoading(true);
    setError("");

    // In production the poster funds an escrow contract here.
    // We demonstrate the Pi payment flow for funding.
    createPiPayment(
      {
        amount: rewardNum,
        memo: `Fund escrow for new task: ${title.slice(0, 40)}`,
        metadata: { type: "escrow", action: "create_task" },
      },
      {
        onReadyForServerApproval: (paymentId) => {
          console.log("[PiForge] Server approval needed for", paymentId);
          // POST /api/payments/approve { paymentId }
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          const task: Task = {
            id: "task-" + Date.now(),
            title: title.trim(),
            description: description.trim(),
            category,
            rewardPi: rewardNum,
            posterUid: user.uid,
            posterUsername: user.username,
            status: "open",
            requirements: requirements
              .split("\n")
              .map((r) => r.trim())
              .filter(Boolean),
            location: location.trim() || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            escrowTxId: txid,
          };
          upsertTask(task);
          setLoading(false);
          router.push(`/tasks/${task.id}`);
        },
        onCancel: () => {
          setError("Payment cancelled. Task not created.");
          setLoading(false);
        },
        onError: (err) => {
          setError(err.message || "Payment failed");
          setLoading(false);
        },
      }
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Post a Task</h1>
        <p className="mt-1 text-sm text-slate-400">
          Fund the reward in Pi. It stays in escrow until the work is completed
          and you release it.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Label 30 street photos for mapping AI"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-slate-300">
              Description *
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Clear instructions, expected output, quality bar…"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">
                Category
              </label>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
              >
                <option value="ai_data">AI Data & Labeling</option>
                <option value="local_service">Local Service</option>
                <option value="micro_freelance">Micro-Freelance</option>
                <option value="survey">Survey / Feedback</option>
                <option value="content">Content Creation</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">
                Reward (π) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-slate-300">
              Requirements (one per line)
            </label>
            <Textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Native language speaker&#10;Smartphone with camera&#10;Available this week"
              rows={3}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-slate-300">
              Location (optional, for local services)
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Lagos, Nigeria"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading || !user}>
            {loading
              ? "Creating & funding escrow…"
              : user
              ? `Post Task & Lock ${reward || "0"} π`
              : "Connect Wallet to Post"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
