"use client";

import { useEffect, useState } from "react";

import { useSocket } from "@/context/SocketContext";
import {
  mapQueueSnapshot,
  SOCKET_EVENTS,
  type QueueSnapshot,
  type TicketState,
} from "@/lib/types";

/**
 * Mantiene sincronizado el estado de la ticketera.
 *
 * - Escucha `estado-actual` (broadcast del backend).
 * - Pide `solicitar-estado` al montar y en cada reconexión.
 */
export function useQueueState(): TicketState | null {
  const { socket, on } = useSocket();
  const [state, setState] = useState<TicketState | null>(null);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleState = (snapshot: QueueSnapshot) => {
      setState(mapQueueSnapshot(snapshot));
    };

    const requestState = () => {
      socket.emit(SOCKET_EVENTS.REQUEST_STATE, handleState);
    };

    const unsubscribe = on(SOCKET_EVENTS.STATE, handleState);

    if (socket.connected) {
      requestState();
    }

    socket.on("connect", requestState);

    return () => {
      unsubscribe();
      socket.off("connect", requestState);
    };
  }, [socket, on]);

  return state;
}
