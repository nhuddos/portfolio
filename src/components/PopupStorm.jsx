import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { AlertTriangleIcon, HelpCircleIcon, InfoIcon, XIcon } from 'lucide-react';
import { projects } from '../data/projects';

/* ------------------------------------------------------------------ */
/* Content                                                            */
/* ------------------------------------------------------------------ */

// Image popups reuse the project covers. Swap in any list of
// { src, name } you like (e.g. memes in public/images/popups/).
const IMAGES = projects.map((p) => ({ src: p.cover, name: `${p.slug}.webp`, alt: p.title }));

// The storm, in order. `image: n` picks IMAGES[n % IMAGES.length].
const SCRIPT = [
  { title: 'portfolio.exe', kind: 'question', text: 'are you sure you want to see my portfolio?', buttons: ['Yes', 'No'] },
  { image: 0 },
  { title: 'Message', kind: 'info', text: "it's really worth it", buttons: ['OK'] },
  { image: 1 },
  { title: 'Warning', kind: 'warn', text: 'please stay', buttons: ['OK'] },
  { title: 'Warning', kind: 'warn', text: 'please stay', buttons: ['OK'] },
  { image: 2 },
  { title: 'Error', kind: 'warn', text: "actually no dont stay i'm kind of scared of commitment", buttons: ['OK', 'Cancel'] },
  { image: 3 },
  { title: 'Warning', kind: 'warn', text: 'but please stay', buttons: ['OK'] },
  { image: 4 },
  { title: 'Message', kind: 'info', text: "it's really worth it", buttons: ['OK'] },
  { title: 'Warning', kind: 'warn', text: 'please stay', buttons: ['Fine'] }
];

// Held back until every other popup has been closed.
const FINALE = { title: 'Hello?', kind: 'question', text: 'you still here?', buttons: ['Yes', 'Yes'] };

const KIND_STYLE = {
  warn: { Icon: AlertTriangleIcon, bg: 'bg-accent' },
  question: { Icon: HelpCircleIcon, bg: 'bg-sky' },
  info: { Icon: InfoIcon, bg: 'bg-mint' }
};

/* ------------------------------------------------------------------ */
/* Sound                                                              */
/* ------------------------------------------------------------------ */

// Browsers only allow audio after a user gesture. This listener is added
// as soon as the module loads, so the click/keypress that skips the boot
// screen already unlocks sound for the pings that follow it.
let audioCtx = null;
function unlockAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
}
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', unlockAudio, { capture: true });
  window.addEventListener('keydown', unlockAudio, { capture: true });
}

function tone({ freqs, type, peak, length }) {
  if (!audioCtx) unlockAudio();
  if (!audioCtx || audioCtx.state !== 'running') return;
  const t = audioCtx.currentTime;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(peak, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  gain.connect(audioCtx.destination);
  freqs.forEach((f) => {
    const osc = audioCtx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f, t);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + length + 0.02);
  });
}

// Bright two-note "ding", pitch nudged a little each time so a rapid
// burst sounds like a pile-up rather than one looped sample.
function playPing() {
  const base = 880 * Math.pow(2, (Math.random() * 4 - 2) / 12);
  tone({ freqs: [base, base * 1.5], type: 'triangle', peak: 0.12, length: 0.35 });
}

// Low buzz for clicking the blocked area behind the popups.
function playBuzz() {
  tone({ freqs: [180], type: 'square', peak: 0.05, length: 0.18 });
}

/* ------------------------------------------------------------------ */
/* Layout                                                             */
/* ------------------------------------------------------------------ */

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const rand = (min, max) => min + Math.random() * Math.max(0, max - min);

let nextId = 0;
function makePopup(entry, area, { center = false } = {}) {
  const W = area?.clientWidth ?? window.innerWidth;
  const H = area?.clientHeight ?? window.innerHeight;
  const isImage = entry.image != null;
  const width = Math.min(isImage ? 300 : 330, W - 16);
  const estHeight = isImage ? width * 0.625 + 110 : 180;
  const x = center ? (W - width) / 2 : rand(8, W - width - 8);
  const y = center ? (H - estHeight) / 2 : rand(8, H - estHeight - 8);

  let content = entry;
  if (isImage) {
    const img = IMAGES.length ? IMAGES[entry.image % IMAGES.length] : null;
    content = img ?
      { title: img.name, image: img, buttons: ['OK'] } :
      { title: 'Warning', kind: 'warn', text: 'please stay', buttons: ['OK'] };
  }
  nextId += 1;
  return { id: nextId, x: Math.round(x), y: Math.round(Math.max(8, y)), width, ...content };
}

/* ------------------------------------------------------------------ */
/* Components                                                         */
/* ------------------------------------------------------------------ */

