import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { PowerIcon, MailIcon, XIcon } from 'lucide-react';
import { CONTACT_LINKS, resolveLogoSrc } from '../data/contactLinks.js';
import { useDesktop } from '../contexts/DesktopContext';
import { desktopApps, titleFor } from './appRegistry';
import { hop, reducedMotion, setZoomOrigin } from '../motion';

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15 * 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <time
      dateTime={now.toISOString()}
      title={now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
      className="hidden items-center px-2.5 py-1.5 font-mono sm:flex text-lg leading-none tabular-nums text-ink sm:px-3.5 sm:py-2 sm:text-xl max-md:text-[20px]"
    >
      {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
    </time>
  );
}

export function Taskbar({ onRestart }) {
  const { windows, focusedId, open, close, toggleFromTaskbar } = useDesktop();
  const [startOpen, setStartOpen] = useState(false);
  const menuRef = useRef(null);
  const knownTabs = useRef(new Set());

  /* Newly opened windows pop into the dock. */
  useLayoutEffect(() => {
    const ids = windows.map((w) => w.id);
    const fresh = ids.filter((id) => !knownTabs.current.has(id));
    knownTabs.current = new Set(ids);
    if (!fresh.length || reducedMotion()) return;
    const els = fresh.map((id) => document.getElementById(`taskbar-tab-${id}`)).filter(Boolean);
    gsap.fromTo(els, { clipPath: 'inset(0% 100% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 0.24, ease: 'steps(4)', stagger: 0.05, delay: 0.25, clearProps: 'clipPath'
    });
  }, [windows]);

  useEffect(() => {
    const el = menuRef.current;
    if (!startOpen || !el) return;
    const ctx = gsap.context(() => {
      // The menu unrolls upward from the Start button in hard steps.
      gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.2, ease: 'steps(5)', clearProps: 'clipPath' });
      gsap.fromTo(el.querySelectorAll('[data-menu-item]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05, ease: 'steps(1)', stagger: 0.04, delay: 0.15 });
    }, el);
    return () => ctx.revert();
  }, [startOpen]);

  useEffect(() => {
    if (!startOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setStartOpen(false);
    };
    const onDown = (e) => {
      if (!e.target.closest('[data-start-region]')) {
        setStartOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
    };
  }, [startOpen]);

  return (<div data-taskbar className="relative z-[60] shrink-0 px-2.5 pb-3 pt-1 sm:px-4 sm:pb-4">
    <div className="flex items-center gap-2 bevel bg-paper px-2 py-2 shadow-pixel [--bevel-radius:8px] [--bevel-w:3px] sm:gap-3">
    <div className="relative" data-start-region>
      <button onClick={() => setStartOpen((v) => !v)} onMouseEnter={(e) => hop(e.currentTarget.firstElementChild, 6)} aria-expanded={startOpen} aria-label="Start menu" className={`flex items-center gap-2.5 h-12 rounded-[4px] border-2 border-ink px-3 font-chunky text-base uppercase leading-none max-md:text-[18px] sm:h-11 ${startOpen ? 'bg-ink text-paper' : 'bg-accent-2 text-ink hover:bg-accent'}`}>
        <span className="grid h-5 w-5 shrink-0 grid-cols-2 gap-[2px]" aria-hidden>
          <i className="bg-accent" />
          <i className="bg-mint" />
          <i className="bg-lilac" />
          <i className="bg-ink" />
        </span>
        Start
      </button>

      {startOpen &&
        <div ref={menuRef} className="absolute bottom-full left-0 mb-4 w-[min(20rem,calc(100vw-1.5rem))] bevel bg-paper p-2 shadow-pixel-lg [--bevel-radius:8px] [--bevel-w:3px]">

          <div className="mb-2 rounded-md bg-ink px-3 py-3 font-handjet text-3xl uppercase leading-none tracking-wide text-paper">
            Khanh Do
          </div>
          <nav className="flex flex-col">
            {desktopApps.map((app) => <button key={app.id} data-menu-item onClick={(e) => {
              if (!windows.some((w) => w.id === app.id)) setZoomOrigin(e.currentTarget);
              open(app.id, { title: titleFor(app.id), size: app.size, anchor: app.anchor });
              setStartOpen(false);
            }} className="group flex items-center gap-3 rounded-md px-3 py-2 text-left font-mono text-xl text-ink hover:bg-accent-2 max-md:text-[28px]">

              {app.label}
            </button>)}
          </nav>

          <div data-menu-item className="mt-2 border-t-2 border-dashed border-ink/20 pt-3">
            <p className="px-3 font-mono text-lg uppercase text-ink/50 max-md:text-[24px]">
              Connect
            </p>
            <div className="mt-2 flex gap-2 px-2">
              {CONTACT_LINKS.map((link) => (
                <a key={link.id} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} className="grid h-10 w-10 place-items-center bevel bg-paper text-ink hover:-translate-y-0.5 hover:bg-accent-2">

                  {link.icon === 'mail' ?
                    <MailIcon size={19} /> :
                    <img src={resolveLogoSrc(link.logo)} alt="" aria-hidden="true" className="h-4 w-4 object-contain" />}
                </a>
              ))}
            </div>
          </div>

          <button data-menu-item onClick={() => {
            setStartOpen(false);
            onRestart();
          }} className="mt-3 flex w-full items-center gap-3 rounded-md px-3 py-2.5 font-mono text-xl text-ink/70 hover:bg-ink hover:text-paper max-md:text-[28px]">

            <PowerIcon size={20} strokeWidth={2.5} />
            Restart
          </button>
        </div>}
    </div>

    <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-x-auto" aria-label="Open windows">

      {windows.map((win) => {
        const isActive = focusedId === win.id && win.status !== 'minimized';
        return (<span key={win.id} id={`taskbar-tab-${win.id}`} className={`flex min-w-0 shrink-0 items-center rounded-md border-2 border-ink ${isActive ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-accent-2'}`}>

          <button onClick={() => toggleFromTaskbar(win.id)} aria-label={`${isActive ? 'Minimize' : 'Open'} ${win.title}`} className="flex min-w-0 items-center gap-1.5 px-3 py-2 font-mono text-lg uppercase max-md:text-[22px] sm:gap-2.5 sm:py-1.5 sm:text-xl">

            <span className="max-w-[90px] truncate sm:max-w-[190px]">{win.title}</span>
          </button>
          <button onClick={() => close(win.id)} aria-label={`Close ${win.title}`} className="mr-1 grid h-9 w-9 shrink-0 place-items-center rounded opacity-60 hover:bg-accent hover:text-ink hover:opacity-100 sm:h-6 sm:w-6">

            <XIcon size={16} strokeWidth={3} />
          </button>
        </span>);
      })}
    </div>

    <div
      role="status"
      aria-label="System status"
      className="flex shrink-0 cursor-default select-none items-stretch self-stretch divide-x-2 divide-dashed divide-ink/20 text-ink"
    >
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-lg uppercase leading-none tracking-wide max-md:text-[20px] sm:gap-2.5 sm:px-4 sm:py-2 sm:text-xl">
        <span className="pixel-blink h-2.5 w-2.5 shrink-0 bg-mint shadow-[0_0_0_2px_var(--ink)]" aria-hidden />
        <span className="sm:hidden">Available</span>
        <span className="hidden sm:inline">Available for work</span>
      </div>

      <Clock />
    </div>
    </div>
  </div>);
}