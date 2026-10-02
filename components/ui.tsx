import { cn } from "@/lib/utils";
import { ReactNode, ButtonHTMLAttributes } from "react";

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
}) {
  const variants = {
    primary:
      "bg-pi-600 hover:bg-pi-500 text-white shadow-lg shadow-pi-900/40",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
    ghost: "bg-transparent hover:bg-slate-800/60 text-slate-300",
    danger: "bg-red-600/90 hover:bg-red-500 text-white",
    gold: "bg-pi-gold hover:bg-amber-400 text-slate-900 font-semibold",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm p-5 shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "success" | "warning" | "info" | "gold";
}) {
  const tones = {
    default: "bg-slate-800 text-slate-300",
    success: "bg-emerald-900/50 text-emerald-300 border border-emerald-800",
    warning: "bg-amber-900/40 text-amber-300 border border-amber-800",
    info: "bg-sky-900/40 text-sky-300 border border-sky-800",
    gold: "bg-amber-500/20 text-amber-300 border border-amber-600/40",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-pi-500 focus:outline-none focus:ring-1 focus:ring-pi-500",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-pi-500 focus:outline-none focus:ring-1 focus:ring-pi-500 min-h-[100px]",
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 focus:border-pi-500 focus:outline-none focus:ring-1 focus:ring-pi-500",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
