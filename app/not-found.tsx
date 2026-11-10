import Link from "next/link";
import { ArrowLeft, TicketX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
        <TicketX className="h-8 w-8" />
      </span>
      <p className="font-mono text-6xl font-black tracking-tight text-slate-900">404</p>
      <h1 className="text-xl font-bold text-slate-800">Página no encontrada</h1>
      <p className="max-w-sm text-sm text-slate-500">
        La página o el escritorio que buscás no existe. Volvé al inicio para seguir
        usando la ticketera.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>
    </main>
  );
}
