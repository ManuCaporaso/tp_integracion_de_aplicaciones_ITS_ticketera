# 🎟️ Ticketera ITS

Sistema de turnos en tiempo real para el **Instituto Técnico Superior de Cipolletti**.
Trabajo práctico de la materia **Integración de Aplicaciones**.

Proyecto legacy migrado a una arquitectura moderna y preparado para desplegarse como
**un único Web Service en Render** (frontend Next.js + backend Socket.IO en el mismo
puerto y origen).

- **Next.js 16 (App Router)** + **TypeScript**
- **Tailwind CSS v4**
- **Lucide Icons** + **Sonner** (notificaciones toast)
- **Socket.IO** (cliente y servidor en el mismo proceso)
- Servidor unificado con `server.ts` + `tsx`

---

## Arquitectura (servicio único)

```
                        Render (un solo Web Service)
┌─────────────────────────────────────────────────────────────────┐
│  server.ts  ──  http.Server en 0.0.0.0:PORT (lo provee Render)  │
│                                                                 │
│   ┌──────────────────────┐        ┌───────────────────────────┐ │
│   │  Next.js (App Router)│        │  Socket.IO (ticketera)    │ │
│   │  /, /crear-ticket,   │        │  server/ticketera.ts      │ │
│   │  /escritorio/[id],   │        │  fila de turnos en memoria │ │
│   │  /publico            │        └───────────┬───────────────┘ │
│   └──────────┬───────────┘                    │                 │
│              └───────────►  cliente Socket.IO ◄─────────────────┘
│                    (conexión relativa: mismo origen)             │
└─────────────────────────────────────────────────────────────────┘
```

El cliente Socket.IO se conecta al **mismo origen** (conexión relativa `io()`), por lo
que no hace falta configurar URLs ni CORS entre frontend y backend.

---

## Estructura del proyecto

```
.
├── app/                    # Rutas (App Router)
│   ├── page.tsx            # Inicio / selección de rol
│   ├── crear-ticket/       # Pedir un nuevo ticket
│   ├── escritorio/[id]/    # Panel dinámico del operador
│   ├── publico/            # Pantalla gigante de la sala de espera
│   ├── layout.tsx          # Provider global + <Toaster>
│   └── not-found.tsx       # 404
├── components/             # TicketCard, DesktopControl, PublicDisplay, etc.
├── context/SocketContext.tsx  # Provider + hook useSocket()
├── hooks/                  # useQueueState, useElapsedMinutes, useClock
├── lib/                    # types.ts, socket.ts, socketRequest.ts, cn.ts
├── server/                 # Lógica del servidor unificado
│   └── ticketera.ts        # Socket.IO: fila de turnos y eventos
├── server.ts               # Entry point: Next.js + Socket.IO (mismo puerto)
├── legacy_backup/          # Código original respaldado (solo consulta)
├── render.yaml             # Blueprint de Render
├── .env.example            # Variables de entorno (opcionales)
└── .env.local              # Variables locales (no versionado)
```

---

## Requisitos

- **Node.js ≥ 20.9** (recomendado 22)
- **npm**

---

## Instalación y ejecución local

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el servidor unificado (Next.js + Socket.IO en el puerto 3000)
npm run dev
```

Abrí `http://localhost:3000` y usá las tres vistas:

| Vista | URL | Uso |
|---|---|---|
| Inicio / roles | `/` | Elegir entre crear ticket, operar o pantalla pública |
| Crear ticket | `/crear-ticket` | Sacar un número para la fila |
| Escritorio | `/escritorio/1` … `/escritorio/3` | Llamar al siguiente y marcar atendido |
| Pantalla pública | `/publico` | Pantalla de la sala de espera |

El endpoint `GET /health` devuelve el estado del servicio (útil para monitoreo).

---

## Variables de entorno

En el despliegue único **no es necesario definir nada**: el cliente se conecta al
mismo origen.

| Variable | Requerida | Descripción |
|---|---|---|
| `PORT` | No (Render la provee) | Puerto del servidor. Por defecto `3000`. |
| `NODE_ENV` | No (Render la define) | `production` activa el modo producción. |
| `NEXT_PUBLIC_SOCKET_URL` | No | Solo si el backend de sockets vive en **otro** origen. Dejala vacía para el modo unificado. |
| `CLIENT_ORIGIN` | No | Orígenes extra permitidos por CORS (separados por coma), solo si conectás desde otro dominio. |

---

## Eventos WebSocket

| Evento | Dirección | Descripción |
|---|---|---|
| `crear-ticket` | cliente → servidor | Crea un ticket con `{ name?: string }` |
| `llamar-siguiente` | cliente → servidor | Asigna el primer ticket en espera a `{ desktop: number }` |
| `ticket-atendido` | cliente → servidor | Finaliza la atención de `{ desktop: number }` |
| `solicitar-estado` | cliente → servidor | Pide el estado completo actual |
| `estado-actual` | servidor → cliente | Estado completo (broadcast) |
| `ticket-llamado` | servidor → cliente | Un ticket fue llamado (para pantalla pública) |
| `ticket-creado` | servidor → cliente | Un ticket fue creado |

### Entidad `Ticket`

```ts
interface Ticket {
  id: string;
  number: number;
  desktop: number | null;
  createdAt: Date;
  name?: string;
  completedAt?: Date | null;
}
```

---

## Despliegue en Render

1. Subí todos los cambios finalizados a la rama principal de GitHub:

   ```bash
   git push origin main
   ```

2. Entrá a [dashboard.render.com](https://dashboard.render.com).
3. Hacé clic en **New +** → **Web Service**.
4. Conectá el repositorio de GitHub `tp_integracion_de_aplicaciones_ITS_ticketera`.
5. Render detectará automáticamente el archivo `render.yaml` (o podés seleccionar
   la configuración manual):
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
6. Confirmá y hacé clic en **Deploy Web Service**.

Render asigna automáticamente un puerto dinámico a través de la variable `PORT`, y
el servidor (`server.ts`) lo toma y escucha en `0.0.0.0`.

---

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor unificado en modo desarrollo (`tsx watch server.ts`) |
| `npm run build` | Build de producción de Next.js |
| `npm start` | Servidor unificado en producción (`NODE_ENV=production`) |
| `npm run lint` | ESLint |

---

## Notas y solución de problemas

- **El audio de la pantalla pública** requiere una interacción previa del usuario
  (política de autoplay de los navegadores). Usá el botón de sonido una vez.
- **Conexión relativa**: si no definís `NEXT_PUBLIC_SOCKET_URL`, el cliente usa
  `io()` y se conecta al mismo origen; esto es lo correcto para el despliegue único.
- El estado de la fila vive **en memoria**: se reinicia al reiniciar el servicio.
- `legacy_backup/` contiene el código original (HTML/JS/Express) solo como
  referencia; no se incluye en el build ni en el lint.

---

**Autor:** Manuel Alejandro Caporaso · Integración de Aplicaciones · ITS Cipolletti
