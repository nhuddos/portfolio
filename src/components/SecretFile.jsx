import React, { useEffect, useRef } from 'react';
import { reducedMotion, wiggle } from '../motion';

const SECRET_URL = 'https://www.youtube.com/watch?v=28FVxYQuLOQ';

/* 16x16 pixel document: folded corner, scribbled lines and a red warning
   stripe. Drawn on a grid so it stays crisp at any size. */
function PixelDoc({ size = 56 }) {
  const ink = 'var(--ink)';
  const px = (x, y, w = 1, h = 1, fill = ink) => <rect key={`${x}-${y}-${w}-${h}-${fill}`} x={x} y={y} width={w} height={h} fill={fill} />;
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true" className="[filter:drop-shadow(3px_3px_0_var(--icon-shadow))]">
      {/* page */}
      {px(3, 1, 7, 14, 'var(--paper)')}
      {px(10, 4, 3, 11, 'var(--paper)')}
      {/* outline */}
      {px(2, 1, 1, 15)}
      {px(3, 0, 7, 1)}
      {px(3, 15, 10, 1)}
      {px(13, 4, 1, 11)}
      {/* folded corner */}
      {px(10, 0, 1, 1)}
      {px(11, 1, 1, 1)}
      {px(12, 2, 1, 1)}
      {px(13, 3, 1, 1)}
      {px(10, 1, 1, 3)}
      {px(10, 4, 3, 1)}
      {px(11, 2, 1, 2, 'var(--accent-2)')}
      {px(12, 3, 1, 1, 'var(--accent-2)')}
      {/* scribbles */}
      {px(4, 3, 4, 1)}
      {px(4, 5, 5, 1)}
      {px(4, 7, 7, 1)}
      {/* red "top secret" stripe */}
      {px(3, 10, 10, 3, 'var(--accent)')}
      {px(5, 11, 1, 1, 'var(--paper)')}
      {px(7, 11, 1, 1, 'var(--paper)')}
      {px(9, 11, 1, 1, 'var(--paper)')}
      {px(11, 11, 1, 1, 'var(--paper)')}
    </svg>
  );
}

/* Forcefield tuning. The field pushes hardest at the centre and fades out
   at FIELD_RADIUS. Chasing the file wears the field down (FATIGUE_TIME
   seconds of chasing gets it to its weakest), and it recharges slowly once
   the cursor backs off, so it's hard to catch but never impossible. */
const FIELD_RADIUS = 190;
const PUSH = 9;
const FATIGUE_TIME = 7;
const RECHARGE_TIME = 18;
const MIN_STRENGTH = 0.05;

/*
  Keeps the file away from the cursor. Browsers can't move the real mouse,
  so the file does the dodging: a little physics loop pushes it away from
  the pointer, springs it back home when the pointer leaves, and keeps it
  inside the desk (so it can be cornered). Positions snap to a 4px grid so
  it moves like a sprite. Skipped on touch screens and for reduced motion.
*/
function useForcefield(ref, ringRef) {
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !window.matchMedia('(pointer: fine)').matches) return undefined;
    const mouse = { x: -1e4, y: -1e4 };
    const off = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    let fatigue = 0;
    let last = performance.now();
    let raf;
    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -1e4;
      mouse.y = -1e4;
    };
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const box = el.getBoundingClientRect();
      const area = el.offsetParent?.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const dx = cx - mouse.x;
      const dy = cy - mouse.y;
      const dist = Math.hypot(dx, dy) || 1;
      const inField = dist < FIELD_RADIUS;
      // Anywhere near the field counts as chasing, so slow chasers win too.
      const chasing = dist < FIELD_RADIUS * 1.8;
      fatigue = chasing ? Math.min(1, fatigue + dt / FATIGUE_TIME) : Math.max(0, fatigue - dt / RECHARGE_TIME);
      const strength = 1 - fatigue * (1 - MIN_STRENGTH);
      if (inField) {
        const force = PUSH * strength * (1 - dist / FIELD_RADIUS) ** 1.5 * 60 * dt;
        // Push straight away, plus a sideways slide that steers the file
        // around the cursor and back toward the middle of the desk, so it
        // can't simply be herded into a corner.
        const ux = dx / dist;
        const uy = dy / dist;
        const side = -uy * -off.x + ux * -off.y >= 0 ? 1 : -1;
        vel.x += (ux * 0.75 - uy * side * 0.9) * force;
        vel.y += (uy * 0.75 + ux * side * 0.9) * force;
      } else {
        // Drift back home, but only while the cursor is away.
        vel.x -= off.x * 0.9 * dt;
        vel.y -= off.y * 0.9 * dt;
      }
      vel.x *= 0.86;
      vel.y *= 0.86;
      off.x += vel.x;
      off.y += vel.y;
      if (area) {
        // Keep the whole file on the desk (its home is the centre).
        const maxX = Math.max(0, area.width / 2 - box.width / 2 - 8);
        const maxY = Math.max(0, area.height / 2 - box.height / 2 - 8);
        // Bounce off the edges of the desk.
        if (Math.abs(off.x) > maxX) {
          off.x = Math.sign(off.x) * maxX;
          vel.x *= -0.6;
        }
        if (Math.abs(off.y) > maxY) {
          off.y = Math.sign(off.y) * maxY;
          vel.y *= -0.6;
        }
      }
      el.style.translate = `${Math.round(off.x / 4) * 4}px ${Math.round(off.y / 4) * 4}px`;
      if (ringRef.current) {
        const near = Math.max(0, 1 - dist / (FIELD_RADIUS * 1.4));
        ringRef.current.style.opacity = String(near * (0.25 + 0.75 * strength));
        ringRef.current.style.setProperty('--field', String(0.55 + 0.45 * strength));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      el.style.translate = '';
    };
  }, [ref, ringRef]);
}

/* Sits dead centre on the desktop, underneath every window, so it only
   shows up once all the windows are closed (or moved out of the way).
   It's surrounded by a forcefield that shoves it away from the cursor. */
export function SecretFile() {
  const ref = useRef(null);
  const ringRef = useRef(null);
  useForcefield(ref, ringRef);
  return (
    <div ref={ref} className="pointer-events-none absolute left-1/2 top-1/2 w-32 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 0 }}>
      {/* The forcefield: a dashed pixel ring that shows as the cursor nears
          and shrinks as the field wears out */}
      <span
        ref={ringRef}
        aria-hidden="true"
        className="forcefield pointer-events-none absolute left-1/2 top-[28px] h-[220px] w-[220px] rounded-full opacity-0"
      />
      <a
        href={SECRET_URL}
        target="_blank"
        rel="noreferrer"
        onMouseEnter={(e) => wiggle(e.currentTarget.firstElementChild)}
        className="group pointer-events-auto relative flex w-full flex-col items-center gap-2 text-center focus:outline-none"
      >
        <span className="transition-transform duration-150 group-hover:-translate-y-1 group-active:translate-y-0.5">
          <PixelDoc />
        </span>
        <span className="rounded-[3px] border-2 border-transparent px-1.5 py-0.5 font-mono text-xl uppercase leading-tight text-[color:var(--icon-label)] group-hover:border-ink group-hover:bg-accent-2 group-hover:text-ink group-focus-visible:border-ink group-focus-visible:bg-accent-2 group-focus-visible:text-ink">
          Super secret do not open
        </span>
      </a>
    </div>
  );
}
