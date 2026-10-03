import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useDesktop } from "../contexts/DesktopContext";
import { MenuBar } from "./MenuBar";
import { WindowGlyph } from "./WindowGlyph";
import { reducedMotion, shrinkRect, takeZoomOrigin, zoomRects } from "../motion";

export function Window({ win, children, isNarrow, hold = false }) {
    const { focus, close, minimize, toggleMaximize, move, focusedId, open } = useDesktop();
    const ref = useRef(null);
    const flipFrom = useRef(null);
    const prevStatus = useRef(win.status);
    const drag = useRef(null);
    const isFocused = focusedId === win.id;
    const isMax = win.status === 'maximized' || isNarrow;
    const control = `grid shrink-0 place-items-center rounded-[3px] border-2 border-ink text-ink active:translate-y-px ${isNarrow ? 'h-10 w-10' : 'h-[22px] w-[22px]'}`;

    /* Opening: zoom rectangles step out from whatever launched the window
       (an icon, a menu item) or from the window's own centre. */
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el || hold || reducedMotion()) return undefined;
        const to = el.getBoundingClientRect();
        const from = takeZoomOrigin() ?? shrinkRect(to);
        let cancelled = false;
        gsap.set(el, { opacity: 0 });
        zoomRects(from, to).then(() => {
            if (cancelled || !ref.current) return;
            gsap.set(el, { opacity: 1 });
        });
        return () => {
            cancelled = true;
            gsap.set(el, { clearProps: 'opacity' });
        };
    }, [hold]);

    /* Maximise / restore: the window snaps between sizes in a few frames. */
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
            duration: 0.28,
            ease: 'steps(5)',
            transformOrigin: 'top left',
            clearProps: 'transform'
        });
    }, [win.status]);

    /* Restoring from the dock: rectangles step from the taskbar tab back up. */
    useEffect(() => {
        const el = ref.current;
        const was = prevStatus.current;
        prevStatus.current = win.status;
        if (!el || was !== 'minimized' || win.status === 'minimized' || reducedMotion()) return;
        const tab = document.getElementById(`taskbar-tab-${win.id}`);
        const to = el.getBoundingClientRect();
        gsap.set(el, { opacity: 0 });
        zoomRects(tab?.getBoundingClientRect() ?? shrinkRect(to), to).then(() => {
            if (ref.current) gsap.set(el, { clearProps: 'opacity' });
        });
    }, [win.status, win.id]);

    const handleMinimize = useCallback(() => {
        const el = ref.current;
        if (!el) return minimize(win.id);
        const tab = document.getElementById(`taskbar-tab-${win.id}`);
        const from = el.getBoundingClientRect();
        gsap.set(el, { opacity: 0 });
        zoomRects(from, tab?.getBoundingClientRect() ?? shrinkRect(from)).then(() => {
            gsap.set(el, { clearProps: 'opacity' });
            minimize(win.id);
        });
    }, [minimize, win.id]);

    const handleClose = useCallback(() => {
        const el = ref.current;
        if (!el) return close(win.id);
        const from = el.getBoundingClientRect();
        gsap.set(el, { opacity: 0 });
        zoomRects(from, shrinkRect(from)).then(() => close(win.id));
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
            className={`absolute flex-col overflow-hidden bevel bg-paper [--bevel-radius:8px] [--bevel-w:3px] ${isFocused ? 'shadow-pixel-lg' : 'shadow-pixel'}`}
        >
            {/* Title bar: chunky bitmap title on the left, a dotted rail, and
                boxed controls on the right with a tomato close box. The bar is
                tinted only on the focused window. */}
            <div
                onPointerDown={onPointerDown}
                onDoubleClick={handleMaximize}
                className={`flex shrink-0 items-center gap-2.5 border-b-[3px] border-ink pl-3 pr-2 transition-colors duration-150 [transition-timing-function:steps(2)] ${isFocused ? 'bg-sky' : 'bg-paper'} ${isNarrow ? 'py-1.5' : 'py-1.5'} ${isMax ? '' : 'titlebar-grab'}`}
            >
                <span className={`min-w-0 truncate font-chunky text-[15px] uppercase leading-none max-md:text-[17px] ${isFocused ? 'text-ink' : 'text-ink/45'}`}>
                    {win.appId === 'project' && win.title.includes('\u203A') ?
                        <>
                            <Link
                                to="/works"
                                onPointerDown={(e) => e.stopPropagation()}
                                className="underline-offset-4 hover:text-lilac hover:underline focus-visible:text-lilac focus-visible:outline-none"
                            >
                                Works
                            </Link>
                            {' \u203A ' + win.title.split('\u203A').slice(1).join('\u203A').trim()}
                        </> :
                        win.title}
                </span>
                <span className={`rail-dots h-1 min-w-[12px] flex-1 ${isFocused ? '' : 'invisible'}`} aria-hidden="true" />

                <div className={`flex shrink-0 items-center gap-1.5 ${isFocused ? '' : 'opacity-40'}`}>
                    <button onClick={handleMinimize} onPointerDown={(e) => e.stopPropagation()} aria-label={`Minimize ${win.title}`} className={`${control} bg-paper hover:bg-accent-2`}>
                        <WindowGlyph name="minimize" size={isNarrow ? 14 : 11} />
                    </button>
                    {!isNarrow &&
                        <button onClick={handleMaximize} onPointerDown={(e) => e.stopPropagation()} aria-label={win.status === 'maximized' ? `Restore ${win.title}` : `Maximize ${win.title}`} className={`${control} bg-paper hover:bg-mint`}>
                            <WindowGlyph name={win.status === 'maximized' ? 'restore' : 'maximize'} />
                        </button>}
                    <button onClick={handleClose} onPointerDown={(e) => e.stopPropagation()} aria-label={`Close ${win.title}`} className={`${control} ${isFocused ? 'bg-accent text-paper' : 'bg-paper'} hover:bg-accent hover:text-paper`}>
                        <WindowGlyph name="close" size={isNarrow ? 14 : 11} />
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