import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import {
  ArrowDownIcon,
  ArrowRightIcon,
  MousePointer2Icon,
  PencilIcon,
  BrushIcon,
  EraserIcon,
  PaintBucketIcon,
  PipetteIcon
} from 'lucide-react';
import { useScreenInit } from '../useScreenInit.js';
import { useIsNarrow } from '../useIsNarrow.js';
import { asset } from '../assetUrl.js';

gsap.registerPlugin(ScrambleTextPlugin);

const TIME_BACKGROUNDS = {
  morning: asset('/images/morning.gif'),
  afternoon: asset('/images/afternoon.gif'),
  night: asset('/images/night.gif')
};

function getTimeOfDay(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'night';
}

function useTimeBackground() {
  const [period, setPeriod] = useState(() => getTimeOfDay());

  useEffect(() => {
    const id = setInterval(() => setPeriod(getTimeOfDay()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return TIME_BACKGROUNDS[period];
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function useScramble(text, duration) {
  const ref = useRef(null);
  const onEnter = () => {
    if (reducedMotion() || !ref.current) return;
    const el = ref.current;
    el.style.width = `${el.getBoundingClientRect().width}px`;
    gsap.to(el, {
      duration,
      ease: 'none',
      scrambleText: { text, chars: 'upperCase', revealDelay: 0.15, speed: 0.4 },
      onComplete: () => {
        el.style.width = '';
      }
    });
  };
  return [ref, onEnter];
}

function IntroRow() {
  return (
    <div className="flex shrink-0 flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <p className="font-body max-w-md text-base leading-snug text-ink/90">
        A student designer with a passion for visual storytelling, digital design, and creating unique and immersive experiences across web, motion, and print.
      </p>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center shrink-0">
        <Link
          to="/works"
          className="font-vt323 inline-flex items-center justify-center gap-2 border-2 border-ink bg-accent px-6 py-4 text-xl sm:px-5 sm:py-2.5 sm:text-xl font-bold uppercase tracking-wide text-paper shadow-pixel transition-transform duration-100 hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          SEE MY WORK <ArrowRightIcon size={20} className="sm:hidden" />
          <ArrowRightIcon size={18} className="hidden sm:block" />
        </Link>
        <a
          href={asset('/KhanhDo_-_CV.pdf')}
          download="Khanh_Do_CV.pdf"
          className="font-vt323 inline-flex items-center justify-center gap-2 border-2 border-ink bg-paper px-6 py-4 text-xl sm:px-5 sm:py-2.5 sm:text-xl font-bold uppercase tracking-wide text-ink shadow-pixel transition-transform duration-100 hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          DOWNLOAD RESUME <ArrowDownIcon size={20} className="sm:hidden" />
          <ArrowDownIcon size={18} className="hidden sm:block" />
        </a>
      </div>
    </div>
  );
}

function WallpaperCutout({ timeBg }) {
  return (
    <div className="relative w-full flex-1 min-h-[90px] max-h-[220px] sm:max-h-[280px] md:max-h-[320px] mt-auto">
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <clipPath id="bottomNotchedClip" clipPathUnits="objectBoundingBox">
            <path d="M 0.04,0 L 0.96,0 L 0.96,0.25 L 1,0.25 L 1,0.75 L 0.96,0.75 L 0.96,1 L 0.04,1 L 0.04,0.75 L 0,0.75 L 0,0.25 L 0.04,0.25 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="w-full h-full relative" style={{ clipPath: 'url(#bottomNotchedClip)' }}>
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("${timeBg}")`,
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated'
          }}
        />
      </div>

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 300"
        preserveAspectRatio="none"
      >
        <path
          fill="none"
          stroke="var(--ink)"
          strokeWidth="4"
          vectorEffect="non-scaling-stroke"
          d="M 40,0 L 960,0 L 960,75 L 1000,75 L 1000,225 L 960,225 L 960,300 L 40,300 L 40,225 L 0,225 L 0,75 L 40,75 Z"
        />
      </svg>
    </div>
  );
}

function HomeMobile() {
  const timeBg = useTimeBackground();
  const [visualRef, scrambleVisual] = useScramble('VISUAL', 0.5);
  const [designerRef, scrambleDesigner] = useScramble('DESIGNER', 0.55);

  return (
    <div className="w-full h-full min-h-0 bg-paper flex flex-col justify-between p-6 sm:p-8 gap-6 font-vt323 overflow-hidden">
      <h1 className="flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-3 text-center w-full">
        <span ref={visualRef} onMouseEnter={scrambleVisual} className="font-handjet font-black w-full sm:w-auto text-[24vw] sm:text-[80px] md:text-[110px] lg:text-[165px] leading-[0.85] tracking-tight text-ink select-none">
          VISUAL
        </span>

        <span className="relative inline-block px-3 sm:px-6 py-1 my-1">
          <span className="absolute inset-0 border-2 border-accent pointer-events-none" />
          <span className="absolute -top-1.5 -left-1.5 w-3 h-3 border-2 border-accent bg-paper pointer-events-none" />
          <span className="absolute -top-1.5 -right-1.5 w-3 h-3 border-2 border-accent bg-paper pointer-events-none" />
          <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-2 border-accent bg-paper pointer-events-none" />
          <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-2 border-accent bg-paper pointer-events-none" />

          <motion.span
            ref={designerRef}
            onMouseEnter={scrambleDesigner}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="font-handjet font-black text-[24vw] sm:text-[80px] md:text-[110px] lg:text-[165px] leading-[0.85] tracking-tight text-accent select-none block"
          >
            DESIGNER
          </motion.span>
        </span>
      </h1>

      <IntroRow />
      <WallpaperCutout timeBg={timeBg} />
    </div>
  );
}

const TOOLS = [
  { id: 'select', label: 'Select', icon: MousePointer2Icon, hint: 'The page works as normal. Grab a tool to start drawing.' },
  { id: 'pencil', label: 'Pencil', icon: PencilIcon, hint: 'Drag on the canvas to draw. The line-size box sets the width.' },
  { id: 'brush', label: 'Brush', icon: BrushIcon, hint: 'A chunkier brush. Drag on the canvas.' },
  { id: 'eraser', label: 'Eraser', icon: EraserIcon, hint: 'Drag to rub out your scribbles.' },
  { id: 'fill', label: 'Fill', icon: PaintBucketIcon, hint: 'Click VISUAL or DESIGNER to fill it with the current colour.' },
  { id: 'picker', label: 'Colour picker', icon: PipetteIcon, hint: 'Click VISUAL or DESIGNER to pick up its colour.' }
];

const PALETTE = [
  'var(--ink)', 'var(--bevel-dark)', 'var(--muted)', 'var(--lilac)', 'var(--mint)', 'var(--sky)',
  'var(--accent)', 'var(--accent-2)', 'var(--paper)', '#ffffff', '#e0526b', '#8b5cf6'
];

const DEFAULT_WORD_COLOR = { visual: 'var(--ink)', designer: 'var(--accent)' };

const CELL = 4;

function resolveColor(el, value) {
  if (!value.startsWith('var(')) return value;
  const name = value.slice(4, -1).trim();
  return getComputedStyle(el).getPropertyValue(name).trim() || '#000';
}

function SessionTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n) => String(n).padStart(2, '0');
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return <span className="tabular-nums">{`${pad(h)}:${pad(m)}:${pad(s)}`}</span>;
}

function HomePaint() {
  const timeBg = useTimeBackground();
  const [visualRef, scrambleVisual] = useScramble('VISUAL', 0.5);
  const [designerRef, scrambleDesigner] = useScramble('DESIGNER', 0.55);

  const [tool, setTool] = useState('select');
  const [color, setColor] = useState('var(--accent)');
  const [lineSize, setLineSize] = useState(2);
  const [fills, setFills] = useState({ visual: null, designer: null });
  const [dirty, setDirty] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const sheetRef = useRef(null);
  const canvasRef = useRef(null);
  const coordRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);

  const activeTool = TOOLS.find((t) => t.id === tool) ?? TOOLS[0];
  const isDrawTool = tool === 'pencil' || tool === 'brush' || tool === 'eraser';
  const wordColor = (which) => fills[which] ?? DEFAULT_WORD_COLOR[which];

  useEffect(() => {
    const sheet = sheetRef.current;
    const cv = canvasRef.current;
    if (!sheet || !cv) return undefined;
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width);
      const h = Math.round(entries[0].contentRect.height);
      if (!w || !h || (cv.width === w && cv.height === h)) return;
      const copy = document.createElement('canvas');
      copy.width = cv.width;
      copy.height = cv.height;
      copy.getContext('2d').drawImage(cv, 0, 0);
      cv.width = w;
      cv.height = h;
      cv.getContext('2d').drawImage(copy, 0, 0);
      setCanvasSize({ w, h });
    });
    ro.observe(sheet);
    return () => ro.disconnect();
  }, []);

  const cellsForTool = () => {
    if (tool === 'brush') return lineSize * 2;
    if (tool === 'eraser') return lineSize * 3;
    return lineSize;
  };

  const pointFor = (e) => {
    const cv = canvasRef.current;
    const r = cv.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (cv.width / r.width),
      y: (e.clientY - r.top) * (cv.height / r.height)
    };
  };

  const stamp = (x, y) => {
    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    const cells = cellsForTool();
    const size = cells * CELL;
    const offset = Math.floor((cells - 1) / 2) * CELL;
    const gx = Math.floor(x / CELL) * CELL - offset;
    const gy = Math.floor(y / CELL) * CELL - offset;
    if (tool === 'eraser') {
      ctx.clearRect(gx, gy, size, size);
    } else {
      ctx.fillStyle = resolveColor(cv, color);
      ctx.fillRect(gx, gy, size, size);
    }
  };

  const strokeTo = (from, to) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / CELL));
    for (let i = 0; i <= steps; i += 1) {
      stamp(from.x + (dx * i) / steps, from.y + (dy * i) / steps);
    }
  };

  const onCanvasDown = (e) => {
    if (!isDrawTool) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = pointFor(e);
    last.current = p;
    stamp(p.x, p.y);
    setDirty(true);
  };

  const onCanvasMove = (e) => {
    if (!drawing.current) return;
    const p = pointFor(e);
    strokeTo(last.current, p);
    last.current = p;
  };

  const endStroke = () => {
    drawing.current = false;
    last.current = null;
  };

  const clearCanvas = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
    setDirty(false);
  };

  const onWordClick = (which) => {
    if (tool === 'fill') setFills((f) => ({ ...f, [which]: color }));
    if (tool === 'picker') setColor(wordColor(which));
  };
  const wordCursor = tool === 'fill' || tool === 'picker' ? 'cell' : undefined;

  const onSheetMove = (e) => {
    const sheet = sheetRef.current;
    if (!sheet || !coordRef.current) return;
    const r = sheet.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) * sheet.offsetWidth) / r.width);
    const y = Math.round(((e.clientY - r.top) * sheet.offsetHeight) / r.height);
    coordRef.current.textContent = `X ${x}  Y ${y}`;
  };
  const onSheetLeave = () => {
    if (coordRef.current) coordRef.current.textContent = 'X -  Y -';
  };

  const ToolIcon = activeTool.icon;

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-paper font-vt323">
      <div className="flex min-h-0 flex-1">
        <aside
          className="flex w-[76px] shrink-0 flex-col gap-4 overflow-y-auto border-r-2 border-ink bg-paper p-2"
          aria-label="Tools"
        >
          <div className="grid grid-cols-2 gap-1.5" role="toolbar" aria-label="Drawing tools">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              const active = t.id === tool;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTool(t.id)}
                  aria-label={t.label}
                  aria-pressed={active}
                  title={t.label}
                  className={`grid h-8 w-8 place-items-center border-2 border-ink text-ink transition-transform duration-75 ${active
                    ? 'translate-x-[2px] translate-y-[2px] bg-accent-2'
                    : 'bg-paper shadow-[2px_2px_0_0_var(--ink)] hover:bg-accent-2/40'
                    }`}
                >
                  <Icon size={16} strokeWidth={2.5} />
                </button>
              );
            })}
          </div>

          <div className="border-2 border-ink" role="group" aria-label="Line size">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setLineSize(n)}
                aria-label={`Line size ${n}`}
                aria-pressed={lineSize === n}
                className={`flex h-6 w-full items-center px-1.5 ${lineSize === n ? 'bg-accent-2' : 'bg-paper hover:bg-accent-2/40'}`}
              >
                <span className="block w-full bg-ink" style={{ height: n * 2 }} />
              </button>
            ))}
          </div>
        </aside>

        <div className="min-h-0 min-w-0 flex-1 bg-ink/10 p-3">
          <div
            ref={sheetRef}
            onPointerMove={onSheetMove}
            onPointerLeave={onSheetLeave}
            style={{ containerType: 'inline-size' }}
            className="relative flex h-full min-h-0 flex-col justify-between gap-4 overflow-hidden border-2 border-ink bg-paper p-5 shadow-pixel lg:p-6"
          >
            <h1
              className="flex w-full shrink-0 flex-wrap items-center justify-center text-center"
              style={{ gap: '0.5rem 2cqw' }}
            >
              <span
                ref={visualRef}
                onMouseEnter={scrambleVisual}
                onClick={() => onWordClick('visual')}
                className="font-handjet font-black leading-[0.85] tracking-tight select-none"
                style={{ fontSize: 'min(15cqw, 165px)', color: wordColor('visual'), cursor: wordCursor }}
              >
                VISUAL
              </span>

              <span
                className="relative inline-block px-3 py-1 lg:px-6"
                style={{ cursor: wordCursor }}
                onClick={() => onWordClick('designer')}
              >
                <span className="pointer-events-none absolute inset-0 border-2" style={{ borderColor: wordColor('designer') }} />
                {['-top-1.5 -left-1.5', '-top-1.5 -right-1.5', '-bottom-1.5 -left-1.5', '-bottom-1.5 -right-1.5'].map((pos) => (
                  <span
                    key={pos}
                    className={`pointer-events-none absolute ${pos} h-3 w-3 border-2 bg-paper`}
                    style={{ borderColor: wordColor('designer') }}
                  />
                ))}

                <motion.span
                  ref={designerRef}
                  onMouseEnter={scrambleDesigner}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 }}
                  className="block font-handjet font-black leading-[0.85] tracking-tight select-none"
                  style={{ fontSize: 'min(15cqw, 165px)', color: wordColor('designer') }}
                >
                  DESIGNER
                </motion.span>
              </span>
            </h1>

            <IntroRow />
            <WallpaperCutout timeBg={timeBg} />

            <canvas
              ref={canvasRef}
              aria-hidden="true"
              onPointerDown={onCanvasDown}
              onPointerMove={onCanvasMove}
              onPointerUp={endStroke}
              onPointerCancel={endStroke}
              className={`absolute inset-0 z-10 h-full w-full touch-none ${isDrawTool ? 'cursor-crosshair' : 'pointer-events-none'}`}
            />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-t-2 border-ink bg-paper px-3 py-1.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center bevel-in bg-paper" role="img" aria-label="Current colour">
          <span className="block h-full w-full" style={{ background: color }} />
        </span>
        <div className="grid grid-flow-col grid-rows-2 gap-1" role="group" aria-label="Colour palette">
          {PALETTE.map((c, i) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Colour ${i + 1}`}
              aria-pressed={color === c}
              className={`h-[18px] w-[18px] border-2 ${color === c ? 'border-ink ring-2 ring-accent' : 'border-ink/60 hover:border-ink'}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Home() {
  useScreenInit();
  const isNarrow = useIsNarrow();
  return isNarrow ? <HomeMobile /> : <HomePaint />;
}