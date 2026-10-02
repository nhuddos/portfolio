import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const bootLog = [
  'BABABOOM v2.0  (c) 2006 DA RIZZLER INC.',
  'CPU ... PIXEL-286 @ 12 MHz  [OK]',
  'MEMORY TEST ... 640K  [OK]',
  'DETECTING DISPLAY ... CRT PASTEL  [OK]',
  'MOUNTING /works ... [OK]',
  'MOUNTING /yomama ... [OK]',
  'LOADING DESKTOP SHELL ...'
];

const STRIP_COUNT = 5;

export function BootScreen({ onReveal, onComplete }) {
  const rootRef = useRef(null);
  const timeline = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete });
      timeline.current = tl;
      tl.fromTo('[data-boot-logo]', { opacity: 0, y: 30, filter: 'blur(12px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out' }).
        fromTo('[data-boot-line]', { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.08, ease: 'power2.out' }, '-=0.6').
        fromTo('[data-boot-bar]', { scaleX: 0 }, {
          scaleX: 1,
          transformOrigin: 'left center',
          duration: 1,
          ease: 'power2.inOut'
        }, '<')
        // Boot text dissolves...
        .to('[data-boot-content]', { opacity: 0, y: -12, filter: 'blur(8px)', duration: 0.35, ease: 'power2.in' }, '+=0.1')
        // ...the desktop starts animating in underneath...
        .call(() => onReveal?.())
        // ...and the curtain panels lift away one after another.
        .to('[data-boot-strip]', {
          yPercent: -100,
          duration: 0.8,
          ease: 'expo.inOut',
          stagger: { each: 0.06, from: 'start' }
        }, '<');
    }, root);
    return () => ctx.revert();
  }, [onComplete, onReveal]);

  useEffect(() => {
    const skip = () => {
      timeline.current?.kill();
      onReveal?.();
      onComplete();
    };
    window.addEventListener('keydown', skip);
    return () => window.removeEventListener('keydown', skip);
  }, [onComplete, onReveal]);

  return (<div ref={rootRef} onClick={() => {
    timeline.current?.kill();
    onReveal?.();
    onComplete();
  }} className="fixed inset-0 z-[100] cursor-pointer overflow-hidden" role="status" aria-label="System booting">

    <div className="absolute inset-0 flex" aria-hidden="true">
      {Array.from({ length: STRIP_COUNT }, (_, i) => <div key={i} data-boot-strip className="-mr-px h-full flex-1 bg-[#0f0e14]" />)}
    </div>
    <div className="grain pointer-events-none absolute inset-0" aria-hidden="true" />

    <div data-boot-content className="relative flex h-full flex-col justify-between px-6 py-8 text-[#ece9f4] sm:px-12 sm:py-12">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-white/50">Portfolio &mdash; {new Date().getFullYear()}</span>
        <span className="eyebrow text-white/50">Visual designer</span>
      </div>

      <div>
        <h1 data-boot-logo className="font-display text-[18vw] italic leading-[0.85] tracking-tight sm:text-[11vw]">
          Khanh Do<span className="text-accent">.</span>
        </h1>

        <div className="mt-8 grid gap-1 font-mono text-[11px] leading-relaxed text-white/45 sm:mt-10 sm:grid-flow-col sm:grid-rows-4 sm:justify-start sm:gap-x-16 sm:text-[12px]">
          {bootLog.map((line, i) => <p key={i} data-boot-line className="opacity-0">
            {line}
          </p>)}
        </div>
      </div>

      <div>
        <div className="h-px w-full bg-white/15">
          <div data-boot-bar className="h-full bg-accent" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="eyebrow text-white/45">Loading the desk<span className="caret-blink">_</span></p>
          <p className="eyebrow text-white/45">Press any key to skip</p>
        </div>
      </div>
    </div>
  </div>);
}
