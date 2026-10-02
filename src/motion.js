import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

/*
  Shared motion vocabulary. Everything moves the way a pixel screen would:
  in hard steps (steps() easing), never with smooth floats or fades.
  - Text types on character by character.
  - Blocks wipe in like a printer laying down rows.
  - Small bits pop in frame by frame.
  - Windows open and close with classic "zoom rectangles".
  Everything is skipped for visitors who prefer reduced motion.
*/
export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* A stepped easing function for libraries that want a function (framer-motion). */
export const stepEase = (n) => (t) => (t >= 1 ? 1 : Math.floor(t * n) / n);

/* Characters type on one by one, each popping up a couple of pixels.
   Returns the SplitText instance so callers can revert() it afterwards. */
export function revealChars(el, { delay = 0, stagger = 0.04, onComplete } = {}) {
  if (!el || reducedMotion()) {
    onComplete?.();
    return null;
  }
  const split = SplitText.create(el, { type: 'chars' });
  gsap.fromTo(split.chars, { autoAlpha: 0, y: -6 }, {
    autoAlpha: 1,
    y: 0,
    duration: 0.12,
    ease: 'steps(2)',
    stagger,
    delay,
    onComplete: () => {
      split.revert();
      onComplete?.();
    }
  });
  return split;
}

/* Printer-style wipe: the element is revealed left to right in hard steps. */
export function wipeIn(targets, { delay = 0, stagger = 0.06, duration = 0.36, steps = 6 } = {}) {
  if (reducedMotion()) return null;
  return gsap.fromTo(targets, { clipPath: 'inset(0% 100% 0% 0%)' }, {
    clipPath: 'inset(0% 0% 0% 0%)',
    duration,
    ease: `steps(${steps})`,
    stagger,
    delay,
    clearProps: 'clipPath'
  });
}

/*
  On mount, animates descendants of `ref`:
  - [data-split]  headings that type on letter by letter
  - [data-anim]   blocks that wipe in, in document order
  - [data-pop]    small bits (chips, handles) that pop in frame by frame
*/
export function useEntrance(ref, deps = []) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || reducedMotion()) return undefined;
    const splits = [];
    const ctx = gsap.context(() => {
      root.querySelectorAll('[data-split]').forEach((el, i) => {
        splits.push(revealChars(el, { delay: 0.05 + i * 0.15 }));
      });
      const blocks = root.querySelectorAll('[data-anim]');
      if (blocks.length) wipeIn(blocks, { delay: 0.12 });
      const pops = root.querySelectorAll('[data-pop]');
      if (pops.length) {
        gsap.fromTo(pops, { scale: 0 }, {
          scale: 1,
          duration: 0.2,
          ease: 'steps(3)',
          stagger: 0.03,
          delay: 0.3,
          clearProps: 'transform'
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

/* A quick pixel jitter: good for hovers on icons and "no" feedback. */
export function wiggle(el) {
  if (!el || reducedMotion() || gsap.isTweening(el)) return;
  gsap.fromTo(el, { x: 0 }, {
    keyframes: { x: [-3, 3, -2, 2, 0] },
    duration: 0.3,
    ease: 'steps(5)',
    clearProps: 'transform'
  });
}

/* A little two-frame hop, for things that deserve a "boing". */
export function hop(el, height = 8) {
  if (!el || reducedMotion() || gsap.isTweening(el)) return;
  gsap.timeline()
    .to(el, { y: -height, duration: 0.1, ease: 'steps(2)' })
    .to(el, { y: 0, duration: 0.15, ease: 'steps(3)', clearProps: 'transform' });
}

/*
  Classic Mac "zoom rectangles": a short trail of outlined boxes stepping
  from one rect to another. Used when windows open, close and minimise.
  Resolves when the last frame has been drawn.
*/
let zoomOrigin = null;
export const setZoomOrigin = (el) => {
  zoomOrigin = el?.getBoundingClientRect?.() ?? null;
};
export const takeZoomOrigin = () => {
  const r = zoomOrigin;
  zoomOrigin = null;
  return r;
};

export function zoomRects(from, to, { frames = 6, frameTime = 0.045 } = {}) {
  if (!from || !to || reducedMotion()) return Promise.resolve();
  const layer = document.createElement('div');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:95;';
  document.body.appendChild(layer);
  const lerp = (a, b, t) => a + (b - a) * t;
  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        layer.remove();
        resolve();
      }
    });
    for (let i = 1; i <= frames; i += 1) {
      const t = i / frames;
      const box = document.createElement('i');
      box.style.cssText = `position:absolute;left:${lerp(from.left, to.left, t)}px;top:${lerp(from.top, to.top, t)}px;width:${lerp(from.width, to.width, t)}px;height:${lerp(from.height, to.height, t)}px;border:2px solid var(--paper);outline:1px solid var(--ink);box-shadow:inset 0 0 0 1px var(--ink);border-radius:6px;visibility:hidden;`;
      layer.appendChild(box);
      tl.set(box, { visibility: 'visible' }, i * frameTime);
      tl.set(box, { visibility: 'hidden' }, (i + 2) * frameTime);
    }
  });
}

/* A small rect at the centre of `rect`, as a zoom start/end point. */
export function shrinkRect(rect, factor = 0.12) {
  const w = rect.width * factor;
  const h = rect.height * factor;
  return { left: rect.left + (rect.width - w) / 2, top: rect.top + (rect.height - h) / 2, width: w, height: h };
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
      duration: 0.45,
      ease: 'steps(6)'
    }, 0).to(dot, {
      y: `+=${gsap.utils.random(40, 90)}`,
      opacity: 0,
      duration: 0.5,
      ease: 'steps(5)'
    }, 0.4);
  }
}
