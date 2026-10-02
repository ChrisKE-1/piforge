import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPi(amount: number): string {
  return `${amount.toFixed(2)} π`;
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    ai_data: "AI Data & Labeling",
    local_service: "Local Service",
    micro_freelance: "Micro-Freelance",
    survey: "Survey / Feedback",
    content: "Content Creation",
    other: "Other",
  };
  return map[cat] || cat;
}

export function reputationTier(score: number): { label: string; color: string } {
  if (score >= 4.7) return { label: "Elite", color: "text-amber-400" };
  if (score >= 4.2) return { label: "Trusted", color: "text-emerald-400" };
  if (score >= 3.5) return { label: "Reliable", color: "text-sky-400" };
  if (score >= 2.5) return { label: "Building", color: "text-slate-300" };
  return { label: "New", color: "text-slate-500" };
}
