import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const DesktopContext = createContext(null);

function measureDesktop() {
    if (typeof document !== 'undefined') {
        const r = document.querySelector('[data-window-area]')?.getBoundingClientRect();
        if (r && r.width && r.height)
            return { W: r.width, H: r.height };
    }
    const vw = typeof window === 'undefined' ? 1280 : window.innerWidth;
    const vh = typeof window === 'undefined' ? 800 : window.innerHeight;
    return { W: vw - 24, H: vh - 100 };
}

function defaultGeometry(size) {
    const { W, H } = measureDesktop();
    const w = size?.w != null ? Math.min(size.w, W - 24) : Math.round(Math.min(1180, Math.max(320, W * 0.78)));
    const h = size?.h != null ? Math.min(size.h, H - 24) : Math.round(Math.min(840, Math.max(320, H * 0.93)));
    return {
        w,
        h,
        x: Math.max(0, Math.round((W - w) / 2)),
        y: Math.max(0, Math.round((H - h) / 2))
    };
}

export function DesktopProvider({ children }) {
    const [windows, setWindows] = useState([]);
    const [focusedId, setFocusedId] = useState(null);
    const zRef = useRef(20);

    const nextZ = useCallback(() => {
        zRef.current += 1;
        return zRef.current;
    }, []);

    const focus = useCallback((id) => {
        setFocusedId(id);
        setWindows((prev) => prev.map((w) => w.id === id ? { ...w, z: nextZ() } : w));
    }, [nextZ]);

    const open = useCallback((appId, opts = {}) => {
        setWindows((prev) => {
            const existing = prev.find((w) => w.id === appId);
            if (existing) {
                return prev.map((w) => w.id === appId ?
                    {
                        ...w,
                        z: nextZ(),
                        slug: opts.slug ?? w.slug,
                        title: opts.title ?? w.title,
                        status: w.status === 'minimized' ? w.restoreTo : w.status
                    } :
                    w);
            }
            const isNarrow = typeof window !== 'undefined' && window.innerWidth < 768;
            const geo = defaultGeometry(opts.size);
            return [
                ...prev,
                {
                    id: appId,
                    appId,
                    slug: opts.slug,
                    title: opts.title ?? appId,
                    status: isNarrow ? 'maximized' : 'normal',
                    restoreTo: isNarrow ? 'maximized' : 'normal',
                    z: nextZ(),
                    ...geo
                }
            ];
        });
        setFocusedId(appId);
    }, [nextZ]);

    const close = useCallback((id) => {
        setWindows((prev) => prev.filter((w) => w.id !== id));
    }, []);

    const minimize = useCallback((id) => {
        setWindows((prev) => prev.map((w) => w.id === id ?
            {
                ...w,
                restoreTo: w.status === 'minimized' ? w.restoreTo : w.status,
                status: 'minimized'
            } :
            w));
    }, []);

    React.useEffect(() => {
        const stillVisible = windows.some((w) => w.id === focusedId && w.status !== 'minimized');
        if (stillVisible)
            return;
        const topMost = windows.
            filter((w) => w.status !== 'minimized').
            sort((a, b) => b.z - a.z)[0];
        const nextId = topMost ? topMost.id : null;
        if (nextId !== focusedId)
            setFocusedId(nextId);
    }, [windows, focusedId]);

    const restore = useCallback((id) => {
        setWindows((prev) => prev.map((w) => w.id === id ? { ...w, status: w.restoreTo } : w));
        focus(id);
    }, [focus]);

    const toggleMaximize = useCallback((id) => {
        setWindows((prev) => prev.map((w) => w.id === id ?
            {
                ...w,
                status: w.status === 'maximized' ? 'normal' : 'maximized',
                z: nextZ()
            } :
            w));
        setFocusedId(id);
    }, [nextZ]);

    const toggleFromTaskbar = useCallback((id) => {
        const target = windows.find((w) => w.id === id);
        if (!target)
            return;
        if (target.status === 'minimized') {
            // Bring it back without losing a maximized layout.
            restore(id);
        }
        else if (focusedId === id) {
            minimize(id);
        }
        else {
            focus(id);
        }
    }, [windows, focusedId, focus, minimize, restore]);

    const move = useCallback((id, x, y) => {
        setWindows((prev) => prev.map((w) => w.id === id ? { ...w, x, y } : w));
    }, []);

    const isOpen = useCallback((id) => windows.some((w) => w.id === id), [windows]);

    const value = useMemo(() => ({
        windows,
        focusedId,
        open,
        close,
        focus,
        minimize,
        restore,
        toggleMaximize,
        toggleFromTaskbar,
        move,
        isOpen
    }), [
        windows,
        focusedId,
        open,
        close,
        focus,
        minimize,
        restore,
        toggleMaximize,
        toggleFromTaskbar,
        move,
        isOpen
    ]);

    return (<DesktopContext.Provider value={value}>{children}</DesktopContext.Provider>);
}

export function useDesktop() {
    const ctx = useContext(DesktopContext);
    if (!ctx)
        throw new Error('useDesktop must be used inside a DesktopProvider');
    return ctx;
}