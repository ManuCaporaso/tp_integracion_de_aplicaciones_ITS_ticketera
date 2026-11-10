import {
  io,
  type ManagerOptions,
  type Socket,
  type SocketOptions,
} from "socket.io-client";

import type { ClientToServerEvents, ServerToClientEvents } from "@/lib/types";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * URL del backend de sockets. En el despliegue único de Render no se define:
 * el cliente se conecta al MISMO origen (conexión relativa `io()`).
 *
 * Solo se configura (vía NEXT_PUBLIC_SOCKET_URL) si el backend vive en otro origen.
 */
const configuredUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();

let client: AppSocket | null = null;

const defaultOptions: Partial<ManagerOptions & SocketOptions> = {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10_000,
  autoConnect: true,
};

/**
 * Crea (una sola vez) el cliente Socket.IO.
 *
 * Se llama desde un efecto de React, nunca durante el render del servidor,
 * porque `socket.io-client` necesita `window`.
 */
export function getSocket(): AppSocket | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!client) {
    client = configuredUrl ? io(configuredUrl, defaultOptions) : io(defaultOptions);
  }

  if (!client.connected) {
    client.connect();
  }

  return client;
}

export function disconnectSocket(): void {
  client?.disconnect();
}
