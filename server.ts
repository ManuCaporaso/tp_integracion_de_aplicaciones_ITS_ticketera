/**
 * Servidor unificado para Render.
 *
 * - Sirve la aplicación Next.js (App Router) con `next start` / dev.
 * - Monta Socket.IO sobre el MISMO servidor HTTP, en el mismo puerto y origen.
 * - Lee `PORT` de forma dinámica (lo provee Render) y escucha en 0.0.0.0.
 *
 * Ejecutado con `tsx` (`npm run dev` y `npm start`).
 */

import "dotenv/config";
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

import { attachTicketera } from "./server/ticketera";
import type { ClientToServerEvents, ServerToClientEvents } from "./lib/types";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

// Orígenes extra permitidos para CORS (separados por coma). Por defecto se
// restringe al mismo origen, ya que en Render frontend y socket comparten origen.
const extraOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    if (req.url === "/health" || req.url === "/health/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          service: "ticketera-its",
          uptime: Math.round(process.uptime()),
        }),
      );
      return;
    }

    // Socket.IO atiende las rutas /socket.io/*; todo lo demás lo sirve Next.js.
    if (req.url?.startsWith("/socket.io")) {
      return;
    }

    handle(req, res);
  });

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: extraOrigins.length > 0 ? extraOrigins : false,
      methods: ["GET", "POST"],
    },
  });

  attachTicketera(io);

  httpServer.listen(port, hostname, () => {
    console.log(
      `> Ticketera ITS lista en http://${hostname}:${port} (${
        dev ? "development" : "production"
      })`,
    );
  });
});
