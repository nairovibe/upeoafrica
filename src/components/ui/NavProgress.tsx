"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function isInternalNav(e: MouseEvent): string | null {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
  const a = (e.target as HTMLElement | null)?.closest("a");
  if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return null;
  const url = new URL(a.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  const here = window.location;
  if (url.pathname === here.pathname && url.search === here.search) return null;
  return url.pathname + url.search;
}

/** Thin bar across the top of the window from link click until the new route renders. */
export function NavProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [active, setActive] = useState<string | null>(null);
  const [route, setRoute] = useState(`${pathname}?${search}`);

  const current = `${pathname}?${search}`;
  if (current !== route) {
    setRoute(current);
    setActive(null);
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = isInternalNav(e);
      if (target) setActive(target);
    }
    function onStart() {
      setActive("pending");
    }
    document.addEventListener("click", onClick);
    window.addEventListener("upeo:navigate", onStart);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("upeo:navigate", onStart);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => setActive(null), 15000);
    return () => window.clearTimeout(t);
  }, [active]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px] overflow-hidden"
      style={{ opacity: active ? 1 : 0, transition: "opacity 200ms" }}
    >
      {active ? <div className="nav-progress h-full bg-brand-500" /> : null}
    </div>
  );
}

/** Call before router.push so the bar shows for programmatic navigation too. */
export function startNavProgress() {
  window.dispatchEvent(new Event("upeo:navigate"));
}
