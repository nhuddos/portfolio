import React, { useEffect, useRef, useState } from 'react';

export function MenuBar({ menus }) {
  const [openLabel, setOpenLabel] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!openLabel) return;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpenLabel(null);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenLabel(null);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [openLabel]);

  return (
    <div
      ref={rootRef}
      role="menubar"
      className="relative z-30 flex shrink-0 items-center gap-0.5 border-b-2 border-[var(--bevel-dark)] bg-paper px-1 py-0.5"
    >
      {menus.map((menu) => {
        const isOpen = openLabel === menu.label;
        return (
          <div key={menu.label} className="relative">
            <button
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              onClick={() => setOpenLabel(isOpen ? null : menu.label)}
              // Once one menu is open, sliding across the bar switches menus.
              onMouseEnter={() => openLabel && setOpenLabel(menu.label)}
              className={`px-2.5 py-0.5 font-mono text-lg leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isOpen ? 'bg-ink text-paper' : 'text-ink hover:bg-ink hover:text-paper'
              }`}
            >
              <u>{menu.label[0]}</u>
              {menu.label.slice(1)}
            </button>

            {isOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full z-40 mt-0.5 min-w-[12rem] bevel bg-paper py-1 shadow-pixel"
              >
                {menu.items.map((item, i) =>
                  item.separator ? (
                    <hr key={`sep-${i}`} className="my-1 border-t-2 border-ink/20" />
                  ) : (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      disabled={item.disabled}
                      onClick={() => {
                        setOpenLabel(null);
                        item.onSelect?.();
                      }}
                      className="flex w-full items-center justify-between gap-6 px-3 py-1 text-left font-mono text-lg leading-none text-ink hover:bg-ink hover:text-paper focus:outline-none focus-visible:bg-ink focus-visible:text-paper disabled:text-ink/35 disabled:hover:bg-transparent disabled:hover:text-ink/35"
                    >
                      <span>{item.label}</span>
                      {item.hint && <span className="opacity-60">{item.hint}</span>}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
