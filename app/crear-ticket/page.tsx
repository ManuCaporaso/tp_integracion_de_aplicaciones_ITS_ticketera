import type { Metadata } from "next";
import { Ticket as TicketIcon } from "lucide-react";

import { CreateTicketForm } from "@/components/CreateTicketForm";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Crear ticket",
  description: "Solicitá un número para la fila de atención.",
};

export default function CrearTicketPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <header className="mx-auto max-w-xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 shadow-sm">
              <TicketIcon className="h-3.5 w-3.5" />
              Solicitud de turno
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Crear ticket
            </h1>
            <p className="mt-3 text-slate-600">
              Generá tu número en un segundo. La pantalla de la sala de espera te
              avisará cuándo es tu turno.
            </p>
          </header>

          <div className="mt-8">
            <CreateTicketForm />
          </div>
        </div>
      </main>
    </>
  );
}
