"use client";

import { CheckCircle, Clock, Monitor, Ticket as TicketIcon, User } from "lucide-react";

import { useElapsedMinutes } from "@/hooks/useElapsedMinutes";
import { cn } from "@/lib/cn";
import { formatTicketNumber, type Ticket } from "@/lib/types";

type TicketCardVariant = "active" | "attended" | "waiting";

interface TicketCardProps {
  ticket: Ticket | null;
  title?: string;
  variant?: TicketCardVariant;
  showElapsed?: boolean;
  className?: string;
}

const variantStyles: Record<TicketCardVariant, string> = {
  active: "border-sky-200 bg-white shadow-xl shadow-sky-950/5",
  attended: "border-slate-200 bg-slate-50",
  waiting: "border-slate-200 bg-white",
};

export function TicketCard({
  ticket,
  title = "Ticket actual",
  variant = "active",
  showElapsed = true,
  className,
}: TicketCardProps) {
  const elapsedMinutes = useElapsedMinutes(ticket?.createdAt);

  if (!ticket) {
    return (
      <div
        className={cn(
          "flex min-h-52 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 p-8 text-center",
          className,
        )}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <TicketIcon className="h-7 w-7" />
        </span>
        <div>
          <p className="font-semibold text-slate-700">Sin ticket activo</p>
          <p className="mt-1 text-sm text-slate-500">
            Cuando llames al siguiente, aparecerá acá.
          </p>
        </div>
      </div>
    );
  }

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-3xl border p-6 sm:p-7",
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
          <TicketIcon className="h-3.5 w-3.5" />
          {title}
        </span>

        {variant === "attended" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            <CheckCircle className="h-3.5 w-3.5" />
            Atendido
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            En atención
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-1">
        <p className="font-mono text-6xl font-black leading-none tracking-tighter text-slate-950 sm:text-7xl">
          #{formatTicketNumber(ticket.number)}
        </p>
        <span className="pb-1 text-sm font-semibold uppercase tracking-widest text-slate-400">
          Ticket
        </span>
      </div>

      <dl className="mt-6 grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-100/80 px-3 py-2.5">
          <Monitor className="h-4 w-4 shrink-0 text-slate-500" />
          <div className="min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Escritorio
            </dt>
            <dd className="truncate text-sm font-semibold text-slate-800">
              {ticket.desktop === null ? "Sin asignar" : `Escritorio ${ticket.desktop}`}
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-slate-100/80 px-3 py-2.5">
          <User className="h-4 w-4 shrink-0 text-slate-500" />
          <div className="min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Persona
            </dt>
            <dd className="truncate text-sm font-semibold text-slate-800">
              {ticket.name?.trim() || "Sin nombre"}
            </dd>
          </div>
        </div>
      </dl>

      {showElapsed ? (
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          {elapsedMinutes === null
            ? "Calculando tiempo..."
            : elapsedMinutes === 0
              ? "Emitido hace instantes"
              : `Emitido hace ${elapsedMinutes} min`}
        </p>
      ) : null}
    </article>
  );
}
