import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { SocketProvider } from "@/context/SocketContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ticketera ITS | Sistema de turnos",
    template: "%s | Ticketera ITS",
  },
  description:
    "Sistema de turnos en tiempo real para el Instituto Técnico Superior de Cipolletti. Trabajo práctico de Integración de Aplicaciones.",
  applicationName: "Ticketera ITS",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-slate-50 font-sans text-slate-900">
        <SocketProvider>{children}</SocketProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
