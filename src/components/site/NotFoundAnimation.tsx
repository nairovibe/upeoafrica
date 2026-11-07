"use client";

import { useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { LottieSvg, type LottieHandle } from "lottie-react";
import { Pause, Play } from "lucide-react";
import animation from "@/assets/lottie/404.json";

export function NotFoundAnimation() {
  const reduce = useReducedMotion();
  const lottieRef = useRef<LottieHandle>(null);
  const [playing, setPlaying] = useState(!reduce);

  function toggle() {
    const player = lottieRef.current;
    if (!player) return;
    if (playing) player.pause();
    else player.play();
    setPlaying((value) => !value);
  }

  return (
    <div className="mx-auto w-full max-w-[460px]">
      <LottieSvg
        src={animation}
        lottieRef={lottieRef}
        loop={!reduce}
        autoplay={!reduce}
        aria-hidden
        className="aspect-[32/21] h-auto w-full"
      />
      <button
        type="button"
        onClick={toggle}
        className="mx-auto mt-2 inline-flex h-11 cursor-pointer items-center gap-2 rounded-[5px] px-3 text-sm font-medium text-white/70 transition-colors duration-300 hover:text-white"
      >
        {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
        {playing ? "Pause animation" : "Play animation"}
      </button>
    </div>
  );
}
