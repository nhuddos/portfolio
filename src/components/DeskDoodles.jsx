import React, { useState } from 'react';
import { reducedMotion } from '../motion';

/* A 4-point sparkle, centred on 0,0. */
const SPARKLE = 'M0,-10 C1.5,-3 3,-1.5 10,0 C3,1.5 1.5,3 0,10 C-1.5,3 -3,1.5 -10,0 C-3,-1.5 -1.5,-3 0,-10 Z';

/* Placement in % of the desk, so the doodles spread with the screen. */
const SPARKLES = [
  { x: 18, y: 14, s: 1.1, d: 0 },
  { x: 46, y: 8, s: 0.7, d: 0.5 },
  { x: 74, y: 18, s: 1.3, d: 1.1 },
  { x: 88, y: 46, s: 0.8, d: 0.3 },
  { x: 30, y: 52, s: 0.6, d: 0.8 },
  { x: 62, y: 38, s: 0.9, d: 1.3 }
];

/*
  Wallpaper doodles: a striped sun sinking behind wobbly hills, plus a few
  twinkling sparkles. Drawn with a turbulence filter so every line looks
  hand-inked, and the filter's seed flips a few times a second so the lines
  "boil" like a hand-drawn animation. Sits under the icons and windows.
*/
export function DeskDoodles() {
  const [still] = useState(reducedMotion);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" width="100%" height="100%">
        <defs>
          <filter id="doodle-boil" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="1" result="noise">
              {!still && <animate attributeName="seed" values="1;4;7" dur="0.6s" calcMode="discrete" repeatCount="indefinite" />}
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
          </filter>
          <mask id="sun-stripes">
            <rect x="-100" y="-100" width="200" height="200" fill="white" />
            {[-6, 12, 28, 42].map((y, i) => <rect key={y} x="-100" y={y} width="200" height={4 + i * 2} fill="black" />)}
          </mask>
        </defs>

        <g filter="url(#doodle-boil)">
          {SPARKLES.map((p) =>
            <svg key={`${p.x}-${p.y}`} x={`${p.x}%`} y={`${p.y}%`} overflow="visible">
              <path d={SPARKLE} transform={`scale(${p.s * 3})`} fill="var(--doodle)" className="twinkle" style={{ '--d': `${p.d}s` }} />
            </svg>
          )}
        </g>
      </svg>

      {/* Striped sun, low on the right, half hidden behind the hills */}
      <svg className="absolute bottom-[34px] right-[14%] h-[200px] w-[200px]" viewBox="-100 -100 200 200">
        <circle r="80" fill="var(--doodle)" mask="url(#sun-stripes)" filter="url(#doodle-boil)" />
      </svg>

      {/* Two rolling hills along the bottom, filled with the desk colour so
          they tuck the sun behind them */}
      <svg className="absolute bottom-0 left-0 h-[110px] w-full" viewBox="0 0 1000 150" preserveAspectRatio="none">
        <g filter="url(#doodle-boil)" stroke="var(--doodle)" strokeWidth="3" strokeLinejoin="round">
          <path d="M-20,90 C120,20 220,20 340,80 S560,130 680,60 S900,0 1020,80 L1020,170 L-20,170 Z" fill="var(--desk)" vectorEffect="non-scaling-stroke" />
          <path d="M-20,130 C90,90 200,95 300,120 S520,150 640,110 S880,80 1020,125 L1020,170 L-20,170 Z" fill="var(--desk)" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
    </div>
  );
}
