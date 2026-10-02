import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { PowerIcon, MailIcon, XIcon } from 'lucide-react';
import { CONTACT_LINKS, resolveLogoSrc } from '../data/contactLinks.js';
import { useDesktop } from '../contexts/DesktopContext';
import { desktopApps, titleFor } from './appRegistry';

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
      className="flex items-center px-3 font-mono text-[12px] leading-none tabular-nums text-ink/70"
    >
      {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
    </time>
  );
}

export function Taskbar({ onRestart }) {
  const { windows, focusedId, open, close, toggleFromTaskbar } = useDesktop();
  const [startOpen, setStartOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const el = menuRef.current;
    if (!startOpen || !el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity: 0, y: 12, scale: 0.97 }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: 'expo.out',
        transformOrigin: 'bottom left'
      });
      gsap.fromTo(el.querySelectorAll('[data-menu-item]'), { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.2, ease: 'power2.out', stagger: 0.04, delay: 0.06 });
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

  return (<div className="relative z-[60] shrink-0 px-2 pb-2 sm:px-4 sm:pb-4">
    <div className="glass flex items-center gap-2 rounded-2xl p-1.5 shadow-float sm:gap-3">
      <div className="relative" data-start-region>
        <button onClick={() => setStartOpen((v) => !v)} aria-expanded={startOpen} aria-label="Start menu" className={`flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-3 transition-colors ${startOpen ? 'bg-ink text-paper' : 'text-ink hover:bg-ink/5'}`}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent font-display text-lg italic leading-none text-on-accent" aria-hidden>
            K
          </span>
          <span className="hidden text-[13px] font-medium sm:inline">Khanh Do</span>
        </button>

        {startOpen &&
          <div ref={menuRef} className="glass-strong absolute bottom-full left-0 mb-3 w-[min(19rem,calc(100vw-1.5rem))] rounded-2xl p-2 shadow-float">

            <div data-menu-item className="px-3 pb-3 pt-2">
              <p className="eyebrow text-ink/45">Visual designer</p>
              <p className="mt-2 font-display text-3xl italic leading-none text-ink">Khanh Do</p>
            </div>
            <nav className="flex flex-col">
              {desktopApps.map((app) => <button key={app.id} data-menu-item onClick={() => {
                open(app.id, { title: titleFor(app.id), size: app.size, anchor: app.anchor });
                setStartOpen(false);
              }} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] text-ink hover:bg-ink/5">

                <app.icon size={16} strokeWidth={1.75} className="text-ink/50 group-hover:text-accent" />
                {app.label}
              </button>)}
            </nav>

            <div data-menu-item className="mt-1 border-t border-ink/10 px-3 pt-3">
              <p className="eyebrow text-ink/45">Connect</p>
              <div className="mt-2.5 flex gap-1.5">
                {CONTACT_LINKS.map((link) => (
                  <a key={link.id} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 text-ink transition-transform hover:-translate-y-0.5 hover:border-ink/25">

                    {link.icon === 'mail' ?
                      <MailIcon size={16} strokeWidth={1.75} /> :
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-white"><img src={resolveLogoSrc(link.logo)} alt="" aria-hidden="true" className="h-3.5 w-3.5 object-contain" /></span>}
                  </a>
                ))}
              </div>
            </div>

            <div data-menu-item className="mt-3 border-t border-ink/10 pt-1.5">
              <button onClick={() => {
                setStartOpen(false);
                onRestart();
              }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-ink/60 hover:bg-ink/5 hover:text-ink">

                <PowerIcon size={15} strokeWidth={1.75} />
                Restart
              </button>
            </div>
          </div>}
      </div>

      <div className="h-6 w-px shrink-0 bg-ink/10" aria-hidden />

      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto" aria-label="Open windows">

        {windows.map((win) => {
          const isActive = focusedId === win.id && win.status !== 'minimized';
          const isMin = win.status === 'minimized';
          return (<span key={win.id} id={`taskbar-tab-${win.id}`} className={`group flex min-w-0 shrink-0 items-center rounded-xl transition-colors ${isActive ? 'bg-paper shadow-soft' : 'hover:bg-ink/5'}`}>

            <button onClick={() => toggleFromTaskbar(win.id)} aria-label={`${isActive ? 'Minimize' : 'Open'} ${win.title}`} className={`flex min-w-0 items-center gap-2 py-2 pl-3 pr-1 text-[13px] ${isMin ? 'text-ink/45' : 'text-ink'}`}>

              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? 'bg-accent' : 'bg-ink/25'}`} aria-hidden />
              <span className="max-w-[90px] truncate sm:max-w-[190px]">{win.title.replace(' \u203A ', ' / ')}</span>
            </button>
            <button onClick={() => close(win.id)} aria-label={`Close ${win.title}`} className="mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink/40 hover:bg-ink/5 hover:text-ink sm:h-6 sm:w-6 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100">

              <XIcon size={13} strokeWidth={2} />
            </button>
          </span>);
        })}
      </div>

      <div
        role="status"
        aria-label="System status"
        className="flex shrink-0 cursor-default select-none items-center self-stretch"
      >
        <div className="flex items-center gap-2 rounded-full border border-ink/10 px-3 py-1.5 text-[12px] leading-none text-ink/80">
          <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
            <span className="absolute inset-0 animate-ping rounded-full bg-mint opacity-70" />
            <span className="relative h-2 w-2 rounded-full bg-mint" />
          </span>
          <span className="sm:hidden">Available</span>
          <span className="hidden sm:inline">Available for work</span>
        </div>

        <span className="hidden sm:contents"><Clock /></span>
      </div>
    </div>
  </div>);
}
