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
    <div className="flex shrink-0 flex-col items-start justify-between gap-6 md:flex-row md:items-end">
      <p className="max-w-md text-[15px] leading-relaxed text-ink/70">
        A student designer with a passion for visual storytelling, digital design, and creating unique and immersive experiences across web, motion, and print.
      </p>

      <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          to="/works"
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-[14px] font-medium text-paper transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 active:translate-y-0"
        >
          See my work
          <ArrowRightIcon size={16} strokeWidth={2} className="transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5" />
        </Link>
        <a
          href={asset('/KhanhDo_CV.pdf')}
          download="Khanh_Do_CV.pdf"
          className="group inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-5 py-3 text-[14px] font-medium text-ink transition-colors hover:border-ink/40"
        >
          Download resume
          <ArrowDownIcon size={16} strokeWidth={2} className="transition-transform duration-300 ease-out-expo group-hover:translate-y-0.5" />
        </a>
      </div>
    </div>
  );
}

function WallpaperCutout({ timeBg }) {
  return (
    <div className="relative mt-auto min-h-[90px] w-full max-h-[220px] flex-1 overflow-hidden rounded-2xl border border-ink/10 sm:max-h-[280px] md:max-h-[320px]">
      <div
        className="pixelated h-full w-full"
        style={{
          backgroundImage: `url("${timeBg}")`,
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <span className="eyebrow absolute bottom-3 left-3 rounded-full bg-paper/80 px-2.5 py-1.5 text-ink/70 backdrop-blur">
        Live view
      </span>
    </div>
  );
}

/* Figma-style selection frame around a word: hairline box + corner handles. */
function SelectionFrame({ color, children, ...rest }) {
  return (
    <span className="relative inline-block px-3 py-1 lg:px-5" {...rest}>
      <span className="pointer-events-none absolute inset-0 border" style={{ borderColor: color }} />
      {['-top-[4px] -left-[4px]', '-top-[4px] -right-[4px]', '-bottom-[4px] -left-[4px]', '-bottom-[4px] -right-[4px]'].map((pos) => (
        <span
          key={pos}
          className={`pointer-events-none absolute ${pos} h-2 w-2 border bg-paper`}
          style={{ borderColor: color }}
        />
      ))}
      {children}
    </span>
  );
}

function HomeMobile() {
  const timeBg = useTimeBackground();
  const [visualRef, scrambleVisual] = useScramble('Visual', 0.5);
  const [designerRef, scrambleDesigner] = useScramble('Designer', 0.55);

  return (
    <div className="flex h-full min-h-0 w-full flex-col justify-between gap-6 overflow-hidden bg-paper p-6 sm:p-8">
      <p className="eyebrow text-ink/50">Khanh Do &mdash; Portfolio</p>
      <h1 className="flex w-full shrink-0 flex-col items-start gap-1">
        <span ref={visualRef} onMouseEnter={scrambleVisual} className="select-none font-display text-[22vw] italic leading-[0.9] text-ink sm:text-[110px]">
          Visual
        </span>

        <SelectionFrame color="var(--accent)">
          <motion.span
            ref={designerRef}
            onMouseEnter={scrambleDesigner}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="block select-none text-[16vw] font-semibold leading-[0.95] tracking-[-0.04em] text-accent sm:text-[90px]"
          >
            Designer
          </motion.span>
        </SelectionFrame>
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
  { id: 'fill', label: 'Fill', icon: PaintBucketIcon, hint: 'Click “Visual” or “Designer” to fill it with the current colour.' },
  { id: 'picker', label: 'Colour picker', icon: PipetteIcon, hint: 'Click “Visual” or “Designer” to pick up its colour.' }
];

const PALETTE = [
  'var(--ink)', 'var(--muted)', 'var(--lilac)', 'var(--mint)', 'var(--sky)',
  'var(--accent)', 'var(--accent-2)', 'var(--paper)', '#e0526b', '#8b5cf6'
];

const DEFAULT_WORD_COLOR = { visual: 'var(--ink)', designer: 'var(--accent)' };

/* Stroke width (CSS px) per line-size step, per tool. */
const STROKE = { pencil: 2, brush: 7, eraser: 12 };

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
  const [visualRef, scrambleVisual] = useScramble('Visual', 0.5);
  const [designerRef, scrambleDesigner] = useScramble('Designer', 0.55);

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
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(entries[0].contentRect.width * dpr);
      const h = Math.round(entries[0].contentRect.height * dpr);
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

  const pointFor = (e) => {
    const cv = canvasRef.current;
    const r = cv.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (cv.width / r.width),
      y: (e.clientY - r.top) * (cv.height / r.height)
    };
  };

  /* Smooth, round-capped strokes; the eraser cuts through with destination-out. */
  const strokeTo = (from, to) => {
    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    const dpr = cv.width / cv.getBoundingClientRect().width || 1;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = STROKE[tool] * lineSize * dpr;
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = tool === 'eraser' ? '#000' : resolveColor(cv, color);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x + 0.01, to.y);
    ctx.stroke();
    ctx.restore();
  };

  const stamp = (x, y) => strokeTo({ x, y }, { x, y });

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
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-ink/[0.03]">
      <div className="flex min-h-0 flex-1 gap-3 p-3">
        <aside
          className="flex w-11 shrink-0 flex-col items-center gap-3 overflow-y-auto rounded-2xl border border-ink/[0.08] bg-paper py-2 shadow-soft"
          aria-label="Tools"
        >
          <div className="flex flex-col gap-1" role="toolbar" aria-label="Drawing tools">
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
                  className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${active
                    ? 'bg-accent text-on-accent'
                    : 'text-ink/60 hover:bg-ink/5 hover:text-ink'
                    }`}
                >
                  <Icon size={16} strokeWidth={1.75} />
                </button>
              );
            })}
          </div>

          <div className="h-px w-6 bg-ink/10" aria-hidden />

          <div className="flex flex-col gap-1" role="group" aria-label="Line size">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setLineSize(n)}
                aria-label={`Line size ${n}`}
                aria-pressed={lineSize === n}
                className={`grid h-7 w-8 place-items-center rounded-lg ${lineSize === n ? 'bg-ink/10' : 'hover:bg-ink/5'}`}
              >
                <span className="block rounded-full bg-ink" style={{ height: n * 2, width: 16 }} />
              </button>
            ))}
          </div>
        </aside>

        <div
          ref={sheetRef}
          onPointerMove={onSheetMove}
          onPointerLeave={onSheetLeave}
          style={{ containerType: 'inline-size' }}
          className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col justify-between gap-5 overflow-hidden rounded-2xl border border-ink/[0.08] bg-paper p-6 shadow-soft lg:p-8"
        >
          <p className="eyebrow flex shrink-0 items-center justify-between text-ink/45">
            <span>Khanh Do &mdash; Portfolio</span>
            <span ref={coordRef} className="tabular-nums">X -  Y -</span>
          </p>

          <h1
            className="flex w-full shrink-0 flex-wrap items-baseline justify-center text-center"
            style={{ gap: '0.5rem 2.5cqw' }}
          >
            <span
              ref={visualRef}
              onMouseEnter={scrambleVisual}
              onClick={() => onWordClick('visual')}
              className="select-none font-display italic leading-[0.9]"
              style={{ fontSize: 'min(14cqw, 170px)', color: wordColor('visual'), cursor: wordCursor }}
            >
              Visual
            </span>

            <SelectionFrame
              color={wordColor('designer')}
              style={{ cursor: wordCursor }}
              onClick={() => onWordClick('designer')}
            >
              <motion.span
                ref={designerRef}
                onMouseEnter={scrambleDesigner}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="block select-none font-semibold leading-[0.95] tracking-[-0.045em]"
                style={{ fontSize: 'min(11.5cqw, 140px)', color: wordColor('designer') }}
              >
                Designer
              </motion.span>
            </SelectionFrame>
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

      <div className="flex shrink-0 items-center gap-4 px-4 pb-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ink/15 p-0.5" role="img" aria-label="Current colour">
          <span className="block h-full w-full rounded-full" style={{ background: color }} />
        </span>
        <div className="flex items-center gap-1.5" role="group" aria-label="Colour palette">
          {PALETTE.map((c, i) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Colour ${i + 1}`}
              aria-pressed={color === c}
              className={`h-[18px] w-[18px] rounded-full border border-ink/15 transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-ink/70 ring-offset-2 ring-offset-paper' : ''}`}
              style={{ background: c }}
            />
          ))}
        </div>

        <p className="hidden min-w-0 flex-1 items-center gap-2 truncate text-[12px] text-ink/50 lg:flex">
          <ToolIcon size={13} strokeWidth={1.75} className="shrink-0" />
          <span className="truncate">{activeTool.hint}</span>
        </p>

        {dirty && (
          <button
            type="button"
            onClick={clearCanvas}
            className="ml-auto shrink-0 rounded-full border border-ink/15 px-3 py-1 text-[12px] text-ink/70 hover:border-ink/40 hover:text-ink"
          >
            Clear canvas
          </button>
        )}
      </div>
    </div>
  );
}

export function Home() {
  useScreenInit();
  const isNarrow = useIsNarrow();
  return isNarrow ? <HomeMobile /> : <HomePaint />;
}