"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Monitor, Ticket, Tv } from "lucide-react";

import { ConnectionBadge } from "@/components/ConnectionBadge";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/crear-ticket", label: "Crear ticket", icon: Ticket },
  { href: "/escritorio/1", label: "Escritorio", icon: Monitor },
  { href: "/publico", label: "Pantalla pública", icon: Tv },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Ir al inicio">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white p-1.5 ring-1 ring-slate-200">
            <Image
              src="/img/logoITS.png"
              alt="Logo ITS Cipolletti"
              width={300}
              height={150}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-black tracking-tight text-slate-900">
              Ticketera ITS
            </span>
            <span className="block text-[11px] font-medium text-slate-500">
              Integración de Aplicaciones
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Navegación principal">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <ConnectionBadge className="hidden lg:inline-flex" />
      </div>
    </header>
  );
}