function Popup({ popup, onClose }) {
  const ref = useRef(null);
  const firstButton = useRef(null);
  const closing = useRef(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    firstButton.current?.focus({ preventScroll: true });
    if (reducedMotion()) return;
    gsap.fromTo(el, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.12, ease: 'steps(3)' });
  }, []);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const el = ref.current;
    if (!el || reducedMotion()) return onClose(popup.id);
    gsap.to(el, { scale: 0.85, opacity: 0, duration: 0.1, ease: 'steps(2)', onComplete: () => onClose(popup.id) });
  };

  const kind = KIND_STYLE[popup.kind] ?? KIND_STYLE.info;
  const titleId = `popup-title-${popup.id}`;
  const bodyId = `popup-body-${popup.id}`;

  return (
    <div
      ref={ref}
      data-popup-id={popup.id}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      style={{ left: popup.x, top: popup.y, width: popup.width }}
      className="absolute flex flex-col bevel bg-paper shadow-pixel-lg"
    >
      <div className="flex items-center justify-between gap-2 bg-ink px-2 py-1.5">
        <span id={titleId} className="truncate font-mono text-lg leading-none text-paper">
          {popup.title}
        </span>
        <button
          type="button"
          onClick={close}
          aria-label={`Close ${popup.title}`}
          className="grid h-7 w-7 shrink-0 place-items-center bevel bg-accent text-ink hover:bg-paper active:translate-y-0.5"
        >
          <XIcon size={14} strokeWidth={3} />
        </button>
      </div>

      {popup.image ?
        <div id={bodyId} className="p-2">
          <div className="bevel-in aspect-[16/10] overflow-hidden bg-paper">
            <img src={popup.image.src} alt={popup.image.alt} className="pixelated h-full w-full object-cover" />
          </div>
        </div> :
        <div className="flex items-start gap-3 px-4 pb-3 pt-4">
          <span className={`grid h-10 w-10 shrink-0 place-items-center border-2 border-ink text-ink ${kind.bg}`}>
            <kind.Icon size={22} strokeWidth={2.5} />
          </span>
          <p id={bodyId} className="pt-1 font-mono text-xl leading-tight text-ink">
            {popup.text}
          </p>
        </div>}

      <div className="flex justify-center gap-2 px-4 pb-3">
        {popup.buttons.map((label, i) =>
          <button
            key={`${label}-${i}`}
            ref={i === 0 ? firstButton : undefined}
            type="button"
            onClick={close}
            className="min-w-[5.5rem] bevel bg-paper px-4 py-1.5 font-mono text-lg leading-none text-ink hover:bg-accent-2 focus:outline-none focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-ink active:translate-y-0.5"
          >
            {label}
          </button>
        )}
      </div>
    </div>
  );
}

export function PopupStorm({ onDone }) {
  const areaRef = useRef(null);
  const [popups, setPopups] = useState([]);
  const [phase, setPhase] = useState('storm'); // storm → waiting → finale → done

  // Spawn the storm: starts at a steady pace and speeds up.
  useEffect(() => {
    let i = 0;
    let delay = 420;
    let timer;
    const tick = () => {
      const entry = SCRIPT[i];
      setPopups((prev) => [...prev, makePopup(entry, areaRef.current, { center: i === 0 })]);
      playPing();
      i += 1;
      if (i >= SCRIPT.length) {
        setPhase('waiting');
        return;
      }
      delay = Math.max(110, delay * 0.84);
      timer = setTimeout(tick, delay + Math.random() * 60);
    };
    timer = setTimeout(tick, 250);
    return () => clearTimeout(timer);
  }, []);

  // Once everything's closed, one last popup... then we're done.
  useEffect(() => {
    if (popups.length > 0) return;
    if (phase === 'waiting') {
      const t = setTimeout(() => {
        setPopups([makePopup(FINALE, areaRef.current, { center: true })]);
        playPing();
        setPhase('finale');
      }, 600);
      return () => clearTimeout(t);
    }
    if (phase === 'finale') {
      setPhase('done');
      onDone?.();
    }
  }, [popups.length, phase, onDone]);

  const closePopup = useCallback((id) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Escape closes the top-most popup.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setPopups((prev) => prev.slice(0, -1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Clicking behind the popups: buzz and shake the top one.
  const onBackdrop = (e) => {
    if (e.target !== e.currentTarget) return;
    playBuzz();
    const top = popups[popups.length - 1];
    const el = top && areaRef.current?.querySelector(`[data-popup-id="${top.id}"]`);
    if (el && !reducedMotion()) {
      gsap.fromTo(el, { x: -6 }, { x: 0, duration: 0.25, ease: 'steps(5)' });
    }
  };

  if (phase === 'done') return null;

  return (
    <div
      ref={areaRef}
      onMouseDown={onBackdrop}
      className="fixed inset-0 z-[90] overflow-hidden"
      aria-live="assertive"
    >
      {popups.map((p) => <Popup key={p.id} popup={p} onClose={closePopup} />)}
    </div>
  );
}
