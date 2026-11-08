"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { ADSENSE_CLIENT, adsenseAllowed } from "@/lib/adsense";

type AdQueue = unknown[] & { pauseAdRequests?: number };

declare global {
  interface Window {
    adsbygoogle?: AdQueue;
  }
}

/** Loads Auto ads only on the pages that are allowed to show them. */
export function AdSenseAuto() {
  const path = usePathname() || "/";
  const allow = adsenseAllowed(path);

  useEffect(() => {
    const queue = (window.adsbygoogle = window.adsbygoogle || []) as AdQueue;
    queue.pauseAdRequests = allow ? 0 : 1;
  }, [allow]);

  if (!allow) return null;

  return (
    <Script
      id="adsense-auto"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}
