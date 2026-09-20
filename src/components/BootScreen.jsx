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

const STRIP_COUNT = 14;

export function BootScreen({ onReveal, onComplete }) {
  const rootRef = useRef(null);
  const timeline = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete });
      timeline.current = tl;
      tl.fromTo('[data-boot-logo]', { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2.5)' }).
        fromTo('[data-boot-line]', { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.1, stagger: 0.09, ease: 'none' }, '-=0.1').
        fromTo('[data-boot-bar]', { scaleX: 0 }, {
          scaleX: 1,
          transformOrigin: 'left center',
          duration: 0.7,
          ease: 'steps(24)'
        }, '-=0.6')
        // Boot text drops out in a few hard frames...
        .to('[data-boot-content]', { opacity: 0, duration: 0.18, ease: 'steps(3)' }, '+=0.1')
        // ...the desktop starts animating in underneath...
        .call(() => onReveal?.())
        // ...and the shutters peel open from the middle outward.
        .to('[data-boot-strip]', {
          scaleY: 0,
          transformOrigin: (i) => (i % 2 === 0 ? 'top center' : 'bottom center'),
          duration: 0.4,
          ease: 'steps(6)',
          stagger: { each: 0.035, from: 'center' }
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
  }} className="fixed inset-0 z-[100] cursor-pointer text-mint" role="status" aria-label="System booting">

    <div className="scanlines absolute inset-0 flex" aria-hidden="true">
      {Array.from({ length: STRIP_COUNT }, (_, i) => <div key={i} data-boot-strip className="-mr-px h-full flex-1 bg-ink" />)}
    </div>

    <div data-boot-content className="relative flex h-full flex-col justify-between px-6 py-8">
      <div className="relative mx-auto w-full max-w-2xl">
        <div data-boot-logo className="mb-6 flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center bg-accent font-mono text-xs text-ink max-md:text-[18px]">
            A
          </span>
          <span className="font-mono text-sm text-paper max-md:text-[20px]">NHUDDOS&nbsp;OS</span>
        </div>

        <div className="space-y-1 font-mono text-lg leading-tight sm:text-xl">
          {bootLog.map((line, i) => <p key={i} data-boot-line className="text-mint/90 opacity-0">
            {line}
          </p>)}
          <span className="pixel-blink inline-block text-mint">_</span>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-2xl">
        <p className="mb-2 font-mono text-lg uppercase text-paper/70">
          Booting desktop
        </p>
        <div className="bevel-in h-6 bg-[var(--bevel-dark)] p-0.5">
          <div data-boot-bar className="h-full bg-accent" />
        </div>
        <p className="pixel-blink mt-3 text-center font-mono text-base uppercase text-paper/60 max-md:text-[18px]">
          Press any key to continue
        </p>
      </div>
    </div>
  </div>);
}