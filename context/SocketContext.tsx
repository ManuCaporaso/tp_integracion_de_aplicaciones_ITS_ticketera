"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { getSocket, type AppSocket } from "@/lib/socket";
import type { ClientToServerEvents, ServerToClientEvents } from "@/lib/types";

interface SocketContextValue {
  socket: AppSocket | null;
  isOnline: boolean;
  emit: <E extends keyof ClientToServerEvents>(
    event: E,
    ...args: Parameters<ClientToServerEvents[E]>
  ) => void;
  on: <E extends keyof ServerToClientEvents>(
    event: E,
    handler: ServerToClientEvents[E],
  ) => () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<AppSocket | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const hasConnected = useRef(false);

  useEffect(() => {
    const activeSocket = getSocket();
    if (!activeSocket) {
      return;
    }

    // Sincronización puntual con el sistema externo (Socket.IO) al montar.
    // No deriva estado de otro estado de React, por eso deshabilitamos la regla.
    /* eslint-disable react-hooks/set-state-in-effect */
    setSocket(activeSocket);
    setIsOnline(activeSocket.connected);
    /* eslint-enable react-hooks/set-state-in-effect */
    hasConnected.current = activeSocket.connected;

    const handleConnect = () => {
      setIsOnline(true);
      if (hasConnected.current) {
        toast.success("Conexión restablecida con el servidor", {
          id: "socket-connection",
        });
      }
      hasConnected.current = true;
    };

    const handleDisconnect = (reason: string) => {
      setIsOnline(false);
      if (reason !== "io client disconnect") {
        toast.error("Conexión perdida con el servidor WebSocket", {
          id: "socket-connection",
        });
      }
    };

    const handleConnectError = () => {
      setIsOnline(false);
      toast.error("Conexión perdida con el servidor WebSocket", {
        id: "socket-connection",
      });
    };

    activeSocket.on("connect", handleConnect);
    activeSocket.on("disconnect", handleDisconnect);
    activeSocket.on("connect_error", handleConnectError);

    return () => {
      activeSocket.off("connect", handleConnect);
      activeSocket.off("disconnect", handleDisconnect);
      activeSocket.off("connect_error", handleConnectError);
    };
  }, []);

  const emit = useCallback<SocketContextValue["emit"]>(
    (event, ...args) => {
      if (!socket?.connected) {
        toast.error("Conexión perdida con el servidor WebSocket", {
          id: "socket-connection",
        });
        return;
      }
      socket.emit(event, ...args);
    },
    [socket],
  );

  const on = useCallback<SocketContextValue["on"]>(
    (event, handler) => {
      if (!socket) {
        return () => undefined;
      }

      // Socket.IO mezcla eventos reservados ("connect", "disconnect"...) con los
      // eventos propios en un único tipo. Esta proyección limita el API a los
      // eventos de dominio, conservando el tipado estricto.
      type AppEmitter = {
        on: <E extends keyof ServerToClientEvents>(
          eventName: E,
          listener: ServerToClientEvents[E],
        ) => void;
        off: <E extends keyof ServerToClientEvents>(
          eventName: E,
          listener: ServerToClientEvents[E],
        ) => void;
      };

      const emitter = socket as unknown as AppEmitter;
      emitter.on(event, handler);

      return () => {
        emitter.off(event, handler);
      };
    },
    [socket],
  );

  return (
    <SocketContext.Provider value={{ socket, isOnline, emit, on }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket debe usarse dentro de <SocketProvider>");
  }

  return context;
}
