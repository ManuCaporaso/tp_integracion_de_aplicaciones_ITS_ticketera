"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BellRing,
  CheckCircle,
  Clock,
  Inbox,
  Loader2,
  Monitor,
  RotateCcw,
  Ticket as TicketIcon,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { ConnectionBadge } from "@/components/ConnectionBadge";
import { TicketCard } from "@/components/TicketCard";
import { useSocket } from "@/context/SocketContext";
import { useElapsedMinutes } from "@/hooks/useElapsedMinutes";
import { useQueueState } from "@/hooks/useQueueState";
import { cn } from "@/lib/cn";
import { requestAck } from "@/lib/socketRequest";
import {
  formatTicketNumber,
  SOCKET_EVENTS,
  type Ticket,
} from "@/lib/types";

type Action = "call" | "attend" | "recall" | null;

function WaitingRow({ ticket }: { ticket: Ticket }) {
  const elapsed = useElapsedMinutes(ticket.createdAt);

  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-mono text-sm font-black text-slate-700">
          {formatTicketNumber(ticket.number)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {ticket.name?.trim() || "Sin nombre"}
          </p>
          <p className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            {elapsed === null ? "—" : `${elapsed} min de espera`}
          </p>
        </div>
      </div>
      <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-600">
        En espera
      </span>
    </li>
  );
}

export function DesktopControl({ desktop }: { desktop: number }) {
  const { socket, isOnline } = useSocket();
  const state = useQueueState();
  const [action, setAction] = useState<Action>(null);

  const activeTicket = state?.byDesktop[desktop] ?? null;
  const waiting = state?.waiting ?? [];
  const isBusy = action !== null;
  const isReady = state !== null;

  async function callNext() {
    if (!socket?.connected) {
      toast.error("Conexión perdida con el servidor WebSocket");
      return;
    }

    setAction("call");
    const result = await requestAck((ack) =>
      socket.emit(SOCKET_EVENTS.CALL_NEXT, { desktop }, ack),
    );
    setAction(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    const ticket = result.ticket;
    toast.success(
      `Ticket #${formatTicketNumber(ticket.number)} llamado al escritorio ${desktop}`,
      { icon: <BellRing className="h-5 w-5" /> },
    );
  }

  async function markAttended() {
    if (!socket?.connected) {
      toast.error("Conexión perdida con el servidor WebSocket");
      return;
    }

    setAction("attend");
    const result = await requestAck((ack) =>
      socket.emit(SOCKET_EVENTS.TICKET_ATTENDED, { desktop }, ack),
    );
    setAction(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(
      `Ticket #${formatTicketNumber(result.ticket.number)} marcado como atendido`,
      {
        description: `Escritorio ${desktop}`,
        icon: <CheckCircle className="h-5 w-5" />,
      },
    );
  }

  async function recallTicket() {
    if (!socket?.connected) {
      toast.error("Conexión perdida con el servidor WebSocket");
      return;
    }

    if (!activeTicket) {
      return;
    }

    setAction("recall");
    const result = await requestAck((ack) =>
      socket.emit(SOCKET_EVENTS.RECALL_TICKET, { desktop }, ack),
    );
    setAction(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.info(
      `Llamando nuevamente al Ticket #${formatTicketNumber(result.ticket.number)}...`,
      { icon: <RotateCcw className="h-5 w-5" /> },
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
            <Monitor className="h-4 w-4" />
            Panel de operador
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Escritorio {desktop}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Llamá al siguiente ticket y finalizá la atención cuando termines.
          </p>
        </div>
        <ConnectionBadge />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {[1, 2, 3].map((number) => (
          <Link
            key={number}
            href={`/escritorio/${number}`}
            aria-current={number === desktop ? "page" : undefined}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-bold transition-colors",
              number === desktop
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100",
            )}
          >
            Escritorio {number}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-sky-600">
            <Users className="h-3.5 w-3.5" />
            En espera
          </p>
          <p className="mt-1 font-mono text-3xl font-black text-slate-900">
            {isReady ? waiting.length : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600">
            <CheckCircle className="h-3.5 w-3.5" />
            Atendidos hoy
          </p>
          <p className="mt-1 font-mono text-3xl font-black text-slate-900">
            {isReady ? state.totalAttended : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
            <TicketIcon className="h-3.5 w-3.5" />
            Último llamado
          </p>
          <p className="mt-1 font-mono text-3xl font-black text-slate-900">
            {state?.lastCalled
              ? `#${formatTicketNumber(state.lastCalled.number)}`
              : "—"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section>
          <TicketCard
            ticket={activeTicket}
            title={`Ticket en escritorio ${desktop}`}
            showElapsed={Boolean(activeTicket)}
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={callNext}
              disabled={
                isBusy ||
                !isOnline ||
                !isReady ||
                waiting.length === 0 ||
                Boolean(activeTicket)
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-sky-600/20 transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
            >
              {action === "call" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <BellRing className="h-5 w-5" />
              )}
              Llamar siguiente
            </button>

            <button
              type="button"
              onClick={markAttended}
              disabled={isBusy || !isOnline || !activeTicket}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
            >
              {action === "attend" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              Marcar atendido
            </button>

            {activeTicket && (
              <button
                type="button"
                onClick={recallTicket}
                disabled={isBusy || !isOnline}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-black text-slate-700 shadow-sm transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:col-span-2"
              >
                {action === "recall" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <RotateCcw className="h-5 w-5" />
                )}
                Re-llamar Ticket
              </button>
            )}
          </div>

          <p className="mt-3 text-center text-xs text-slate-400 sm:text-left">
            {!isReady
              ? "Sincronizando estado con el servidor..."
              : activeTicket
                ? "Finalizá la atención actual para poder llamar al próximo ticket."
                : waiting.length === 0
                  ? "No hay tickets en espera. Podés aguardar nuevas solicitudes."
                  : "El próximo ticket de la fila será asignado a este escritorio."}
          </p>
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <header className="flex items-center justify-between gap-2">
              <h2 className="inline-flex items-center gap-2 text-sm font-bold text-slate-800">
                <Users className="h-4 w-4 text-sky-500" />
                Próximos turnos
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-600">
                {waiting.length}
              </span>
            </header>

            {waiting.length > 0 ? (
              <>
                <ul className="mt-2 divide-y divide-slate-100">
                  {waiting.slice(0, 6).map((ticket) => (
                    <WaitingRow key={ticket.id} ticket={ticket} />
                  ))}
                </ul>
                {waiting.length > 6 ? (
                  <p className="mt-3 text-xs font-semibold text-slate-400">
                    +{waiting.length - 6} ticket(s) más en la fila
                  </p>
                ) : null}
              </>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 py-8 text-center">
                <Inbox className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-semibold text-slate-500">Fila vacía</p>
                <p className="max-w-48 text-xs text-slate-400">
                  Los tickets nuevos aparecerán acá automáticamente.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <h2 className="inline-flex items-center gap-2 text-sm font-bold text-slate-800">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Atendidos recientes
            </h2>

            {state && state.attended.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {state.attended.slice(0, 4).map((ticket) => (
                  <li
                    key={ticket.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2"
                  >
                    <span className="font-mono text-sm font-bold text-slate-700">
                      #{formatTicketNumber(ticket.number)}
                    </span>
                    <span className="truncate text-xs text-slate-500">
                      {ticket.name?.trim() || "Sin nombre"}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-slate-500">
                      Esc. {ticket.desktop ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-slate-400">
                Todavía no hay tickets atendidos.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
