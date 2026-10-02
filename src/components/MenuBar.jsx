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
      className="relative z-30 flex shrink-0 items-center gap-0.5 px-2 pb-1.5"
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
              className={`rounded-md px-2.5 py-1 text-[12px] leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isOpen ? 'bg-ink/[0.08] text-ink' : 'text-ink/55 hover:bg-ink/5 hover:text-ink'
              }`}
            >
              {menu.label}
            </button>

            {isOpen && (
              <div
                role="menu"
                className="glass-strong absolute left-0 top-full z-40 mt-1 min-w-[13rem] rounded-xl p-1 shadow-float"
              >
                {menu.items.map((item, i) =>
                  item.separator ? (
                    <hr key={`sep-${i}`} className="mx-2 my-1 border-t border-ink/10" />
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
                      className="flex w-full items-center justify-between gap-6 rounded-lg px-2.5 py-1.5 text-left text-[13px] leading-none text-ink hover:bg-accent hover:text-on-accent focus:outline-none focus-visible:bg-accent focus-visible:text-on-accent disabled:text-ink/35 disabled:hover:bg-transparent disabled:hover:text-ink/35"
                    >
                      <span>{item.label}</span>
                      {item.hint && <span className="font-mono text-[11px] opacity-50">{item.hint}</span>}
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
