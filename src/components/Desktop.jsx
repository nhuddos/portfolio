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
      gsap.fromTo('[data-icon]', { opacity: 0, x: -24, scale: 0.8 }, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(2)',
        stagger: 0.07
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
  const renderMobileTile = (app) => {
    const isRunning = windows.some((w) => w.id === app.id);
    return (<button key={app.id} data-tile onClick={(e) => {
      launch(app.id, e.currentTarget);
      setMobileMenuOpen(false);
    }} aria-label={`Open ${app.label}`} className="group flex flex-col items-center gap-2 text-center focus:outline-none">

      <app.icon
        size={64}
        style={{ '--icon-fill': `color-mix(in srgb, ${app.tint} 55%, var(--paper))` }}
        className="[filter:drop-shadow(3px_3px_0_var(--ink))] transition-transform group-active:scale-90"
      />
      <span className={`px-1 font-mono text-lg leading-none group-focus-visible:bg-ink group-focus-visible:text-paper ${isRunning ? 'bg-ink text-paper' : 'text-ink'}`}>

        {app.label}
      </span>
    </button>);
  };
  const renderIcon = (app) => {
    const isRunning = windows.some((w) => w.id === app.id);
    return (<button key={app.id} data-icon onClick={(e) => launch(app.id, e.currentTarget)} aria-label={`Open ${app.label}`} className={`group flex shrink-0 items-center gap-1.5 focus:outline-none ${isNarrow ? 'flex-row' : 'w-full flex-col text-center'}`}>

      <app.icon
        size={isNarrow ? 40 : 64}
        style={{ '--icon-fill': `color-mix(in srgb, ${app.tint} 55%, var(--paper))` }}
        className="transition-transform [filter:drop-shadow(3px_3px_0_var(--ink))] group-hover:-translate-y-1 group-active:translate-y-0"
      />
      <span className={`px-1 font-mono text-lg leading-none group-focus-visible:bg-ink group-focus-visible:text-paper ${isRunning ? 'bg-ink text-paper' : 'text-ink'}`}>

        {app.label}
      </span>
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
        <p className="bevel bg-paper/80 px-4 py-3 font-mono text-lg uppercase text-ink/70">
          Click a shortcut to open a window
        </p>
      </div>}
  </>;
  return (<div className="bg-checker relative flex h-screen w-full flex-col overflow-hidden" data-time-of-day={period}>
    {!booted && <BootScreen onReveal={revealDesktop} onComplete={completeBoot} />}

    {isNarrow ? (
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div ref={dockRef} className="flex shrink-0 items-center justify-between gap-2 border-b-2 border-ink bg-paper px-3 py-2.5">
          <button data-icon onClick={() => setMobileMenuOpen(true)} aria-label="Open apps menu" aria-expanded={mobileMenuOpen} className="grid h-12 w-12 shrink-0 place-items-center bevel bg-paper text-ink active:translate-y-0.5">

            <MenuIcon size={22} strokeWidth={2.5} />
          </button>
          <div className="flex shrink-0 items-center gap-1.5">
            {CONTACT_LINKS.map((link) => (
              <a key={link.id} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} className="grid h-11 w-11 place-items-center border-2 border-ink bg-paper text-ink hover:bg-accent hover:text-paper">

                {link.icon === 'mail' ?
                  <MailIcon size={17} /> :
                  <img src={resolveLogoSrc(link.logo)} alt="" aria-hidden="true" className="h-4 w-4 object-contain" />}
              </a>
            ))}
          </div>
        </div>
        <div className="relative min-h-0 flex-1 p-2">
          <div data-window-area className="relative h-full w-full">{windowLayer}</div>
        </div>

        {mobileMenuOpen &&
          <div className="bg-checker absolute inset-0 z-50 flex flex-col" onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}>

            <div className="flex shrink-0 items-center justify-between border-b-2 border-ink bg-paper px-4 py-3">
              <span className="font-mono text-2xl text-ink">NHUDDOS&nbsp;OS</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close apps menu" className="grid h-12 w-12 place-items-center bevel bg-paper text-ink active:translate-y-0.5">

                <XIcon size={20} strokeWidth={2.5} />
              </button>
            </div>
            <div ref={mobileMenuRef} className="grid flex-1 auto-rows-min grid-cols-4 gap-x-3 gap-y-8 overflow-y-auto p-5" aria-label="Apps">

              {desktopApps.map(renderMobileTile)}
            </div>
          </div>}
      </div>) : (
      <div className="relative min-h-0 flex-1">
        <div ref={dockRef} className="contents">
          <aside className="absolute bottom-0 left-0 top-0 z-10 flex w-28 flex-col items-center gap-9 py-6" aria-label="Desktop shortcuts">

            {leftIcons}
          </aside>

          {rightIcons.length > 0 &&
            <aside className="absolute bottom-0 right-0 top-0 z-10 flex w-28 flex-col items-center gap-9 py-6" aria-label="Desktop shortcuts (right)">

              {rightIcons}
            </aside>}
        </div>
        <div className="pointer-events-none absolute inset-0 z-20 p-3">
          <div data-window-area className="relative h-full w-full [&>section]:pointer-events-auto">
            {windowLayer}
          </div>
        </div>
      </div>)}

    <Taskbar onRestart={restart} />

    <div className="crt-overlay" aria-hidden="true" />
  </div>);
}