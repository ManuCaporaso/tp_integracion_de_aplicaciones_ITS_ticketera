import { GraduationCap, Monitor, Radio, Ticket, Tv, Zap } from "lucide-react";

import { HomeStatus } from "@/components/HomeStatus";
import { RoleCard } from "@/components/RoleCard";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-sky-50/60 to-slate-50">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-32 -top-40 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl"
          />

          <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 shadow-sm">
                <GraduationCap className="h-3.5 w-3.5" />
                ITS Cipolletti · Integración de Aplicaciones
              </span>

              <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-6xl">
                Turnos simples,
                <span className="block bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                  atención en tiempo real.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Sistema de ticketera migrado a Next.js. Creá un ticket, llamá al
                siguiente desde tu escritorio y seguí la fila desde la pantalla de la
                sala de espera.
              </p>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Actualización instantánea
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Radio className="h-4 w-4 text-sky-500" />
                  Socket.IO + Netlify
                </span>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <RoleCard
                href="/crear-ticket"
                title="Crear ticket"
                description="Sacá un número para la fila. Podés dejar tu nombre para que aparezca en el llamado."
                cta="Pedir mi turno"
                icon={Ticket}
                accent="sky"
              />
              <RoleCard
                href="/escritorio/1"
                title="Operador / Escritorio"
                description="Panel para llamar al siguiente ticket, marcarlo como atendido y ver la fila en vivo."
                cta="Abrir escritorio"
                icon={Monitor}
                accent="emerald"
              />
              <RoleCard
                href="/publico"
                title="Pantalla pública"
                description="Vista de alto contraste para la sala de espera, con número actual, escritorio y próximos turnos."
                cta="Ver pantalla"
                icon={Tv}
                accent="violet"
              />
            </div>

            <div className="mt-8">
              <HomeStatus />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-3 sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
                01 · Ticket
              </p>
              <h2 className="mt-2 font-bold text-slate-900">Número único</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Cada solicitud recibe un número correlativo y una marca de tiempo.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                02 · Llamado
              </p>
              <h2 className="mt-2 font-bold text-slate-900">Escritorio asignado</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                El operador llama al siguiente y el sistema avisa a todas las pantallas.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                03 · Atención
              </p>
              <h2 className="mt-2 font-bold text-slate-900">Historial del día</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Los tickets atendidos quedan registrados con su escritorio y horario.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-xs text-slate-500 sm:flex-row sm:px-6 sm:text-left">
          <p>
            © 2026 Integración de Aplicaciones · ITS Cipolletti
          </p>
          <p>Manuel Alejandro Caporaso · TP Ticketera</p>
        </div>
      </footer>
    </>
  );
}
