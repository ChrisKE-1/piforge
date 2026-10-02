"use client";

import { useEffect, useState } from "react";
import TaskCard from "@/components/TaskCard";
import { Button, Input, Select, Badge } from "@/components/ui";
import { getTasks } from "@/lib/store";
import type { Task, TaskCategory } from "@/lib/types";
import { categoryLabel } from "@/lib/utils";
import { Search, Sparkles, Shield, Coins, Users } from "lucide-react";
import Link from "next/link";

export default function MarketplacePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTasks(getTasks().filter((t) => t.status === "open" || t.status === "assigned"));
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        Loading marketplace…
      </div>
    );
  }

  const filtered = tasks.filter((t) => {
    const matchesCat = filter === "all" || t.category === filter;
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-pi-950/40 p-8 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pi-600/10 via-transparent to-transparent" />
        <div className="relative max-w-2xl">
          <Badge tone="gold" className="mb-4">
            <Sparkles className="mr-1 h-3 w-3" /> Identity-Native Work OS
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Turn your verified identity into{" "}
            <span className="text-pi-400">real Pi earnings</span>
          </h1>
          <p className="mt-4 text-base text-slate-400 md:text-lg">
            PiForge is the trust layer for micro-work, AI data contribution, and
            local services on Pi Network. KYC-verified Pioneers only. Escrowed
            payments. Portable reputation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/post">
              <Button size="lg">Post a Task</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="lg">
                My Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Shield, label: "KYC Gated", desc: "Real humans only" },
            { icon: Coins, label: "Pi Escrow", desc: "Safe payments" },
            { icon: Users, label: "Reputation", desc: "Portable trust" },
            { icon: Sparkles, label: "AI Ready", desc: "Data & feedback" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4"
            >
              <item.icon className="h-5 w-5 text-pi-400 mb-2" />
              <div className="text-sm font-semibold text-white">{item.label}</div>
              <div className="text-xs text-slate-500">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search tasks…"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as TaskCategory | "all")}
          className="sm:w-56"
        >
          <option value="all">All Categories</option>
          <option value="ai_data">{categoryLabel("ai_data")}</option>
          <option value="local_service">{categoryLabel("local_service")}</option>
          <option value="micro_freelance">
            {categoryLabel("micro_freelance")}
          </option>
          <option value="survey">{categoryLabel("survey")}</option>
          <option value="content">{categoryLabel("content")}</option>
          <option value="other">{categoryLabel("other")}</option>
        </Select>
      </section>

      {/* Task grid */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Open Tasks{" "}
            <span className="text-slate-500 font-normal">
              ({filtered.length})
            </span>
          </h2>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 py-16 text-center text-slate-500">
            No open tasks match your filters. Be the first to post one.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
