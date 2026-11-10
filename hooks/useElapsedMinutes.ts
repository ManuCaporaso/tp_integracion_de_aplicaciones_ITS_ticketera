"use client";

import { useEffect, useState } from "react";

/**
 * Devuelve los minutos transcurridos desde una fecha.
 *
 * Empieza en `null` y se calcula en el cliente para evitar diferencias de
 * hidratación entre el HTML del servidor y el navegador.
 */
export function useElapsedMinutes(date: Date | null | undefined): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!date) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect -- reset */
      setNow(null);
      return;
    }

    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);

    return () => window.clearInterval(interval);
  }, [date]);

  if (!date || now === null) {
    return null;
  }

  return Math.max(0, Math.floor((now - date.getTime()) / 60_000));
}
