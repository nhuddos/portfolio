import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { MinusIcon, SquareIcon, XIcon, CopyIcon } from "lucide-react";
import { useDesktop } from "../contexts/DesktopContext";
import { MenuBar } from "./MenuBar";

export function Window({ win, children, isNarrow, hold = false }) {
    const { focus, close, minimize, toggleMaximize, move, focusedId, open } = useDesktop();
    const ref = useRef(null);
    const flipFrom = useRef(null);
    const prevStatus = useRef(win.status);
    const drag = useRef(null);
    const isFocused = focusedId === win.id;
    const isMax = win.status === 'maximized' || isNarrow;

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el || hold) return;
        gsap.fromTo(el, {
            opacity: 0,
            scale: 0.96,
            y: 24
        }, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.55,
            ease: 'expo.out'
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
            duration: 0.45,
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
            scale: 0.96,
            opacity: 0,
            y: 12,
            duration: 0.2,
            ease: 'power2.in',
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
            className={`glass absolute flex-col overflow-hidden transition-shadow duration-300 ${isMax && isNarrow ? 'rounded-2xl' : 'rounded-[18px]'} ${isFocused ? 'shadow-float' : 'shadow-soft'}`}
        >
            {/* Title bar */}
            <div
                onPointerDown={onPointerDown}
                onDoubleClick={handleMaximize}
                className={`group/title flex shrink-0 items-center gap-3 px-3 ${isNarrow ? 'py-1.5' : 'py-2.5'} ${isMax ? '' : 'titlebar-grab'}`}
            >
                {/* Window controls: quiet dots that reveal their purpose on hover */}
                <div className={`flex shrink-0 items-center ${isNarrow ? 'order-last gap-1' : 'gap-2'}`}>
                    {[
                        { onClick: handleClose, label: `Close ${win.title}`, Icon: XIcon, color: 'var(--accent)' },
                        { onClick: handleMinimize, label: `Minimize ${win.title}`, Icon: MinusIcon, color: 'var(--accent-2)' },
                        {
                            onClick: handleMaximize,
                            label: win.status === 'maximized' ? `Restore ${win.title}` : `Maximize ${win.title}`,
                            Icon: win.status === 'maximized' ? CopyIcon : SquareIcon,
                            color: 'var(--mint)',
                            hidden: isNarrow
                        }
                    ].filter((c) => !c.hidden).map(({ onClick, label, Icon, color }) => isNarrow ?
                        <button key={label} onClick={onClick} onPointerDown={(e) => e.stopPropagation()} aria-label={label} className="grid h-10 w-10 place-items-center rounded-full text-ink/60 hover:bg-ink/5 hover:text-ink active:scale-95">
                            <Icon size={18} strokeWidth={1.75} />
                        </button> :
                        <button
                            key={label}
                            onClick={onClick}
                            onPointerDown={(e) => e.stopPropagation()}
                            aria-label={label}
                            className="grid h-3.5 w-3.5 place-items-center rounded-full border border-ink/10 transition-colors"
                            style={{ backgroundColor: isFocused ? color : 'rgb(var(--ink-rgb) / 0.12)' }}
                        >
                            <Icon size={8} strokeWidth={3} className="text-[rgb(var(--on-accent-rgb))] opacity-0 transition-opacity group-hover/title:opacity-70" />
                        </button>
                    )}
                </div>

                <span className={`min-w-0 flex-1 truncate text-[13px] font-medium leading-none ${isFocused ? 'text-ink' : 'text-ink/50'} ${isNarrow ? 'pl-2 text-[15px]' : 'text-center'}`}>
                    {win.appId === 'project' && win.title.includes('\u203A') ?
                        <>
                            <Link
                                to="/works"
                                onPointerDown={(e) => e.stopPropagation()}
                                className="text-ink/50 hover:text-accent focus-visible:text-accent focus-visible:outline-none"
                            >
                                Works
                            </Link>
                            <span className="text-ink/30">{' / '}</span>
                            {win.title.split('\u203A').slice(1).join('\u203A').trim()}
                        </> :
                        win.title}
                </span>

                {/* Keeps the title optically centred against the controls. */}
                {!isNarrow && <div className="w-[58px] shrink-0" aria-hidden />}
            </div>

            {/* Menu bar (desktop only: on phones the space is better spent on content) */}
            {!isNarrow && <MenuBar menus={menus} />}

            {/* Content Body */}
            <div className="min-h-0 flex-1 border-t border-ink/[0.06] bg-paper">
                <div className="window-scroll h-full overflow-y-auto">
                    {children}
                </div>
            </div>
        </section>
    );
}