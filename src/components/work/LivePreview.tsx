"use client";

import { useEffect, useRef, useState } from "react";

const FRAME_WIDTH = 1280;
const FRAME_HEIGHT = 2800;

/**
 * A tall frame of the live site, scaled into the card and slid downward.
 * Cross-origin pages cannot be scrolled from here, so the frame itself is
 * tall enough to paint the page, then the frame moves inside the clip.
 * That is the same motion a theme marketplace uses for a demo thumbnail.
 */
export function LivePreview({ url, label }: { url: string; label: string }) {
  const clip = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = layer.current;
    const box = clip.current;
    if (!node || !box) return;
    let frame = 0;
    let stopped = false;
    const started = performance.now();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tick = (now: number) => {
      if (stopped) return;
      const scale = box.clientWidth / FRAME_WIDTH;
      const travel = Math.max(0, FRAME_HEIGHT * scale - box.clientHeight);
      let y = 0;
      if (!reduce && travel > 12) {
        const cycle = 16000;
        const p = ((now - started) % cycle) / cycle;
        const tri = p < 0.5 ? p * 2 : (1 - p) * 2;
        const held = Math.min(1, Math.max(0, (tri - 0.15) / 0.7));
        const eased = held * held * (3 - 2 * held);
        y = -travel * eased;
      }
      node.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
    };
  }, [url]);

  return (
    <div ref={clip} className="absolute inset-0 overflow-hidden bg-white">
      <iframe
        ref={layer}
        src={url}
        title={label}
        tabIndex={-1}
        loading="eager"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        onLoad={() => setReady(true)}
        className="pointer-events-none absolute left-0 top-0 border-0 bg-white transition-opacity duration-300"
        style={{
          width: FRAME_WIDTH,
          height: FRAME_HEIGHT,
          opacity: ready ? 1 : 0,
          transformOrigin: "top left",
        }}
      />
    </div>
  );
}
