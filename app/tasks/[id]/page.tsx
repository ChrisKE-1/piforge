"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getTaskById,
  upsertTask,
  getCurrentUser,
  upsertPioneer,
  setCurrentUser,
} from "@/lib/store";
import type { Task, Pioneer } from "@/lib/types";
import { Button, Card, Badge, Textarea } from "@/components/ui";
import {
  categoryLabel,
  formatPi,
  formatRelativeTime,
  reputationTier,
} from "@/lib/utils";
import { createPiPayment } from "@/lib/pi-sdk";
import {
  ArrowLeft,
  Coins,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [task, setTask] = useState<Task | null>(null);
  const [user, setUser] = useState<Pioneer | null>(null);
  const [proof, setProof] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const t = getTaskById(id);
    if (t) setTask(t);
    setUser(getCurrentUser());
  }, [id]);

  if (!task) {
    return (
      <div className="py-20 text-center text-slate-500">
        Task not found.{" "}
        <Link href="/" className="text-pi-400 underline">
          Back to marketplace
        </Link>
      </div>
    );
  }

  const isPoster = user?.uid === task.posterUid;
  const isAssignee = user?.uid === task.assigneeUid;
  const canClaim = user && task.status === "open" && !isPoster;
  const canSubmit = isAssignee && task.status === "assigned";
  const canComplete = isPoster && task.status === "submitted";

  async function handleClaim() {
    if (!user || !task) return;
    if (user.kycStatus !== "passed") {
      setMessage("Only KYC-verified Pioneers can claim paid tasks.");
      return;
    }
    setLoading(true);
    setMessage("");

    // In production: create escrow payment from poster first, then assign.
    // For MVP we simulate escrow lock via Pi payment from the worker side
    // as a "commitment" or assume poster already funded. Real flow:
    // Poster pays into escrow contract → worker claims → work → release.

    createPiPayment(
      {
        amount: 0.01, // tiny commitment fee or 0 in full escrow model
        memo: `Claim task ${task.id}`,
        metadata: { taskId: task.id, type: "escrow" },
      },
      {
        onReadyForServerApproval: (paymentId) => {
          // Call your backend /api/payments/approve
          console.log("Approve payment", paymentId);
          // For MVP we auto-proceed
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          const updated: Task = {
            ...task,
            status: "assigned",
            assigneeUid: user.uid,
            assigneeUsername: user.username,
            escrowTxId: txid,
            updatedAt: new Date().toISOString(),
          };
          upsertTask(updated);
          setTask(updated);
          setMessage("Task claimed successfully! Complete the work and submit proof.");
          setLoading(false);
        },
        onCancel: () => {
          setMessage("Payment cancelled.");
          setLoading(false);
        },
        onError: (err) => {
          setMessage("Payment error: " + err.message);
          setLoading(false);
        },
      }
    );
  }

  function handleSubmitProof() {
    if (!task || !proof.trim()) return;
    const updated: Task = {
      ...task,
      status: "submitted",
      completionProof: proof.trim(),
      updatedAt: new Date().toISOString(),
    };
    upsertTask(updated);
    setTask(updated);
    setMessage("Proof submitted. Waiting for poster to review & release payment.");
  }

  function handleReleasePayment() {
    if (!task || !user) return;
    setLoading(true);

    // Poster releases the escrowed Pi to the worker
    createPiPayment(
      {
        amount: task.rewardPi,
        memo: `Release reward for task ${task.id}`,
        metadata: { taskId: task.id, type: "release" },
      },
      {
        onReadyForServerApproval: (paymentId) => {
          console.log("Approve release", paymentId);
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          const updated: Task = {
            ...task,
            status: "completed",
            updatedAt: new Date().toISOString(),
          };
          upsertTask(updated);
          setTask(updated);

          // Update worker earnings & reputation (simplified)
          if (task.assigneeUid) {
            const worker = getCurrentUser(); // in real app fetch by uid
            // For demo we update current if they are the assignee
          }

          setMessage("Payment released. Task completed!");
          setLoading(false);
        },
        onCancel: () => {
          setLoading(false);
        },
        onError: (err) => {
          setMessage(err.message);
          setLoading(false);
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to marketplace
      </Link>

      <Card>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge tone="info">{categoryLabel(task.category)}</Badge>
          <Badge
            tone={
              task.status === "open"
                ? "success"
                : task.status === "completed"
                ? "gold"
                : "warning"
            }
          >
            {task.status}
          </Badge>
        </div>

        <h1 className="text-2xl font-bold text-white md:text-3xl">
          {task.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1.5 text-pi-400 font-semibold text-lg">
            <Coins className="h-5 w-5" />
            {formatPi(task.rewardPi)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Posted {formatRelativeTime(task.createdAt)}
          </span>
          {task.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {task.location}
            </span>
          )}
        </div>

        <div className="mt-6 prose prose-invert max-w-none">
          <p className="text-slate-300 whitespace-pre-wrap">{task.description}</p>
        </div>

        {task.requirements.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-200 mb-2">
              Requirements
            </h3>
            <ul className="space-y-1">
              {task.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-pi-500 mt-0.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
          Posted by <span className="text-slate-300">@{task.posterUsername}</span>
          {task.assigneeUsername && (
            <>
              · Assigned to{" "}
              <span className="text-slate-300">@{task.assigneeUsername}</span>
            </>
          )}
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <h3 className="font-semibold text-white mb-4">Actions</h3>

        {!user && (
          <p className="text-sm text-slate-400">
            Connect your Pi Wallet to claim or manage this task.
          </p>
        )}

        {canClaim && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              Claiming will start the work agreement. In the full version the
              reward is locked in a Soroban escrow contract until completion.
            </p>
            <Button onClick={handleClaim} disabled={loading} size="lg">
              {loading ? "Processing…" : `Claim Task for ${formatPi(task.rewardPi)}`}
            </Button>
          </div>
        )}

        {canSubmit && (
          <div className="space-y-3">
            <label className="text-sm text-slate-300">
              Submit completion proof (description, links, or summary)
            </label>
            <Textarea
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              placeholder="Describe what you delivered, attach links or file references…"
            />
            <Button onClick={handleSubmitProof} disabled={!proof.trim()}>
              Submit for Review
            </Button>
          </div>
        )}

        {canComplete && (
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-800/60 p-4 text-sm">
              <p className="text-slate-300 font-medium mb-1">Worker proof:</p>
              <p className="text-slate-400 whitespace-pre-wrap">
                {task.completionProof}
              </p>
            </div>
            <Button onClick={handleReleasePayment} disabled={loading} variant="gold">
              {loading ? "Releasing…" : `Release ${formatPi(task.rewardPi)} to Worker`}
            </Button>
          </div>
        )}

        {task.status === "completed" && (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            Task completed and payment released.
          </div>
        )}

        {message && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-800/80 p-3 text-sm text-slate-300">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-pi-400" />
            {message}
          </div>
        )}
      </Card>
    </div>
  );
}
