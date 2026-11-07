"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { LottieSvg, type LottieHandle } from "lottie-react";
import { Button } from "@/components/ui/Button";
import animation from "@/assets/lottie/404.json";

export function NotFoundAnimation() {
  const reduce = useReducedMotion();
  const lottieRef = useRef<LottieHandle>(null);

  return (
    <LottieSvg
      src={animation}
      lottieRef={lottieRef}
      loop={false}
      autoplay={!reduce}
      subscriptions={reduce ? { ready: () => lottieRef.current?.seek({ percent: 1 }) } : undefined}
      aria-hidden
      className="mx-auto aspect-square h-auto w-full max-w-[320px]"
    />
  );
}

export function GoBackButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/");
      }}
    >
      Go back
    </Button>
  );
}
