"use client";

import Link from "next/link";
import { Card, Badge, Button } from "./ui";
import type { Task } from "@/lib/types";
import { categoryLabel, formatPi, formatRelativeTime } from "@/lib/utils";
import { MapPin, Clock, Coins } from "lucide-react";

export default function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="group hover:border-pi-700/60 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge tone="info">{categoryLabel(task.category)}</Badge>
            {task.status === "open" && <Badge tone="success">Open</Badge>}
            {task.status === "assigned" && <Badge tone="warning">In Progress</Badge>}
            {task.status === "completed" && <Badge tone="gold">Completed</Badge>}
          </div>
          <Link href={`/tasks/${task.id}`}>
            <h3 className="text-base font-semibold text-white group-hover:text-pi-300 transition line-clamp-2">
              {task.title}
            </h3>
          </Link>
          <p className="mt-1.5 text-sm text-slate-400 line-clamp-2">
            {task.description}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="flex items-center gap-1 text-pi-400 font-bold text-lg">
            <Coins className="h-4 w-4" />
            {formatPi(task.rewardPi)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {formatRelativeTime(task.createdAt)}
        </span>
        {task.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {task.location}
          </span>
        )}
        <span>by @{task.posterUsername}</span>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={`/tasks/${task.id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">
            View Details
          </Button>
        </Link>
        {task.status === "open" && (
          <Link href={`/tasks/${task.id}`}>
            <Button size="sm">Apply / Claim</Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
