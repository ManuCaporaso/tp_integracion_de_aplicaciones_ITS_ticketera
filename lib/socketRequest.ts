import type { AckResult, WireTicket } from "@/lib/types";

/**
 * Envuelve un emit con callback (ack) de Socket.IO en una Promise con timeout.
 *
 * Evita que la UI quede bloqueada si el servidor no responde.
 */
export function requestAck(
  send: (ack: (result: AckResult<WireTicket>) => void) => void,
  timeoutMs = 8_000,
): Promise<AckResult<WireTicket>> {
  return new Promise((resolve) => {
    let settled = false;
    let timer: number | null = null;

    const finish = (result: AckResult<WireTicket>) => {
      if (settled) {
        return;
      }

      settled = true;
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      resolve(result);
    };

    timer = window.setTimeout(() => {
      finish({
        ok: false,
        error: "El servidor tardó demasiado en responder. Intentá nuevamente.",
      });
    }, timeoutMs);

    send(finish);
  });
}
