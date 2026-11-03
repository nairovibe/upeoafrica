"use client";

import { useEffect, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          action?: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

function loadScript() {
  if (document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
    return;
  }
  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  document.head.appendChild(script);
}

export function TurnstileField({
  onToken,
  theme = "auto",
  resetSignal = 0,
  action,
}: {
  onToken: (token: string) => void;
  theme?: "light" | "dark" | "auto";
  resetSignal?: number;
  action: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!SITE_KEY) return;
    loadScript();
    let cancelled = false;
    let tries = 0;

    const mount = () => {
      if (cancelled || !hostRef.current || !window.turnstile) {
        if (!cancelled && tries < 40) {
          tries += 1;
          window.setTimeout(mount, 100);
        }
        return;
      }
      if (widgetId.current) {
        window.turnstile.reset(widgetId.current);
        return;
      }
      widgetId.current = window.turnstile.render(hostRef.current, {
        sitekey: SITE_KEY,
        theme,
        action,
        callback: (token) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(""),
        "error-callback": () => onTokenRef.current(""),
      });
    };

    mount();
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [theme, action]);

  useEffect(() => {
    if (resetSignal === 0) return;
    onTokenRef.current("");
    if (widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current);
    }
  }, [resetSignal]);

  if (!SITE_KEY) {
    return (
      <p className="text-xs text-red-500" role="alert">
        Bot protection is not configured. Submissions are blocked.
      </p>
    );
  }

  return (
    <div className="min-h-[65px]">
      <div ref={hostRef} />
    </div>
  );
}
