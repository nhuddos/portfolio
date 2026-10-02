import React, { useEffect, useRef } from 'react';

/*
  The desktop wallpaper: soft colour blooms rendered at low resolution and
  quantised with a 4x4 Bayer matrix, then scaled up with crisp pixels. The
  blooms drift slowly and lean toward the pointer, so the field feels like
  a space to wander rather than a flat backdrop. Colours come from the
  current time-of-day palette.
*/
const PX = 6; // screen pixels per field pixel
const LEVELS = 4; // dither steps per bloom
const FPS = 12; // stepped, pixel-art cadence
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

const BLOOMS = [
  { color: '--sky', x: 0.18, y: 0.2, r: 0.55, ax: 0.08, ay: 0.06, speed: 0.07, depth: 0.06 },
  { color: '--accent-2', x: 0.85, y: 0.85, r: 0.5, ax: 0.07, ay: 0.08, speed: 0.05, depth: 0.04 },
  { color: '--mint', x: 0.55, y: 0.45, r: 0.36, ax: 0.1, ay: 0.07, speed: 0.09, depth: 0.1 }
];

function readRgb(styles, name) {
  const hex = styles.getPropertyValue(name).trim().replace('#', '');
  const n = parseInt(hex.length === 3 ? hex.replace(/./g, '$&$&') : hex, 16);
  return Number.isNaN(n) ? [255, 255, 255] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function Field() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return undefined;
    const ctx = cv.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let colors = null;
    let image = null;
    let frame = 0;
    let last = 0;
    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };

    const readColors = () => {
      const styles = getComputedStyle(document.documentElement);
      colors = {
        base: readRgb(styles, '--checker-a'),
        blooms: BLOOMS.map((b) => readRgb(styles, b.color))
      };
    };

    const resize = () => {
      cv.width = Math.ceil(window.innerWidth / PX);
      cv.height = Math.ceil(window.innerHeight / PX);
      image = ctx.createImageData(cv.width, cv.height);
    };

    const draw = (t) => {
      const { width: w, height: h } = cv;
      const data = image.data;
      const aspect = w / h;
      pointer.sx += (pointer.x - pointer.sx) * 0.08;
      pointer.sy += (pointer.y - pointer.sy) * 0.08;
      const centers = BLOOMS.map((b) => ({
        x: (b.x + Math.sin(t * b.speed) * b.ax - pointer.sx * b.depth) * w,
        y: (b.y + Math.cos(t * b.speed * 1.3) * b.ay - pointer.sy * b.depth) * h,
        r: b.r * Math.max(w, h * aspect) * 0.6
      }));
      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
          const threshold = BAYER[(y & 3) * 4 + (x & 3)];
          let [r, g, bl] = colors.base;
          for (let i = 0; i < centers.length; i += 1) {
            const c = centers[i];
            const d = Math.hypot(x - c.x, y - c.y) / c.r;
            if (d >= 1) continue;
            const weight = (1 - d) * 2.2;
            const q = Math.min(LEVELS, Math.floor(weight * LEVELS + threshold)) / LEVELS;
            if (q <= 0) continue;
            const [cr, cg, cb] = colors.blooms[i];
            r += (cr - r) * q;
            g += (cg - g) * q;
            bl += (cb - bl) * q;
          }
          const o = (y * w + x) * 4;
          data[o] = r;
          data[o + 1] = g;
          data[o + 2] = bl;
          data[o + 3] = 255;
        }
      }
      ctx.putImageData(image, 0, 0);
    };

    const loop = (now) => {
      frame = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      last = now;
      draw(now / 1000);
    };

    readColors();
    resize();
    draw(0);
    if (!reduced) frame = requestAnimationFrame(loop);

    const onResize = () => {
      resize();
      draw(last / 1000);
    };
    const onMove = (e) => {
      pointer.x = e.clientX / window.innerWidth - 0.5;
      pointer.y = e.clientY / window.innerHeight - 0.5;
    };
    const themeObserver = new MutationObserver(() => {
      readColors();
      draw(last / 1000);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-time-of-day'] });
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pixelated pointer-events-none absolute inset-0 h-full w-full" />;
}
