import React from 'react';
import { wiggle } from '../motion';

const SECRET_URL = 'https://youtu.be/dQw4w9WgXcQ?si=VKNtUNgaIQ7x7I2I';

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

/* Sits dead centre on the desktop, underneath every window, so it only
   shows up once all the windows are closed (or moved out of the way). */
export function SecretFile() {
  return (
    <a
      href={SECRET_URL}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={(e) => wiggle(e.currentTarget.firstElementChild)}
      className="group pointer-events-auto absolute left-1/2 top-1/2 flex w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center focus:outline-none"
      style={{ zIndex: 0 }}
    >
      <span className="transition-transform duration-150 group-hover:-translate-y-1 group-active:translate-y-0.5">
        <PixelDoc />
      </span>
      <span className="rounded-[3px] border-2 border-transparent px-1.5 py-0.5 font-mono text-xl uppercase leading-tight text-[color:var(--icon-label)] group-hover:border-ink group-hover:bg-accent-2 group-hover:text-ink group-focus-visible:border-ink group-focus-visible:bg-accent-2 group-focus-visible:text-ink">
        Super secret do not open
      </span>
    </a>
  );
}
