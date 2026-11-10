import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DesktopControl } from "@/components/DesktopControl";
import { SiteHeader } from "@/components/SiteHeader";

interface EscritorioPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Ruta dinámica y en tiempo real: se renderiza en cada request (bloqueante)
 * en lugar de prerenderizarse, porque depende de `params` y `usePathname()`.
 */
export const instant = false;

export async function generateMetadata({
  params,
}: EscritorioPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Escritorio ${id}`,
    description: `Panel de atención para el escritorio ${id}.`,
  };
}

function DesktopLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-4 py-10 sm:px-6">
      <div className="h-8 w-56 rounded-xl bg-slate-200" />
      <div className="mt-3 h-4 w-80 rounded-lg bg-slate-200" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="h-72 rounded-3xl bg-slate-200" />
        <div className="h-72 rounded-3xl bg-slate-200" />
      </div>
    </div>
  );
}

async function EscritorioContent({ params }: EscritorioPageProps) {
  const { id } = await params;
  const desktop = Number(id);

  if (!Number.isInteger(desktop) || desktop < 1 || desktop > 99) {
    notFound();
  }

  return <DesktopControl desktop={desktop} />;
}

export default function EscritorioPage({ params }: EscritorioPageProps) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<DesktopLoading />}>
          <EscritorioContent params={params} />
        </Suspense>
      </main>
    </>
  );
}
