import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

/*
  Shared motion vocabulary. Two moods, used together:
  - "clean": short eased slides and fades for structure (power3 / expo).
  - "whimsical": letters that tumble in, wiggles, hops and pixel confetti,
    usually with a little overshoot (back.out) or a stepped, pixel cadence.
  Everything is skipped for visitors who prefer reduced motion.
*/
export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Letters tumble up from a mask, each with a tiny random tilt. Returns the
   SplitText instance so callers can revert() it once the reveal is done. */
export function revealChars(el, { delay = 0, stagger = 0.035, onComplete } = {}) {
  if (!el || reducedMotion()) {
    onComplete?.();
    return null;
  }
  const split = SplitText.create(el, { type: 'chars', mask: 'chars' });
  gsap.fromTo(split.chars, {
    yPercent: 110,
    rotate: () => gsap.utils.random(-14, 14),
    opacity: 0
  }, {
    yPercent: 0,
    rotate: 0,
    opacity: 1,
    duration: 0.7,
    ease: 'back.out(2.2)',
    stagger,
    delay,
    onComplete: () => {
      split.revert();
      onComplete?.();
    }
  });
  return split;
}

/*
  On mount, animates descendants of `ref`:
  - [data-split]  headings whose letters tumble in
  - [data-anim]   blocks that slide up and fade in, in document order
  - [data-pop]    small bits (chips, handles) that pop in with overshoot
*/
export function useEntrance(ref, deps = []) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || reducedMotion()) return undefined;
    const splits = [];
    const ctx = gsap.context(() => {
      root.querySelectorAll('[data-split]').forEach((el, i) => {
        splits.push(revealChars(el, { delay: 0.05 + i * 0.12 }));
      });
      const blocks = root.querySelectorAll('[data-anim]');
      if (blocks.length) {
        gsap.fromTo(blocks, { y: 18, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.07,
          delay: 0.15,
          clearProps: 'transform,opacity'
        });
      }
      const pops = root.querySelectorAll('[data-pop]');
      if (pops.length) {
        gsap.fromTo(pops, { scale: 0, opacity: 0 }, {
          scale: 1,
          opacity: 1,
          duration: 0.45,
          ease: 'back.out(3)',
          stagger: 0.04,
          delay: 0.35,
          clearProps: 'transform,opacity'
        });
      }
    }, root);
    return () => {
      splits.forEach((s) => s?.revert());
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* A quick, playful shake: good for hovers on icons and avatars. */
export function wiggle(el) {
  if (!el || reducedMotion() || gsap.isTweening(el)) return;
  gsap.fromTo(el, { rotate: 0 }, {
    keyframes: { rotate: [-10, 8, -5, 3, 0] },
    duration: 0.55,
    ease: 'power1.inOut',
    clearProps: 'rotate'
  });
}

/* A little hop, for things that deserve a "boing". */
export function hop(el, height = 8) {
  if (!el || reducedMotion() || gsap.isTweening(el)) return;
  gsap.timeline()
    .to(el, { y: -height, scaleY: 1.06, scaleX: 0.96, duration: 0.16, ease: 'power2.out' })
    .to(el, { y: 0, scaleY: 1, scaleX: 1, duration: 0.5, ease: 'bounce.out', clearProps: 'transform' });
}

const CONFETTI_COLORS = ['--accent', '--accent-2', '--mint', '--sky', '--lilac', '--ink'];

/* Bursts a handful of square "pixels" from a point, with a bit of gravity. */
export function pixelBurst(x, y, count = 14) {
  if (reducedMotion()) return;
  const layer = document.createElement('div');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:90;';
  document.body.appendChild(layer);
  const tl = gsap.timeline({ onComplete: () => layer.remove() });
  for (let i = 0; i < count; i += 1) {
    const size = gsap.utils.random([4, 6, 6, 8, 10]);
    const dot = document.createElement('i');
    dot.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:var(${gsap.utils.random(CONFETTI_COLORS)});`;
    layer.appendChild(dot);
    const angle = gsap.utils.random(0, Math.PI * 2);
    const distance = gsap.utils.random(40, 120);
    tl.to(dot, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 30,
      rotate: gsap.utils.random(-180, 180),
      duration: 0.55,
      ease: 'power3.out'
    }, 0).to(dot, {
      y: `+=${gsap.utils.random(40, 90)}`,
      opacity: 0,
      duration: 0.6,
      ease: 'steps(6)'
    }, 0.45);
  }
}
