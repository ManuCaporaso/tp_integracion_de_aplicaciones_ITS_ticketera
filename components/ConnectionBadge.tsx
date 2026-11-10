"use client";

import { Wifi, WifiOff } from "lucide-react";

import { useSocket } from "@/context/SocketContext";
import { cn } from "@/lib/cn";

interface ConnectionBadgeProps {
  tone?: "light" | "dark";
  className?: string;
}

export function ConnectionBadge({ tone = "light", className }: ConnectionBadgeProps) {
  const { isOnline } = useSocket();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
        isOnline
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
          : "border-amber-500/30 bg-amber-500/10 text-amber-700",
        tone === "dark" &&
          (isOnline
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
            : "border-amber-400/40 bg-amber-400/10 text-amber-300"),
        className,
      )}
      title={isOnline ? "Conectado al servidor WebSocket" : "Sin conexión"}
    >
      <span className="relative flex h-2 w-2">
        {isOnline ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
        ) : null}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            isOnline ? "bg-emerald-500" : "bg-amber-500",
          )}
        />
      </span>
      {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      {isOnline ? "En línea" : "Sin conexión"}
    </span>
  );
}
