"use client";

import { useEffect, useRef } from "react";

type Layer = {
  element: HTMLElement;
  strength: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function AmbientBackground() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const layers: Layer[] = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax]")).map(
      (element) => {
        const strength = Number(element.dataset.parallaxStrength ?? element.dataset.parallax ?? 0.5);
        return { element, strength: Number.isFinite(strength) ? strength : 0.5 };
      }
    );

    let pointerX = 0;
    let pointerY = 0;
    let scrollY = 0;
    let raf = 0;

    const update = () => {
      raf = 0;

      const maxPointerShiftX = 28;
      const maxPointerShiftY = 22;
      const scrollShift = clamp(-scrollY * 0.045, -70, 0);

      for (const layer of layers) {
        const tx = pointerX * layer.strength * maxPointerShiftX;
        const ty = pointerY * layer.strength * maxPointerShiftY + scrollShift * layer.strength;
        layer.element.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
      }
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerX = clamp((event.clientX / window.innerWidth - 0.5) * 2, -1, 1);
      pointerY = clamp((event.clientY / window.innerHeight - 0.5) * 2, -1, 1);
      schedule();
    };

    const onScroll = () => {
      scrollY = window.scrollY ?? 0;
      schedule();
    };

    const onResize = () => {
      schedule();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    onScroll();
    schedule();

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef} className="ambient-layer">
      <div data-parallax data-parallax-strength="0.12" className="absolute inset-0 ambient-gradient" />

      <div className="absolute left-[-12rem] top-[-10rem]">
        <div
          data-parallax
          data-parallax-strength="0.5"
          className="ambient-blob h-[28rem] w-[28rem] bg-emerald-200/32 blur-[110px]"
        />
      </div>
      <div className="absolute right-[-8rem] top-[3rem]">
        <div
          data-parallax
          data-parallax-strength="0.35"
          className="ambient-blob h-[22rem] w-[22rem] bg-amber-200/34 blur-[95px]"
        />
      </div>
      <div className="absolute bottom-[-12rem] left-[24%]">
        <div
          data-parallax
          data-parallax-strength="0.28"
          className="ambient-blob h-[30rem] w-[30rem] bg-teal-200/22 blur-[120px]"
        />
      </div>
      <div className="absolute left-[52%] top-[-6rem]">
        <div
          data-parallax
          data-parallax-strength="0.22"
          className="ambient-blob h-[18rem] w-[18rem] bg-sky-200/18 blur-[95px]"
        />
      </div>
      <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
        <div
          data-parallax
          data-parallax-strength="0.6"
          className="ambient-blob h-[26rem] w-[26rem] bg-white/55 blur-[120px]"
        />
      </div>

      <div className="absolute inset-0 glass-grain" />
    </div>
  );
}
