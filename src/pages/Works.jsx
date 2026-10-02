import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { SearchIcon, XIcon } from 'lucide-react';
import { useScreenInit } from '../useScreenInit.js';
import { ProjectCard } from '../components/ProjectCard';
import { projects } from '../data/projects';
import { reducedMotion, useEntrance } from '../motion';

gsap.registerPlugin(Flip);

export function Works() {
  useScreenInit();
  const categories = useMemo(() => ['All', ...Array.from(new Set(projects.map((p) => p.category)))], []);
  const [active, setActive] = useState('All');
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const flipState = useRef(null);
  useEntrance(rootRef);

  /* Snapshot card positions before a filter change so Flip can glide them. */
  const withFlip = (update) => {
    if (gridRef.current && !reducedMotion()) flipState.current = Flip.getState(gridRef.current.children);
    update();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesCategory = active === 'All' || p.category === active;
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = [p.title, p.summary, p.category, ...(p.tags || [])].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [active, query]);

  const resultsLabel = query ?
    `Results for \u201C${query}\u201D` :
    `Trending results for ${active === 'All' ? 'Works' : active}`;

  const fakeSeconds = (0.02 + filtered.length * 0.015).toFixed(2);

  useLayoutEffect(() => {
    const state = flipState.current;
    flipState.current = null;
    if (!state || !gridRef.current) return;
    Flip.from(state, {
      targets: gridRef.current.children,
      duration: 0.55,
      ease: 'power3.inOut',
      stagger: 0.03,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85, rotate: () => gsap.utils.random(-4, 4) }, {
        opacity: 1, scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2)', stagger: 0.05, clearProps: 'transform,opacity'
      })
    });
  }, [active, query]);

  return (<div ref={rootRef} className="w-full">
    <section className="w-full px-8 py-10 md:py-14">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h1 data-split className="font-handjet text-6xl uppercase leading-[0.85] tracking-tight text-ink sm:text-7xl">
          Works<span className="text-accent">.</span>
        </h1>
        <p data-anim className="pb-1 font-mono text-lg uppercase leading-none text-ink/50">
          {String(projects.length).padStart(2, '0')} projects
        </p>
      </div>

      {/* Search bar */}
      <div data-anim className="flex items-center gap-3 bevel bg-paper px-4 py-3 transition-colors focus-within:bg-accent-2/20">
        <SearchIcon size={20} className="shrink-0 text-ink/50" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const next = e.target.value;
            withFlip(() => setQuery(next));
          }}
          placeholder="Search my work..."
          aria-label="Search projects"
          className="min-w-0 flex-1 bg-transparent font-mono text-lg text-ink placeholder:text-ink/40 focus:outline-none"
        />
        {query &&
          <button onClick={() => withFlip(() => setQuery(''))} aria-label="Clear search" className="shrink-0 text-ink/50 hover:text-ink">
            <XIcon size={18} />
          </button>}
      </div>

      {/* Quick-filter chips */}
      <div className="mt-5 flex flex-wrap gap-3" role="tablist" aria-label="Filter projects">
        {categories.map((cat) => {
          const isActive = cat === active;
          return (<button key={cat} role="tab" aria-selected={isActive} data-pop onClick={() => withFlip(() => setActive(cat))} className={`bevel px-4 py-2 font-mono text-base max-md:text-[18px] uppercase leading-none transition-all ${isActive ? 'translate-x-[2px] translate-y-[2px] bg-ink text-paper shadow-pixel-none' : 'bg-paper text-ink hover:-translate-x-px hover:-translate-y-px hover:bg-accent hover:text-paper active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-none'}`}>

            {cat}
          </button>);
        })}
      </div>

      {/* Results */}
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-ink/15 pb-3">
        <p className="font-mono text-sm max-md:text-[18px] uppercase tracking-wide text-ink/50">
          {resultsLabel}
        </p>
        <p className="font-mono text-sm max-md:text-[18px] text-ink/40">
          {filtered.length} result{filtered.length === 1 ? '' : 's'} &middot; {fakeSeconds}s
        </p>
      </div>

      <div ref={gridRef} className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((project, i) => <div key={project.slug} data-flip-id={project.slug} className="h-full">
          <ProjectCard project={project} index={i} />
        </div>)}
      </div>

      {filtered.length === 0 &&
        <p className="py-16 text-center font-mono text-xl text-ink/50">
          No results{query ? ` for \u201C${query}\u201D` : ''} in this category yet.
        </p>}
    </section>
  </div>);
}