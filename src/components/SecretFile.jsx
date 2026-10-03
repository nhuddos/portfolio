import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { arrowSvg, handSvg } from '../data/cursorArt';
import { pixelBurst, reducedMotion, wiggle } from '../motion';

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

/* Forcefield tuning. Inside FIELD_RADIUS the cursor is shoved outward,
   hardest near the file. Chasing wears the field down (FATIGUE_TIME seconds
   of chasing gets it to MIN_STRENGTH) and it recharges slowly once the
   cursor backs off, so the file is hard to reach but never impossible. */
const FIELD_RADIUS = 190;
const PUSH = FIELD_RADIUS * 0.9;
const FATIGUE_TIME = 11;
const RECHARGE_TIME = 18;
const MIN_STRENGTH = 0.04;
/* Hovering any of these means the cursor isn't on the bare desk. */
const OFF_DESK = 'section, [data-taskbar], [data-popup-storm], [data-icon], [data-start-region]';

const svgUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

/*
  Pushes the mouse away from the file. Browsers won't let a page move the
  real pointer, so near the file the real cursor is hidden and a stand-in
  pixel cursor is drawn, displaced outward from the file. Clicks are
  re-aimed at wherever the stand-in is pointing, so what you see is what
  you click. Skipped on touch screens and for reduced motion (the file can
  still be reached with the keyboard).
*/
function useForcefield(linkRef, ringRef, cursorRef) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reducedMotion() || !window.matchMedia('(pointer: fine)').matches) return undefined;
    setEnabled(true);
    const link = linkRef.current;
    const fake = cursorRef.current;
    const root = document.documentElement;
    const real = { x: -1e4, y: -1e4 };
    const shown = { x: 0, y: 0 };
    let dir = { x: 1, y: 0 };
    let active = false;
    let overLink = false;
    let fatigue = 0;
    let jitter = { x: 0, y: 0 };
    let frame = 0;
    let last = performance.now();
    let raf;

    const paint = () => {
      const styles = getComputedStyle(root);
      const ink = styles.getPropertyValue('--ink').trim();
      const paper = styles.getPropertyValue('--paper').trim();
      fake.style.setProperty('--fake-arrow', svgUrl(arrowSvg(ink, paper)));
      fake.style.setProperty('--fake-hand', svgUrl(handSvg(ink, paper)));
    };
    paint();
    const themeWatch = new MutationObserver(paint);
    themeWatch.observe(root, { attributes: true, attributeFilter: ['data-time-of-day'] });

    const setActive = (on) => {
      if (on === active) return;
      active = on;
      root.classList.toggle('cursor-hijacked', on);
      fake.style.display = on ? 'block' : 'none';
    };

    const setOverLink = (on) => {
      if (on === overLink) return;
      overLink = on;
      link.dataset.fakeHover = String(on);
      fake.dataset.hand = String(on);
      if (on) wiggle(link.firstElementChild);
    };

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      frame += 1;
      const box = link.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const dx = real.x - cx;
      const dy = real.y - cy;
      const d = Math.hypot(dx, dy);
      if (d > 0.5) dir = { x: dx / d, y: dy / d };

      fatigue = d < FIELD_RADIUS * 1.8 ?
        Math.min(1, fatigue + dt / FATIGUE_TIME) :
        Math.max(0, fatigue - dt / RECHARGE_TIME);
      const strength = 1 - fatigue * (1 - MIN_STRENGTH);

      const hovered = document.elementFromPoint(real.x, real.y);
      const onDesk = box.width > 0 && hovered && !hovered.closest(OFF_DESK);
      setActive(Boolean(onDesk && d < FIELD_RADIUS));

      if (active) {
        // Shove outward along the line from the file, plus a little stepped
        // fizz so the field feels alive.
        const push = PUSH * strength * (1 - d / FIELD_RADIUS);
        if (frame % 5 === 0) {
          const amp = 3 * strength;
          jitter = { x: (Math.random() * 2 - 1) * amp, y: (Math.random() * 2 - 1) * amp };
        }
        shown.x = Math.round(Math.min(window.innerWidth - 4, Math.max(0, real.x + dir.x * push + jitter.x)));
        shown.y = Math.round(Math.min(window.innerHeight - 4, Math.max(0, real.y + dir.y * push + jitter.y)));
        fake.style.translate = `${shown.x}px ${shown.y}px`;
        setOverLink(shown.x >= box.left && shown.x <= box.right && shown.y >= box.top && shown.y <= box.bottom);
      } else {
        setOverLink(false);
      }

      if (ringRef.current) {
        const near = Math.max(0, 1 - d / (FIELD_RADIUS * 1.4));
        ringRef.current.style.opacity = String(box.width > 0 ? near * (0.25 + 0.75 * strength) : 0);
        ringRef.current.style.setProperty('--field', String(0.55 + 0.45 * strength));
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      real.x = e.clientX;
      real.y = e.clientY;
    };
    const onLeave = () => {
      real.x = -1e4;
      real.y = -1e4;
    };
    // While the field is on, real presses are swallowed and re-aimed at the
    // stand-in cursor. Only trusted (real) events are caught, so the clicks
    // we forward below pass straight through.
    const target = () => {
      fake.style.display = 'none';
      const el = document.elementFromPoint(shown.x, shown.y);
      fake.style.display = 'block';
      return el;
    };
    const onDown = (e) => {
      if (!active || !e.isTrusted) return;
      e.preventDefault();
      e.stopPropagation();
      const el = target();
      if (!overLink && !el?.closest('button, a')) pixelBurst(shown.x, shown.y);
    };
    const onClick = (e) => {
      if (!active || !e.isTrusted) return;
      e.preventDefault();
      e.stopPropagation();
      if (overLink) {
        link.click();
        return;
      }
      target()?.closest('button, a')?.click();
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown, true);
    window.addEventListener('click', onClick, true);
    return () => {
      cancelAnimationFrame(raf);
      themeWatch.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('click', onClick, true);
      root.classList.remove('cursor-hijacked');
    };
  }, [linkRef, ringRef, cursorRef]);

  return enabled;
}

