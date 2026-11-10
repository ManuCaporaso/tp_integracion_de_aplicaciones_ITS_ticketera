import type { Metadata } from "next";

import { PublicDisplay } from "@/components/PublicDisplay";

export const metadata: Metadata = {
  title: "Pantalla pública",
  description: "Pantalla de alto contraste para la sala de espera.",
};

export default function PublicoPage() {
  return <PublicDisplay />;
}
