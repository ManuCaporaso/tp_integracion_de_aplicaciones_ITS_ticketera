import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

const accents = {
  sky: {
    icon: "bg-sky-100 text-sky-600",
    hover: "hover:border-sky-300 hover:shadow-sky-950/10",
    arrow: "text-sky-600",
  },
  emerald: {
    icon: "bg-emerald-100 text-emerald-600",
    hover: "hover:border-emerald-300 hover:shadow-emerald-950/10",
    arrow: "text-emerald-600",
  },
  violet: {
    icon: "bg-violet-100 text-violet-600",
    hover: "hover:border-violet-300 hover:shadow-violet-950/10",
    arrow: "text-violet-600",
  },
} as const;

interface RoleCardProps {
  href: string;
  title: string;
  description: string;
  cta: string;
  icon: LucideIcon;
  accent: keyof typeof accents;
}

export function RoleCard({
  href,
  title,
  description,
  cta,
  icon: Icon,
  accent,
}: RoleCardProps) {
  const styles = accents[accent];

  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl",
        styles.hover,
      )}
    >
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl",
          styles.icon,
        )}
      >
        <Icon className="h-6 w-6" />
      </span>

      <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{description}</p>

      <span
        className={cn(
          "mt-5 inline-flex items-center gap-1.5 text-sm font-bold",
          styles.arrow,
        )}
      >
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
