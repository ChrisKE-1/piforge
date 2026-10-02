/**
 * Lightweight in-memory + localStorage store for MVP.
 * In production replace with Supabase + on-chain reads.
 */

import type { Pioneer, Task, ReputationEvent } from "./types";

const PIONEERS_KEY = "piforge_pioneers";
const TASKS_KEY = "piforge_tasks";
const REPUTATION_KEY = "piforge_reputation";
const CURRENT_USER_KEY = "piforge_current_user";

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSave(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Seed data for first load
const SEED_TASKS: Task[] = [
  {
    id: "task-001",
    title: "Label 50 product images for e-commerce AI",
    description:
      "Draw bounding boxes around products in the provided images. High accuracy required. Training data for a local African marketplace AI.",
    category: "ai_data",
    rewardPi: 12.5,
    posterUid: "poster-seed-1",
    posterUsername: "AfriMartAI",
    status: "open",
    requirements: ["Attention to detail", "Mobile or desktop", "English or French"],
    deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "task-002",
    title: "Translate 200 words of app UI (English → Swahili)",
    description:
      "Help localize a Pi-native education app. Native or fluent Swahili speakers preferred.",
    category: "content",
    rewardPi: 8.0,
    posterUid: "poster-seed-2",
    posterUsername: "EduPi",
    status: "open",
    requirements: ["Native/fluent Swahili", "Understanding of UI terms"],
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: "task-003",
    title: "Local delivery proof – Nairobi CBD to Westlands",
    description:
      "Pick up a small package and deliver within 90 minutes. Photo + GPS proof required. You keep the tip in Pi.",
    category: "local_service",
    rewardPi: 5.5,
    posterUid: "poster-seed-3",
    posterUsername: "QuickDropKE",
    status: "open",
    requirements: ["Located in Nairobi", "Smartphone with camera", "Reliable"],
    location: "Nairobi, Kenya",
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: "task-004",
    title: "Human feedback on AI chatbot answers (20 pairs)",
    description:
      "Rate which of two AI responses is more helpful and culturally appropriate for Southeast Asian users.",
    category: "ai_data",
    rewardPi: 15.0,
    posterUid: "poster-seed-4",
    posterUsername: "AlignLabs",
    status: "open",
    requirements: ["Critical thinking", "Familiarity with SEA culture preferred"],
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: "task-005",
    title: "Design a simple logo for a Pi merchant (1 concept)",
    description:
      "Create one clean logo concept for a small food stall accepting Pi. PNG + source preferred.",
    category: "micro_freelance",
    rewardPi: 25.0,
    posterUid: "poster-seed-5",
    posterUsername: "MamaPiFoods",
    status: "open",
    requirements: ["Design skills", "Can deliver within 48h"],
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
];

export function getCurrentUser(): Pioneer | null {
  return safeParse<Pioneer | null>(CURRENT_USER_KEY, null);
}

export function setCurrentUser(user: Pioneer | null) {
  safeSave(CURRENT_USER_KEY, user);
}

export function getTasks(): Task[] {
  const tasks = safeParse<Task[]>(TASKS_KEY, []);
  if (tasks.length === 0) {
    safeSave(TASKS_KEY, SEED_TASKS);
    return SEED_TASKS;
  }
  return tasks;
}

export function saveTasks(tasks: Task[]) {
  safeSave(TASKS_KEY, tasks);
}

export function getTaskById(id: string): Task | undefined {
  return getTasks().find((t) => t.id === id);
}

export function upsertTask(task: Task) {
  const tasks = getTasks();
  const idx = tasks.findIndex((t) => t.id === task.id);
  if (idx >= 0) tasks[idx] = task;
  else tasks.unshift(task);
  saveTasks(tasks);
}

export function getPioneer(uid: string): Pioneer | undefined {
  const all = safeParse<Pioneer[]>(PIONEERS_KEY, []);
  return all.find((p) => p.uid === uid);
}

export function upsertPioneer(p: Pioneer) {
  const all = safeParse<Pioneer[]>(PIONEERS_KEY, []);
  const idx = all.findIndex((x) => x.uid === p.uid);
  if (idx >= 0) all[idx] = p;
  else all.push(p);
  safeSave(PIONEERS_KEY, all);
}

export function addReputationEvent(event: ReputationEvent) {
  const events = safeParse<ReputationEvent[]>(REPUTATION_KEY, []);
  events.push(event);
  safeSave(REPUTATION_KEY, events);
}

export function getReputationFor(uid: string): number {
  const events = safeParse<ReputationEvent[]>(REPUTATION_KEY, []);
  const relevant = events.filter((e) => e.toUid === uid);
  if (relevant.length === 0) return 3.0; // neutral starting score
  const sum = relevant.reduce((acc, e) => acc + e.score, 0);
  return Math.round((sum / relevant.length) * 10) / 10;
}
