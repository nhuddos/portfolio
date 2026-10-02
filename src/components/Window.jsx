import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { MinusIcon, SquareIcon, XIcon, CopyIcon } from "lucide-react";
import { useDesktop } from "../contexts/DesktopContext";
import { MenuBar } from "./MenuBar";
import { appRegistry } from "./appRegistry";
import { wiggle } from "../motion";

export function Window({ win, children, isNarrow, hold = false }) {
    const { focus, close, minimize, toggleMaximize, move, focusedId, open } = useDesktop();
    const ref = useRef(null);
    const flipFrom = useRef(null);
    const prevStatus = useRef(win.status);
    const drag = useRef(null);
    const isFocused = focusedId === win.id;
    const isMax = win.status === 'maximized' || isNarrow;
    const app = appRegistry[win.appId];
    const AppGlyph = app?.icon;
    const appTint = `color-mix(in srgb, ${app?.tint ?? 'var(--accent-2)'} 55%, var(--paper))`;

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el || hold) return;
        // Windows land like a dropped card: a little tilt that settles.
        gsap.fromTo(el, {
            opacity: 0,
            scale: 0.86,
            y: 28,
            rotate: gsap.utils.random([-2, -1.5, 1.5, 2])
        }, {
            opacity: 1,
            scale: 1,
            y: 0,
            rotate: 0,
            duration: 0.55,
            ease: 'back.out(1.7)',
            clearProps: 'rotate'
        });
    }, [hold]);

    useLayoutEffect(() => {
        const el = ref.current;
        const from = flipFrom.current;
        flipFrom.current = null;
        if (!el || !from) return;
        const to = el.getBoundingClientRect();
        if (!to.width || !to.height) return;
        gsap.fromTo(el, {
            x: from.left - to.left,
            y: from.top - to.top,
            scaleX: from.width / to.width,
            scaleY: from.height / to.height
        }, {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 0.42,
            ease: 'expo.inOut',
            transformOrigin: 'top left'
        });
    }, [win.status]);

    useEffect(() => {
        const el = ref.current;
        const was = prevStatus.current;
        prevStatus.current = win.status;
        if (!el || was !== 'minimized' || win.status === 'minimized') return;
        const tab = document.getElementById(`taskbar-tab-${win.id}`);
        const r = el.getBoundingClientRect();
        const t = tab?.getBoundingClientRect();
        gsap.fromTo(el, {
            x: t ? t.left + t.width / 2 - (r.left + r.width / 2) : 0,
            y: t ? t.top + t.height / 2 - (r.top + r.height / 2) : 220,
            scale: 0.15,
            opacity: 0
        }, {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.34,
            ease: 'power3.out'
        });
    }, [win.status, win.id]);

    const handleMinimize = useCallback(() => {
        const el = ref.current;
        if (!el) return minimize(win.id);
        const tab = document.getElementById(`taskbar-tab-${win.id}`);
        const r = el.getBoundingClientRect();
        const t = tab?.getBoundingClientRect();
        gsap.to(el, {
            x: t ? t.left + t.width / 2 - (r.left + r.width / 2) : 0,
            y: t ? t.top + t.height / 2 - (r.top + r.height / 2) : 220,
            scale: 0.15,
            opacity: 0,
            duration: 0.26,
            ease: 'power2.in',
            onComplete: () => {
                gsap.set(el, {
                    clearProps: 'transform,opacity'
                });
                minimize(win.id);
            }
        });
    }, [minimize, win.id]);

    const handleClose = useCallback(() => {
        const el = ref.current;
        if (!el) return close(win.id);
        gsap.to(el, {
            scale: 0.88,
            opacity: 0,
            y: 24,
            rotate: 2,
            duration: 0.22,
            ease: 'back.in(1.6)',
            onComplete: () => close(win.id)
        });
    }, [close, win.id]);

    const handleMaximize = useCallback(() => {
        flipFrom.current = ref.current?.getBoundingClientRect() ?? null;
        toggleMaximize(win.id);
    }, [toggleMaximize, win.id]);

    const onPointerDown = (e) => {
        focus(win.id);
        if (isMax) return;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        drag.current = {
            dx: e.clientX - r.left,
            dy: e.clientY - r.top
        };
        const onMove = (ev) => {
            if (!drag.current) return;
            const parent = el.offsetParent;
            const bounds = parent?.getBoundingClientRect();
            const originX = bounds?.left ?? 0;
            const originY = bounds?.top ?? 0;
            const maxX = (bounds?.width ?? window.innerWidth) - 80;
            const maxY = (bounds?.height ?? window.innerHeight) - 40;
            const x = Math.min(Math.max(-40, ev.clientX - originX - drag.current.dx), maxX);
            const y = Math.min(Math.max(0, ev.clientY - originY - drag.current.dy), maxY);
            gsap.set(el, {
                left: x,
                top: y
            });
        };
        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            if (!drag.current) return;
            drag.current = null;
            move(win.id, el.offsetLeft, el.offsetTop);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    const menus = [
        {
            label: 'File',
            items: [
                { label: 'Minimize', onSelect: handleMinimize },
                { label: isMax ? 'Restore' : 'Maximize', onSelect: handleMaximize, disabled: isNarrow },
                { separator: true },
                { label: 'Close', hint: 'Alt+F4', onSelect: handleClose }
            ]
        },
        {
            label: 'Edit',
            items: [
                { label: 'Undo', hint: 'Ctrl+Z', disabled: true },
                { label: 'Cut', hint: 'Ctrl+X', disabled: true },
                { label: 'Copy', hint: 'Ctrl+C', disabled: true },
                { label: 'Paste', hint: 'Ctrl+V', disabled: true }
            ]
        },
        {
            label: 'Help',
            items: [
                { label: 'About Khanh Do...', onSelect: () => open('about', { title: 'About' }) },
                { separator: true },
                { label: 'Check for updates', hint: 'never', disabled: true }
            ]
        }
    ];

    const geometry = isMax ? {
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
    } : {
        left: win.x,
        top: win.y,
        width: win.w,
        height: win.h
    };

    return (
        <section
            ref={ref}
            role="dialog"
            aria-label={`${win.title} window`}
            aria-hidden={win.status === 'minimized'}
            onMouseDown={() => focus(win.id)}
            style={{
                ...geometry,
                zIndex: win.z,
                visibility: hold ? 'hidden' : undefined,
                display: win.status === 'minimized' ? 'none' : 'flex'
            }}
            className={`absolute flex-col bevel bg-paper ${isFocused ? 'shadow-pixel-lg' : 'shadow-pixel-sm'}`}
        >
            {/* Title bar */}
            <div
                onPointerDown={onPointerDown}
                onDoubleClick={handleMaximize}
                className={`flex shrink-0 items-center justify-between gap-2 px-2.5 py-2.5 sm:py-2 ${isMax ? '' : 'titlebar-grab'} ${isFocused ? 'bg-ink text-paper' : 'dither bg-paper text-ink/60'}`}
            >
                <div className="flex min-w-0 items-center gap-2.5">
                    {AppGlyph && <span onMouseEnter={(e) => wiggle(e.currentTarget)} className="shrink-0"><AppGlyph size={18} style={{ '--icon-fill': appTint }} /></span>}
                    <span className="truncate font-mono text-lg uppercase leading-none max-md:text-[24px]">
                        {win.appId === 'project' && win.title.includes('\u203A') ?
                            <>
                                <Link
                                    to="/works"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className="hover:text-accent focus-visible:text-accent focus-visible:outline-none"
                                >
                                    Works
                                </Link>
                                {' \u203A ' + win.title.split('\u203A').slice(1).join('\u203A').trim()}
                            </> :
                            win.title}
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-1.5">
                    <button onClick={handleMinimize} aria-label={`Minimize ${win.title}`} className={`grid place-items-center bg-accent-2 text-ink hover:bg-paper active:translate-y-0.5 ${isNarrow ? 'h-11 w-11 min-h-[44px] min-w-[44px]' : 'h-6 w-6 min-h-[24px] min-w-[24px]'}`}>
                        <MinusIcon size={isNarrow ? 18 : 14} strokeWidth={3} />
                    </button>
                    <button onClick={handleMaximize} aria-label={win.status === 'maximized' ? `Restore ${win.title}` : `Maximize ${win.title}`} className={`grid place-items-center bg-mint text-ink hover:bg-paper active:translate-y-0.5 ${isNarrow ? 'h-11 w-11 min-h-[44px] min-w-[44px]' : 'h-6 w-6 min-h-[24px] min-w-[24px]'}`}>
                        {win.status === 'maximized' ? <CopyIcon size={isNarrow ? 16 : 12} strokeWidth={3} /> : <SquareIcon size={isNarrow ? 16 : 12} strokeWidth={3} />}
                    </button>
                    <button onClick={handleClose} aria-label={`Close ${win.title}`} className={`grid place-items-center bg-accent text-ink hover:bg-paper active:translate-y-0.5 ${isNarrow ? 'h-11 w-11 min-h-[44px] min-w-[44px]' : 'h-6 w-6 min-h-[24px] min-w-[24px]'}`}>
                        <XIcon size={isNarrow ? 18 : 14} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Menu bar (desktop only: on phones the space is better spent on content) */}
            {!isNarrow && <MenuBar menus={menus} />}

            {/* Content Body */}
            <div className="min-h-0 flex-1 bg-paper">
                <div className="window-scroll h-full overflow-y-auto">
                    {children}
                </div>
            </div>
        </section>
    );
}