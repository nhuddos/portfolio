import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { MenuIcon, XIcon, MailIcon } from 'lucide-react';
import { CONTACT_LINKS, resolveLogoSrc } from '../data/contactLinks.js';
import { useIsNarrow } from '../useIsNarrow.js';
import { useDesktop } from '../contexts/DesktopContext';
import { Window } from './Window';
import { Taskbar } from './Taskbar';
import { BootScreen } from './BootScreen';
import { Field } from './Field';
import { appForPath, appRegistry, desktopApps, routeFor, titleFor } from './appRegistry';
function getTimeOfDay(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'night';
}
function useTimeOfDay() {
  const [period, setPeriod] = useState(() => getTimeOfDay());
  useEffect(() => {

    const id = setInterval(() => setPeriod(getTimeOfDay()), 60 * 1000);
    return () => clearInterval(id);
  }, []);
  return period;
}
export function Desktop() {
  const location = useLocation();
  const navigate = useNavigate();
  const { windows, focusedId, open } = useDesktop();
  const isNarrow = useIsNarrow();
  const period = useTimeOfDay();

  useEffect(() => {
    document.documentElement.dataset.timeOfDay = period;
  }, [period]);

  const bootedBefore = () => typeof window !== 'undefined' && sessionStorage.getItem('nhuddos-os-booted') === '1';
  const [booted, setBooted] = useState(bootedBefore);
  const [revealed, setRevealed] = useState(bootedBefore);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const syncedPath = useRef('');
  const dockRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const revealDesktop = useCallback(() => setRevealed(true), []);
  const completeBoot = useCallback(() => {
    sessionStorage.setItem('nhuddos-os-booted', '1');
    setRevealed(true);
    setBooted(true);
  }, []);
  const restart = useCallback(() => {
    sessionStorage.removeItem('nhuddos-os-booted');
    setRevealed(false);
    setBooted(false);
  }, []);
  /* Desktop icons cascade in once the machine finishes booting. */
  useEffect(() => {
    const dock = dockRef.current;
    if (!revealed || !dock)
      return;
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-icon]', { opacity: 0, y: 14, filter: 'blur(6px)' }, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.7,
        ease: 'expo.out',
        stagger: 0.06,
        clearProps: 'filter'
      });
    }, dock);
    return () => ctx.revert();
  }, [revealed, isNarrow]);

  useEffect(() => {
    if (!isNarrow) setMobileMenuOpen(false);
  }, [isNarrow]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const grid = mobileMenuRef.current;
    if (!mobileMenuOpen || !grid) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-tile]', { opacity: 0, y: 16, scale: 0.85 }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.28,
        ease: 'back.out(1.8)',
        stagger: 0.035
      });
    }, grid);
    return () => ctx.revert();
  }, [mobileMenuOpen]);

  useEffect(() => {
    const path = location.pathname;
    if (path === syncedPath.current)
      return;
    syncedPath.current = path;
    const match = appForPath(path);
    if (match) {
      open(match.id, {
        slug: match.slug,
        title: titleFor(match.id, match.slug),
        size: appRegistry[match.id]?.size,
        anchor: appRegistry[match.id]?.anchor
      });
    }
  }, [location.pathname, open]);

  useEffect(() => {
    if (!focusedId)
      return;
    const win = windows.find((w) => w.id === focusedId);
    if (!win || win.status === 'minimized')
      return;
    const route = routeFor(win.id, win.slug);
    if (!route || route === location.pathname)
      return;
    syncedPath.current = route;
    navigate(route, { replace: true });
  }, [focusedId, windows, navigate, location.pathname]);
  const launch = (id, el) => {
    if (el) {
      gsap.fromTo(el, { scale: 1 }, {
        scale: 0.86,
        duration: 0.09,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }
    open(id, { title: titleFor(id), size: appRegistry[id]?.size, anchor: appRegistry[id]?.anchor });
  };
  /* A frosted tile tinted with the app's colour, used for every launcher. */
  const iconTile = (app, size) => (
    <span
      className="relative grid place-items-center overflow-hidden rounded-[22%] border border-ink/10 shadow-soft transition-transform duration-300 ease-out-expo group-hover:-translate-y-1 group-hover:shadow-float group-active:scale-95"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg, color-mix(in srgb, ${app.tint} 32%, var(--paper)), color-mix(in srgb, ${app.tint} 8%, var(--paper)))`
      }}
    >
      <app.icon size={Math.round(size * 0.42)} strokeWidth={1.6} style={{ color: `color-mix(in srgb, ${app.tint} 70%, var(--ink))` }} />
    </span>
  );
  const runningDot = (isRunning) => (
    <span className={`h-1 w-1 rounded-full bg-ink transition-opacity ${isRunning ? 'opacity-70' : 'opacity-0'}`} aria-hidden />
  );
  const renderMobileTile = (app) => {
    const isRunning = windows.some((w) => w.id === app.id);
    return (<button key={app.id} data-tile onClick={(e) => {
      launch(app.id, e.currentTarget);
      setMobileMenuOpen(false);
    }} aria-label={`Open ${app.label}`} className="group flex flex-col items-center gap-2 text-center focus:outline-none">

      {iconTile(app, 64)}
      <span className="text-[13px] font-medium leading-none text-ink">{app.label}</span>
      {runningDot(isRunning)}
    </button>);
  };
  const renderIcon = (app) => {
    const isRunning = windows.some((w) => w.id === app.id);
    return (<button key={app.id} data-icon onClick={(e) => launch(app.id, e.currentTarget)} aria-label={`Open ${app.label}`} className="group flex w-full shrink-0 flex-col items-center gap-2 text-center focus:outline-none">

      {iconTile(app, 56)}
      <span className="rounded-full px-2 py-0.5 text-[12px] font-medium leading-none text-ink/80 group-hover:text-ink group-focus-visible:bg-ink group-focus-visible:text-paper">
        {app.label}
      </span>
      {runningDot(isRunning)}
    </button>);
  };

  const leftApps = desktopApps.filter((app) => app.anchor !== 'right');
  const rightApps = desktopApps.filter((app) => app.anchor === 'right');
  const leftIcons = leftApps.map(renderIcon);
  const rightIcons = rightApps.map(renderIcon);
  const windowLayer = <>

    {windows.map((win) => <Window key={win.id} win={win} isNarrow={isNarrow} hold={!revealed}>

      <Suspense fallback={null}>
        {appRegistry[win.appId].render(win.slug)}
      </Suspense>
    </Window>)}

    {revealed && windows.length === 0 &&
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="font-display text-4xl italic text-ink/80 sm:text-5xl">Wander around.</p>
          <p className="eyebrow mt-4 text-ink/50">Pick an app to begin exploring</p>
        </div>
      </div>}
  </>;
  return (<div className="relative flex h-screen w-full flex-col overflow-hidden" data-time-of-day={period}>
    <Field />
    {!booted && <BootScreen onReveal={revealDesktop} onComplete={completeBoot} />}

    {isNarrow ? (
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div ref={dockRef} className="glass relative z-10 mx-2 mt-2 flex shrink-0 items-center justify-between gap-2 rounded-2xl px-2 py-2">
          <button data-icon onClick={() => setMobileMenuOpen(true)} aria-label="Open apps menu" aria-expanded={mobileMenuOpen} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-ink hover:bg-ink/5 active:scale-95">

            <MenuIcon size={20} strokeWidth={1.75} />
          </button>
          <span className="font-display text-xl italic leading-none text-ink">Khanh Do</span>
          <div className="flex shrink-0 items-center gap-1">
            {CONTACT_LINKS.slice(0, 2).map((link) => (
              <a key={link.id} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} className="grid h-11 w-11 place-items-center rounded-xl text-ink hover:bg-ink/5">

                {link.icon === 'mail' ?
                  <MailIcon size={18} strokeWidth={1.75} /> :
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white"><img src={resolveLogoSrc(link.logo)} alt="" aria-hidden="true" className="h-3.5 w-3.5 object-contain" /></span>}
              </a>
            ))}
          </div>
        </div>
        <div className="relative min-h-0 flex-1 p-2">
          <div data-window-area className="relative h-full w-full">{windowLayer}</div>
        </div>

        {mobileMenuOpen &&
          <div className="glass-strong absolute inset-0 z-50 flex flex-col !border-0" onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}>

            <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-4">
              <div>
                <p className="eyebrow text-ink/50">Portfolio</p>
                <p className="mt-1.5 font-display text-3xl italic leading-none text-ink">Khanh Do</p>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close apps menu" className="grid h-11 w-11 place-items-center rounded-full border border-ink/10 text-ink hover:bg-ink/5 active:scale-95">

                <XIcon size={18} strokeWidth={1.75} />
              </button>
            </div>
            <div ref={mobileMenuRef} className="grid flex-1 auto-rows-min grid-cols-4 gap-x-3 gap-y-7 overflow-y-auto p-5" aria-label="Apps">

              {desktopApps.map(renderMobileTile)}
            </div>
          </div>}
      </div>) : (
      <div className="relative min-h-0 flex-1">
        <div ref={dockRef} className="contents">
          <aside className="absolute bottom-0 left-0 top-0 z-10 flex w-28 flex-col items-center gap-6 py-8" aria-label="Desktop shortcuts">

            {leftIcons}
          </aside>

          {rightIcons.length > 0 &&
            <aside className="absolute bottom-0 right-0 top-0 z-10 flex w-28 flex-col items-center gap-6 py-8" aria-label="Desktop shortcuts (right)">

              {rightIcons}
            </aside>}
        </div>
        <div className="pointer-events-none absolute inset-0 z-20 p-4">
          <div data-window-area className="relative h-full w-full [&>section]:pointer-events-auto">
            {windowLayer}
          </div>
        </div>
      </div>)}

    <Taskbar onRestart={restart} />
  </div>);
}
