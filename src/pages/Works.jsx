import React, { useMemo, useState } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { useScreenInit } from '../useScreenInit.js';
import { ProjectCard } from '../components/ProjectCard';
import { projects } from '../data/projects';

export function Works() {
  useScreenInit();
  const categories = useMemo(() => ['All', ...Array.from(new Set(projects.map((p) => p.category)))], []);
  const [active, setActive] = useState('All');
  const [query, setQuery] = useState('');

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

  return (<div className="w-full">
    <section className="w-full px-6 py-10 sm:px-10 md:py-14">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow text-ink/45">Selected work &mdash; {projects.length} projects</p>
          <h1 className="mt-3 font-display text-5xl italic leading-none text-ink sm:text-6xl">Works</h1>
        </div>

        {/* Search bar */}
        <div className="flex w-full items-center gap-2.5 rounded-full border border-ink/10 bg-ink/[0.03] px-4 py-2.5 transition-colors focus-within:border-ink/30 focus-within:bg-paper md:w-80">
          <SearchIcon size={16} strokeWidth={1.75} className="shrink-0 text-ink/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search my work..."
            aria-label="Search projects"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-ink placeholder:text-ink/40 focus:outline-none"
          />
          {query &&
            <button onClick={() => setQuery('')} aria-label="Clear search" className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-ink/50 hover:bg-ink/5 hover:text-ink">
              <XIcon size={14} />
            </button>}
        </div>
      </div>

      {/* Quick-filter chips */}
      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter projects">
        {categories.map((cat) => {
          const isActive = cat === active;
          return (<button key={cat} role="tab" aria-selected={isActive} onClick={() => setActive(cat)} className={`rounded-full border px-4 py-2 text-[13px] leading-none transition-colors ${isActive ? 'border-ink bg-ink text-paper' : 'border-ink/10 text-ink/70 hover:border-ink/30 hover:text-ink'}`}>

            {cat}
          </button>);
        })}
      </div>

      {/* Results */}
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/10 pb-3">
        <p className="eyebrow text-ink/45">
          {resultsLabel}
        </p>
        <p className="font-mono text-[11px] text-ink/40">
          {filtered.length} result{filtered.length === 1 ? '' : 's'} &middot; {fakeSeconds}s
        </p>
      </div>

      <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((project, i) => <ProjectCard key={project.slug} project={project} index={i} />)}
      </div>

      {filtered.length === 0 &&
        <p className="py-16 text-center font-display text-3xl italic text-ink/50">
          Nothing here{query ? ` for \u201C${query}\u201D` : ''} yet.
        </p>}
    </section>
  </div>);
}
