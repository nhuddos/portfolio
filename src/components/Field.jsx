import React, { useEffect, useRef } from 'react';

/*
  The living backdrop behind the desktop: three slowly drifting colour
  blooms, a faint coordinate grid and a layer of film grain. The blooms
  lean toward the pointer so the space feels navigable rather than flat.
*/
export function Field() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let frame = 0;
    const onMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        root.style.setProperty('--px', x.toFixed(3));
        root.style.setProperty('--py', y.toFixed(3));
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  const layer = (depth) => ({
    transform: `translate3d(calc(var(--px, 0) * ${depth}px), calc(var(--py, 0) * ${depth}px), 0)`,
    transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
  });

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={layer(-60)}>
        <div className="bloom bloom-a left-[-10%] top-[-15%] h-[60vmax] w-[60vmax] bg-sky" />
        <div className="bloom bloom-b bottom-[-25%] right-[-15%] h-[55vmax] w-[55vmax] bg-accent-2/70" />
      </div>
      <div className="absolute inset-0" style={layer(-120)}>
        <div className="bloom bloom-c left-[35%] top-[30%] h-[38vmax] w-[38vmax] bg-mint/60" />
      </div>
      <div className="field-grid absolute inset-[-40px]" style={layer(18)} />
      <div className="grain absolute inset-0" />
    </div>
  );
}
