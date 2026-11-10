"use client";

import { CheckCircle, Monitor, Radio, Ticket, Users } from "lucide-react";

import { useQueueState } from "@/hooks/useQueueState";
import { formatTicketNumber } from "@/lib/types";

export function HomeStatus() {
  const state = useQueueState();

  const waiting = state?.waiting.length ?? 0;
  const attended = state?.totalAttended ?? 0;
  const lastCalled = state?.lastCalled ?? null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
          <Radio className="h-4 w-4 text-sky-500" />
          Estado en vivo
        </h2>
        <span className="text-xs font-medium text-slate-400">
          {state
            ? `Actualizado ${state.updatedAt.toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "Sincronizando..."}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-sky-50 p-4">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-sky-600">
            <Users className="h-3.5 w-3.5" />
            En espera
          </p>
          <p className="mt-2 font-mono text-4xl font-black text-sky-950">{waiting}</p>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600">
            <CheckCircle className="h-3.5 w-3.5" />
            Atendidos
          </p>
          <p className="mt-2 font-mono text-4xl font-black text-emerald-950">{attended}</p>
        </div>

        <div className="rounded-2xl bg-slate-100 p-4">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
            <Ticket className="h-3.5 w-3.5" />
            Último llamado
          </p>
          <p className="mt-2 font-mono text-4xl font-black text-slate-900">
            {lastCalled ? `#${formatTicketNumber(lastCalled.number)}` : "—"}
          </p>
          {lastCalled?.desktop !== null && lastCalled?.desktop !== undefined ? (
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
              <Monitor className="h-3.5 w-3.5" />
              Escritorio {lastCalled.desktop}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
