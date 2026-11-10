"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  CheckCircle,
  Megaphone,
  Monitor,
  Ticket as TicketIcon,
  Volume2,
  VolumeX,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { ConnectionBadge } from "@/components/ConnectionBadge";
import { useClock } from "@/hooks/useClock";
import { useQueueState } from "@/hooks/useQueueState";
import { useSocket } from "@/context/SocketContext";
import { cn } from "@/lib/cn";
import {
  formatTicketNumber,
  mapTicket,
  SOCKET_EVENTS,
} from "@/lib/types";

export function PublicDisplay() {
  const { on } = useSocket();
  const state = useQueueState();
  const clock = useClock();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundEnabledRef = useRef(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    const unsubscribe = on(SOCKET_EVENTS.TICKET_CALLED, (wireTicket) => {
      const ticket = mapTicket(wireTicket);
      const desktop = ticket.desktop ?? "—";

      setPulseKey((key) => key + 1);

      toast.info(
        `Ticket #${formatTicketNumber(ticket.number)}, favor de pasar al Escritorio ${desktop}`,
        {
          icon: <Megaphone className="h-5 w-5" />,
          duration: 12_000,
        },
      );

      if (soundEnabledRef.current) {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = 0;
          void audio.play().catch(() => undefined);
        }
      }
    });

    return unsubscribe;
  }, [on]);

  async function toggleSound() {
    if (soundEnabledRef.current) {
      soundEnabledRef.current = false;
      setSoundEnabled(false);
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    try {
      audio.volume = 0.6;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      soundEnabledRef.current = true;
      setSoundEnabled(true);
      toast.success("Sonido de llamados activado");
    } catch {
      toast.error(
        "El navegador bloqueó el audio. Hacé clic de nuevo una vez dentro de la página.",
      );
    }
  }

  const lastCalled = state?.lastCalled ?? null;
  const waiting = state?.waiting ?? [];
  const attended = state?.attended ?? [];

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-slate-950 text-white">
      <audio ref={audioRef} preload="auto" src="/sounds/turnero.mp3/" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-sky-600/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-emerald-600/15 blur-3xl"
      />

      <header className="relative z-10 flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white p-1">
            <Image
              src="/img/logoITS.png"
              alt="Logo ITS Cipolletti"
              width={300}
              height={150}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-black tracking-tight">Sistema de Turnos</p>
            <p className="text-xs text-slate-400">ITS Cipolletti</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ConnectionBadge tone="dark" />
          <time
            className="hidden font-mono text-2xl font-bold tabular-nums text-slate-100 sm:block"
            suppressHydrationWarning
          >
            {clock
              ? clock.toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : "--:--:--"}
          </time>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-slate-200 transition-colors hover:bg-white/10"
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      <main className="relative z-10 grid flex-1 gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
        <section
          aria-live="assertive"
          className="flex flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 px-6 py-10 text-center backdrop-blur"
        >
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-sky-300">
            Turno actual
          </p>

          {lastCalled ? (
            <div key={pulseKey} className="animate-ticket-pop mt-4 w-full">
              <p className="font-mono text-[clamp(6rem,26vw,18rem)] font-black leading-none tracking-tighter text-white drop-shadow-[0_0_40px_rgba(56,189,248,0.35)]">
                {formatTicketNumber(lastCalled.number)}
              </p>
              <div className="mt-6 flex flex-col items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/20 px-5 py-2.5 text-2xl font-black text-sky-100 ring-1 ring-sky-400/40 sm:text-3xl">
                  <Monitor className="h-6 w-6" />
                  Escritorio {lastCalled.desktop ?? "—"}
                </span>
                {lastCalled.name ? (
                  <p className="mt-2 text-xl font-semibold text-slate-200">
                    {lastCalled.name}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center gap-4 text-slate-400">
              <TicketIcon className="h-16 w-16" />
              <p className="text-2xl font-bold text-slate-300">
                Esperando el primer llamado
              </p>
            </div>
          )}
        </section>

        <div className="flex flex-col gap-6">
          <section className="flex-1 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-300">
              <Users className="h-4 w-4 text-sky-400" />
              Próximos turnos
            </h2>

            {waiting.length > 0 ? (
              <ol className="mt-4 space-y-3">
                {waiting.slice(0, 5).map((ticket, index) => (
                  <li
                    key={ticket.id}
                    className="flex items-center gap-4 rounded-2xl bg-white/5 px-4 py-3"
                  >
                    <span className="w-6 text-sm font-black text-slate-500">
                      {index + 1}
                    </span>
                    <span className="font-mono text-2xl font-black text-white">
                      {formatTicketNumber(ticket.number)}
                    </span>
                    <span className="ml-auto truncate text-sm font-medium text-slate-300">
                      {ticket.name?.trim() || "Sin nombre"}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-6 text-center text-sm text-slate-400">
                No hay turnos en espera.
              </p>
            )}
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-300">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              Últimos atendidos
            </h2>

            {attended.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {attended.slice(0, 3).map((ticket) => (
                  <li
                    key={ticket.id}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >
                    <span className="font-mono font-bold text-emerald-300">
                      {formatTicketNumber(ticket.number)}
                    </span>
                    <span className="truncate">{ticket.name?.trim() || "Sin nombre"}</span>
                    <span className="ml-auto shrink-0 text-xs text-slate-400">
                      Esc. {ticket.desktop ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-center text-sm text-slate-400">
                Aún no se atendieron turnos.
              </p>
            )}
          </section>
        </div>
      </main>

      <footer className="relative z-10 flex items-center justify-between px-5 py-4 text-xs text-slate-500 sm:px-8">
        <p>ITS Cipolletti · Integración de Aplicaciones</p>
        <p className={cn("text-slate-400")}>
          {state ? `${state.totalAttended} atendido(s) hoy` : "Conectando..."}
        </p>
      </footer>
    </div>
  );
}
