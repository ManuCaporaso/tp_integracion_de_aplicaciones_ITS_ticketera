"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle,
  Loader2,
  Sparkles,
  Ticket as TicketIcon,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { useSocket } from "@/context/SocketContext";
import { useQueueState } from "@/hooks/useQueueState";
import { requestAck } from "@/lib/socketRequest";
import {
  formatTicketNumber,
  mapTicket,
  SOCKET_EVENTS,
  type Ticket,
} from "@/lib/types";

export function CreateTicketForm() {
  const { socket, isOnline } = useSocket();
  const state = useQueueState();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  const waitingCount = state?.waiting.length ?? 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!socket?.connected) {
      toast.error("Conexión perdida con el servidor WebSocket");
      return;
    }

    setIsSubmitting(true);
    const trimmedName = name.trim();

    const result = await requestAck((ack) =>
      socket.emit(
        SOCKET_EVENTS.CREATE_TICKET,
        { name: trimmedName || undefined },
        ack,
      ),
    );

    setIsSubmitting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    const ticket = mapTicket(result.ticket);
    setCreatedTicket(ticket);
    setName("");

    toast.success("Ticket generado correctamente", {
      description: `Tu número es el #${formatTicketNumber(ticket.number)}. Esperá tu llamado.`,
      icon: <TicketIcon className="h-5 w-5" />,
    });
  }

  if (createdTicket) {
    return (
      <div className="animate-ticket-pop mx-auto w-full max-w-xl">
        <div className="overflow-hidden rounded-3xl border border-sky-200 bg-white shadow-2xl shadow-sky-950/10">
          <div className="bg-gradient-to-r from-sky-600 to-emerald-600 px-6 py-4 text-white">
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em]">
              <CheckCircle className="h-4 w-4" />
              Ticket generado
            </p>
          </div>

          <div className="p-7 text-center sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
              Tu número
            </p>
            <p className="mt-2 font-mono text-7xl font-black tracking-tighter text-slate-950 sm:text-8xl">
              #{formatTicketNumber(createdTicket.number)}
            </p>

            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
              <Users className="h-4 w-4" />
              {waitingCount === 0
                ? "Sos el próximo en ser llamado"
                : `Hay ${waitingCount} ticket${waitingCount === 1 ? "" : "s"} en espera`}
            </p>

            {createdTicket.name ? (
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                <User className="h-4 w-4 text-slate-400" />
                A nombre de {createdTicket.name}
              </p>
            ) : null}

            <div className="mt-7 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCreatedTicket(null)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
              >
                <TicketIcon className="h-4 w-4" />
                Sacar otro ticket
              </button>
              <Link
                href="/publico"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Ver pantalla pública
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-slate-400">
              Atendé el llamado de la pantalla. El número y el escritorio aparecerán
              automáticamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
          <Sparkles className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            Pedir un número
          </h2>
          <p className="text-sm text-slate-500">El nombre es opcional.</p>
        </div>
      </div>

      {!isOnline ? (
        <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Reconectando con el servidor de turnos. Podés intentar igualmente.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="nombre"
            className="mb-1.5 block text-sm font-bold text-slate-700"
          >
            Nombre completo{" "}
            <span className="font-medium text-slate-400">(opcional)</span>
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
            autoComplete="off"
            placeholder="Ej. Manuel Caporaso"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Se muestra en la pantalla pública junto a tu ticket.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-4 text-base font-black text-white shadow-lg shadow-sky-600/20 transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <TicketIcon className="h-5 w-5" />
          )}
          {isSubmitting ? "Generando ticket..." : "Solicitar mi turno"}
        </button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-5 text-sm">
        <span className="inline-flex items-center gap-1.5 font-medium text-slate-500">
          <Users className="h-4 w-4 text-sky-500" />
          {state ? `${waitingCount} en espera` : "Sincronizando fila..."}
        </span>
        <span className="text-xs text-slate-400">
          Los tickets se generan en tiempo real.
        </span>
      </div>
    </div>
  );
}
