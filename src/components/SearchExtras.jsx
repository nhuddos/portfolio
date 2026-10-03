import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ChevronDownIcon } from 'lucide-react';
import { reducedMotion, wiggle } from '../motion';

/*
  Pieces that make the Works page read like a search engine results page:
  the logo, "people also ask" and pagination.
*/

const LOGO_COLORS = ['text-lilac', 'text-accent', 'text-accent-2', 'text-lilac', 'text-mint', 'text-accent'];

/* Multicolour wordmark, one colour per letter, like you-know-who. */
export function SearchLogo({ word = 'Works', className = '' }) {
  return (
    <span className={`font-handjet uppercase leading-[0.85] tracking-tight [-webkit-text-stroke:1px_var(--ink)] ${className}`}>
      {word.split('').map((ch, i) => <span key={i} className={LOGO_COLORS[i % LOGO_COLORS.length]}>{ch}</span>)}
    </span>
  );
}

const QUESTIONS = [
  { q: 'What is Khanh\u2019s favorite food?', a: 'bun cha ha noi' },
  { q: 'What is Khanh\u2019s favorite show?', a: 'i am weirdly attached to hunterxhunter (ive rewatched it 6 times fully now)' },
  { q: 'What is Khanh looking for in an internship?', a: 'connection, learning opportunities, n i wouldnt mind if u hired me or something >.>' },
  { q: 'Has Khanh coded any visual novels?', a: 'yes but youll have to hire me before you can play them teehee' }
];

/* Section header: label plus a dotted rail, matching the result sections. */
function PanelTitle({ children }) {
  return (
    <div className="flex items-center gap-2.5">
      <h2 className="shrink-0 font-mono text-xl uppercase leading-none text-ink">{children}</h2>
      <span className="rail-dots h-1 flex-1 opacity-60" aria-hidden="true" />
    </div>
  );
}

/* Expanding questions, the classic search-page accordion. */
export function PeopleAlsoAsk() {
  const [open, setOpen] = useState(null);
  const panels = useRef({});

  const toggle = (i) => {
    const next = open === i ? null : i;
    [open, next].forEach((idx) => {
      const el = idx != null && panels.current[idx];
      if (!el) return;
      const opening = idx === next;
      if (reducedMotion()) {
        gsap.set(el, { height: opening ? 'auto' : 0 });
        return;
      }
      gsap.to(el, { height: opening ? 'auto' : 0, duration: 0.2, ease: 'steps(4)' });
    });
    setOpen(next);
  };

  return (
    <section data-anim aria-label="People also ask">
      <PanelTitle>People also ask</PanelTitle>
      <div className="mt-3 border-t-2 border-ink/15">
        {QUESTIONS.map((item, i) => (
          <div key={item.q} className="border-b-2 border-ink/15">
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-expanded={open === i}
              className="flex w-full items-center justify-between gap-4 py-3.5 text-left font-mono text-xl leading-tight text-ink hover:text-accent"
            >
              {item.q}
              <ChevronDownIcon size={18} strokeWidth={2.5} className={`shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
            </button>
            <div ref={(el) => { panels.current[i] = el; }} className="h-0 overflow-hidden">
              <p className="pb-4 font-body text-[15px] leading-relaxed text-ink/80">{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* "Khaaaaanh" pager. There's only one page, which is the joke. */
export function Pagination() {
  const [note, setNote] = useState('');
  const letters = ['K', 'h', 'a', 'a', 'a', 'a', 'a', 'n', 'h'];
  const pageFor = (i) => (i >= 2 && i <= 6 ? i - 1 : null);

  const onPage = (e, page) => {
    if (page === 1) return;
    wiggle(e.currentTarget);
    if (page === 'next') setNote('there is no next page. this is it. this is all of me');
    else setNote(page === 5 ? 'page 5 is just more of page 1' : `page ${page} is still loading (forever)`);
  };

  return (
    <nav data-anim aria-label="Result pages" className="mt-14 flex flex-col items-center">
      <div className="flex items-end">
        {letters.map((ch, i) => {
          const page = pageFor(i);
          return (
            <span key={i} className="flex flex-col items-center">
              <span className={`font-handjet text-5xl leading-none ${LOGO_COLORS[i % LOGO_COLORS.length]} [-webkit-text-stroke:1px_var(--ink)]`}>{ch}</span>
              {page ?
                <button
                  type="button"
                  onClick={(e) => onPage(e, page)}
                  aria-current={page === 1 ? 'page' : undefined}
                  className={`mt-1 px-1 font-mono text-xl leading-none ${page === 1 ? 'text-ink' : 'text-lilac hover:underline'}`}
                >
                  {page}
                </button> :
                <span className="mt-1 font-mono text-xl leading-none">&nbsp;</span>}
            </span>
          );
        })}
        <button type="button" onClick={(e) => onPage(e, 'next')} className="mb-[1px] ml-4 font-mono text-xl leading-none text-lilac hover:underline">Next ›</button>
      </div>
      <p role="status" className="mt-3 h-5 font-mono text-lg leading-none text-ink/50">{note}</p>
    </nav>
  );
}
