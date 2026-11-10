/**
 * Modelo de dominio de la ticketera.
 *
 * El backend transporta las fechas como strings ISO (JSON no tiene tipo Date).
 * La capa `mapTicket` / `mapQueueSnapshot` convierte esos datos a `Ticket`
 * antes de que lleguen a los componentes.
 */
export interface Ticket {
  id: string;
  number: number;
  desktop: number | null;
  createdAt: Date;
  /** Campo heredado del sistema original (nombre de la persona). */
  name?: string;
  completedAt?: Date | null;
}

/** Representación serializada de un ticket tal como viaja por Socket.IO. */
export interface WireTicket {
  id: string;
  number: number;
  desktop: number | null;
  createdAt: string;
  name?: string;
  completedAt?: string | null;
}

/** Estado completo que emite el servidor en `estado-actual`. */
export interface QueueSnapshot {
  waiting: WireTicket[];
  attended: WireTicket[];
  lastCalled: WireTicket | null;
  byDesktop: Record<string, WireTicket | null>;
  totalCreated: number;
  totalAttended: number;
  updatedAt: string;
}

/** Estado ya convertido a modelo de dominio para usar en la UI. */
export interface TicketState {
  waiting: Ticket[];
  attended: Ticket[];
  lastCalled: Ticket | null;
  byDesktop: Record<number, Ticket | null>;
  totalCreated: number;
  totalAttended: number;
  updatedAt: Date;
}

export interface CreateTicketPayload {
  name?: string;
}

export interface DesktopPayload {
  desktop: number;
}

export type AckResult<T> =
  | { ok: true; ticket: T }
  | { ok: false; error: string };

/** Eventos que el servidor envía al cliente. */
export interface ServerToClientEvents {
  "estado-actual": (snapshot: QueueSnapshot) => void;
  "ticket-llamado": (ticket: WireTicket) => void;
  "ticket-creado": (ticket: WireTicket) => void;
  "socket-error": (message: string) => void;
}

/** Eventos que el cliente envía al servidor. */
export interface ClientToServerEvents {
  "crear-ticket": (
    payload: CreateTicketPayload,
    ack: (result: AckResult<WireTicket>) => void,
  ) => void;
  "llamar-siguiente": (
    payload: DesktopPayload,
    ack: (result: AckResult<WireTicket>) => void,
  ) => void;
  "ticket-atendido": (
    payload: DesktopPayload,
    ack: (result: AckResult<WireTicket>) => void,
  ) => void;
  "solicitar-estado": (ack: (snapshot: QueueSnapshot) => void) => void;
}

export const SOCKET_EVENTS = {
  CREATE_TICKET: "crear-ticket",
  CALL_NEXT: "llamar-siguiente",
  TICKET_ATTENDED: "ticket-atendido",
  REQUEST_STATE: "solicitar-estado",
  STATE: "estado-actual",
  TICKET_CALLED: "ticket-llamado",
  TICKET_CREATED: "ticket-creado",
  SOCKET_ERROR: "socket-error",
} as const;

export function mapTicket(ticket: WireTicket): Ticket {
  return {
    ...ticket,
    createdAt: new Date(ticket.createdAt),
    completedAt: ticket.completedAt ? new Date(ticket.completedAt) : null,
  };
}

export function mapQueueSnapshot(snapshot: QueueSnapshot): TicketState {
  const byDesktop: Record<number, Ticket | null> = {};

  for (const [desktop, ticket] of Object.entries(snapshot.byDesktop)) {
    byDesktop[Number(desktop)] = ticket ? mapTicket(ticket) : null;
  }

  return {
    waiting: snapshot.waiting.map(mapTicket),
    attended: snapshot.attended.map(mapTicket),
    lastCalled: snapshot.lastCalled ? mapTicket(snapshot.lastCalled) : null,
    byDesktop,
    totalCreated: snapshot.totalCreated,
    totalAttended: snapshot.totalAttended,
    updatedAt: new Date(snapshot.updatedAt),
  };
}

/** Formatea el número interno como ticket visible: 7 -> "007". */
export function formatTicketNumber(number: number): string {
  return String(number).padStart(3, "0");
}