/* Sits dead centre on the desktop, underneath every window, so it only
   shows up once all the windows are closed (or moved out of the way).
   A forcefield around it pushes the mouse away. */
export function SecretFile() {
  const linkRef = useRef(null);
  const ringRef = useRef(null);
  const cursorRef = useRef(null);
  const hijack = useForcefield(linkRef, ringRef, cursorRef);
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 w-32 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 0 }}>
      {/* The forcefield: a dashed pixel ring that shows as the cursor nears
          and shrinks as the field wears out */}
      <span
        ref={ringRef}
        aria-hidden="true"
        className="forcefield pointer-events-none absolute left-1/2 top-[28px] h-[220px] w-[220px] rounded-full opacity-0"
      />
      <a
        ref={linkRef}
        href={SECRET_URL}
        target="_blank"
        rel="noreferrer"
        onMouseEnter={(e) => wiggle(e.currentTarget.firstElementChild)}
        className={`group relative flex w-full flex-col items-center gap-2 text-center focus:outline-none ${hijack ? 'pointer-events-none' : 'pointer-events-auto'}`}
      >
        <span className="transition-transform duration-150 group-hover:-translate-y-1 group-active:translate-y-0.5 group-data-[fake-hover=true]:-translate-y-1">
          <PixelDoc />
        </span>
        <span className="rounded-[3px] border-2 border-transparent px-1.5 py-0.5 font-mono text-xl uppercase leading-tight text-[color:var(--icon-label)] group-hover:border-ink group-hover:bg-accent-2 group-hover:text-ink group-focus-visible:border-ink group-focus-visible:bg-accent-2 group-focus-visible:text-ink group-data-[fake-hover=true]:border-ink group-data-[fake-hover=true]:bg-accent-2 group-data-[fake-hover=true]:text-ink">
          Super secret do not open
        </span>
      </a>
      {/* The stand-in cursor, drawn above everything (portalled out so the
          translate on this wrapper doesn't throw off its fixed position) */}
      {createPortal(<i ref={cursorRef} aria-hidden="true" className="fake-cursor" />, document.body)}
    </div>
  );
}
