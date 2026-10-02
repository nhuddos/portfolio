import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { DicesIcon, MicIcon, SearchIcon, XIcon } from 'lucide-react';
import { useScreenInit } from '../useScreenInit.js';
import { ProjectCard } from '../components/ProjectCard';
import { ResultLink } from '../components/ResultLink';
import { Pagination, PeopleAlsoAsk, SearchLogo } from '../components/SearchExtras';
import { projects } from '../data/projects';
import { moreProjects } from '../data/moreProjects';
import { hop, reducedMotion, useEntrance, wiggle } from '../motion';

gsap.registerPlugin(Flip);

const TOTAL = projects.length + moreProjects.length;

const matches = (p, active, q) => {
  if (active !== 'All' && p.category !== active) return false;
  if (!q) return true;
  return [p.title, p.summary, p.category, p.year, ...(p.tags || [])].join(' ').toLowerCase().includes(q);
};

/* Section divider with pinstripes, like an old Mac window's title bar. */
function SectionBar({ children, count }) {
  return (
    <div className="flex items-center gap-3">
      <span className="pinstripe h-[14px] flex-1 opacity-70" aria-hidden="true" />
      <h2 className="shrink-0 font-mono text-xl uppercase leading-none text-ink">
        {children}
        <span className="ml-2 text-ink/40">({count})</span>
      </h2>
      <span className="pinstripe h-[14px] flex-1 opacity-70" aria-hidden="true" />
    </div>
  );
}

export function Works() {
  useScreenInit();
  const navigate = useNavigate();
  const categories = useMemo(() => Array.from(new Set([...projects, ...moreProjects].map((p) => p.category).filter(Boolean))), []);
  const [active, setActive] = useState('All');
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const rootRef = useRef(null);
  const flipState = useRef(null);
  useEntrance(rootRef);

  /* Snapshot result positions before a change so Flip can glide them. */
  const withFlip = (update) => {
    if (rootRef.current && !reducedMotion()) flipState.current = Flip.getState(rootRef.current.querySelectorAll('[data-flip-id]'));
    update();
  };

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => projects.filter((p) => matches(p, active, q)), [active, q]);
  const filteredMore = useMemo(() => moreProjects.filter((p) => matches(p, active, q)), [active, q]);
  const resultCount = filtered.length + filteredMore.length;
  const fakeSeconds = (0.02 + resultCount * 0.015).toFixed(2);
  const isLanding = active === 'All' && !q;

  useLayoutEffect(() => {
    const state = flipState.current;
    flipState.current = null;
    if (!state || !rootRef.current) return;
    Flip.from(state, {
      targets: rootRef.current.querySelectorAll('[data-flip-id]'),
      duration: 0.55,
      ease: 'power3.inOut',
      stagger: 0.03,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85, rotate: () => gsap.utils.random(-4, 4) }, {
        opacity: 1, scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2)', stagger: 0.03, clearProps: 'transform,opacity'
      })
    });
  }, [active, query]);

  const pickTab = (tab) => withFlip(() => setActive(tab));

  const onMic = (e) => {
    hop(e.currentTarget, 6);
    setListening(true);
    setTimeout(() => setListening(false), 2200);
  };
  const onLucky = (e) => {
    wiggle(e.currentTarget);
    const pick = projects[Math.floor(Math.random() * projects.length)];
    setTimeout(() => navigate(`/works/${pick.slug}`), 350);
  };

  const results = (
    <div className="min-w-0 flex-1 space-y-12">

      {filtered.length > 0 && <div>
        <SectionBar count={filtered.length}>Featured</SectionBar>
        <div className={"mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3"}>
          {filtered.map((project, i) => <div key={project.slug} data-flip-id={project.slug} className="h-full">
            <ProjectCard project={project} index={i} />
          </div>)}
        </div>
      </div>}

      {isLanding && <PeopleAlsoAsk />}

      {filteredMore.length > 0 && <div>
        <SectionBar count={filteredMore.length}>More results</SectionBar>
        <div className="mt-8 flex max-w-3xl flex-col gap-7">
          {filteredMore.map((project, i) => <div key={project.slug} data-flip-id={`more-${project.slug}`}>
            <ResultLink project={project} index={i} />
          </div>)}
        </div>
      </div>}

      {resultCount === 0 &&
        <div className="py-12 text-center">
          <p className="font-mono text-2xl text-ink">Your search &ldquo;{query}&rdquo; did not match any projects.</p>
          <p className="mt-3 font-body text-sm text-ink/60">Try different keywords, a different tab, or <button type="button" onClick={() => withFlip(() => { setQuery(''); setActive('All'); })} className="text-lilac underline-offset-4 hover:underline">clear the search</button>.</p>
        </div>}

      {resultCount > 0 && <Pagination />}
    </div>
  );

  return (<div ref={rootRef} className="w-full">
    {/* Header: logo + search bar, then tabs, like a results page */}
    <header className="border-b-2 border-ink/15 px-6 pt-8 sm:px-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
        <h1 data-split className="shrink-0">
          <SearchLogo className="text-6xl sm:text-7xl" />
        </h1>

        <div data-anim className="flex min-w-0 flex-1 items-center gap-3 bevel bg-paper px-4 py-2.5 transition-colors focus-within:bg-accent-2/20">
          <SearchIcon size={20} className="shrink-0 text-ink/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              const next = e.target.value;
              withFlip(() => setQuery(next));
            }}
            placeholder={listening ? 'listening... (not really, please type)' : 'Search my work...'}
            aria-label="Search projects"
            className="min-w-0 flex-1 bg-transparent font-mono text-xl text-ink placeholder:text-ink/40 focus:outline-none"
          />
          {query &&
            <button onClick={() => withFlip(() => setQuery(''))} aria-label="Clear search" className="grid h-8 w-8 shrink-0 place-items-center text-ink/50 hover:text-ink">
              <XIcon size={18} />
            </button>}
          <span className="h-6 w-[2px] shrink-0 bg-ink/15" aria-hidden="true" />
          <button type="button" onClick={onMic} aria-label="Search by voice" title="Search by voice" className={`grid h-8 w-8 shrink-0 place-items-center hover:bg-accent-2/40 ${listening ? 'text-accent' : 'text-ink/70'}`}>
            <MicIcon size={18} strokeWidth={2.5} className={listening ? 'pixel-blink' : ''} />
          </button>
          <button type="button" onClick={onLucky} aria-label="I'm feeling lucky: open a random project" title="I'm feeling lucky" className="grid h-8 w-8 shrink-0 place-items-center text-ink/70 hover:bg-accent-2/40">
            <DicesIcon size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-6 overflow-x-auto" role="tablist" aria-label="Filter projects">
        {['All', ...categories].map((tab) => {
          const isActive = tab === active;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => pickTab(tab)}
              className={`relative shrink-0 pb-3 font-mono text-xl uppercase leading-none transition-colors ${isActive ? 'text-ink' : 'text-ink/50 hover:text-ink'}`}
            >
              {tab}
              <span className={`absolute inset-x-0 -bottom-[2px] h-1 bg-accent transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0'}`} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </header>

    <section className="w-full px-6 pb-14 pt-4 sm:px-8">
      <p className="font-mono text-lg leading-none text-ink/45">
        About {resultCount} result{resultCount === 1 ? '' : 's'} ({fakeSeconds} seconds) &middot; {String(TOTAL).padStart(2, '0')} projects indexed
      </p>

      <div className="mt-6">
        {results}
      </div>
    </section>
  </div>);
}
