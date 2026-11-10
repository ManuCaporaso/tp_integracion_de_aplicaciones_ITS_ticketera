"use client";

import { useEffect, useState } from "react";

/** Reloj local, seguro para SSR (devuelve `null` hasta montar). */
export function useClock(): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Sincronización inicial del reloj local con el navegador.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setNow(new Date());
    const interval = window.setInterval(() => setNow(new Date()), 1000);

    return () => window.clearInterval(interval);
  }, []);

  return now;
}
