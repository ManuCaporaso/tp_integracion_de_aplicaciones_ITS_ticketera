/**
 * Lógica de la ticketera (fila de turnos) sobre Socket.IO.
 *
 * Se monta sobre el MISMO servidor HTTP que sirve Next.js, de modo que
 * frontend y backend viven en el mismo puerto/origen (despliegue único en Render).
 *
 * Los nombres de eventos y la forma de los datos coinciden con `lib/types.ts`.
 */

import { randomUUID } from "crypto";
import type { Server, Socket } from "socket.io";

import {
  SOCKET_EVENTS,
  type ClientToServerEvents,
  type QueueSnapshot,
  type ServerToClientEvents,
  type WireTicket,
} from "../lib/types";

const MAX_HISTORY = 50;

function sanitizeName(rawName: unknown): string {
  if (typeof rawName !== "string") {
    return "";
  }

  return rawName.trim().slice(0, 60);
}

function isValidDesktop(desktop: number): boolean {
  return Number.isInteger(desktop) && desktop >= 1 && desktop <= 99;
}

export function attachTicketera(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
): void {
  const waiting: WireTicket[] = [];
  const attended: WireTicket[] = [];
  let lastCalled: WireTicket | null = null;
  const byDesktop = new Map<number, WireTicket>();
  let nextNumber = 1;
  let totalAttended = 0;

  function snapshot(): QueueSnapshot {
    return {
      waiting: [...waiting],
      attended: [...attended],
      lastCalled,
      byDesktop: Object.fromEntries(byDesktop),
      totalCreated: nextNumber - 1,
      totalAttended,
      updatedAt: new Date().toISOString(),
    };
  }

  function broadcast(): void {
    io.emit(SOCKET_EVENTS.STATE, snapshot());
  }

  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log(`Cliente conectado: ${socket.id}`);

    socket.emit(SOCKET_EVENTS.STATE, snapshot());

    socket.on(SOCKET_EVENTS.CREATE_TICKET, (payload, ack) => {
      const ticket: WireTicket = {
        id: randomUUID(),
        number: nextNumber,
        desktop: null,
        createdAt: new Date().toISOString(),
        name: sanitizeName(payload?.name),
        completedAt: null,
      };

      nextNumber += 1;
      waiting.push(ticket);

      broadcast();
      io.emit(SOCKET_EVENTS.TICKET_CREATED, ticket);
      ack({ ok: true, ticket });

      console.log(`Ticket #${ticket.number} creado (${ticket.id})`);
    });

    socket.on(SOCKET_EVENTS.CALL_NEXT, (payload, ack) => {
      const desktop = Number(payload?.desktop);

      if (!isValidDesktop(desktop)) {
        ack({ ok: false, error: "Número de escritorio inválido." });
        return;
      }

      if (byDesktop.has(desktop)) {
        ack({
          ok: false,
          error: "Este escritorio ya tiene un ticket en atención.",
        });
        return;
      }

      const ticket = waiting.shift();

      if (!ticket) {
        ack({ ok: false, error: "No hay tickets en espera." });
        return;
      }

      ticket.desktop = desktop;
      byDesktop.set(desktop, ticket);
      lastCalled = ticket;

      broadcast();
      io.emit(SOCKET_EVENTS.TICKET_CALLED, ticket);
      ack({ ok: true, ticket });

      console.log(`Ticket #${ticket.number} llamado al escritorio ${desktop}`);
    });

    socket.on(SOCKET_EVENTS.TICKET_ATTENDED, (payload, ack) => {
      const desktop = Number(payload?.desktop);

      if (!isValidDesktop(desktop)) {
        ack({ ok: false, error: "Número de escritorio inválido." });
        return;
      }

      const active = byDesktop.get(desktop);

      if (!active) {
        ack({
          ok: false,
          error: "No hay ningún ticket en atención en este escritorio.",
        });
        return;
      }

      active.completedAt = new Date().toISOString();
      attended.unshift(active);
      byDesktop.delete(desktop);
      totalAttended += 1;

      if (attended.length > MAX_HISTORY) {
        attended.length = MAX_HISTORY;
      }

      broadcast();
      ack({ ok: true, ticket: active });

      console.log(`Ticket #${active.number} atendido en escritorio ${desktop}`);
    });

    socket.on(SOCKET_EVENTS.RECALL_TICKET, (payload, ack) => {
      const desktop = Number(payload?.desktop);

      if (!isValidDesktop(desktop)) {
        ack({ ok: false, error: "Número de escritorio inválido." });
        return;
      }

      const active = byDesktop.get(desktop);

      if (!active) {
        ack({
          ok: false,
          error: "No hay ningún ticket en atención en este escritorio.",
        });
        return;
      }

      io.emit(SOCKET_EVENTS.TICKET_RECALLED, active);
      ack({ ok: true, ticket: active });

      console.log(`Ticket #${active.number} re-llamado al escritorio ${desktop}`);
    });

    socket.on(SOCKET_EVENTS.REQUEST_STATE, (ack) => {
      ack(snapshot());
    });

    socket.on("disconnect", () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });
}
