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
    <section className="w-full px-8 py-10 md:py-14">
      {/* Search bar */}
      <div className="flex items-center gap-3 border-3 border-ink bg-paper px-4 py-3 shadow-pixel">
        <SearchIcon size={20} className="shrink-0 text-ink/50" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search my work..."
          aria-label="Search projects"
          className="min-w-0 flex-1 bg-transparent font-mono text-lg text-ink placeholder:text-ink/40 focus:outline-none"
        />
        {query &&
          <button onClick={() => setQuery('')} aria-label="Clear search" className="shrink-0 text-ink/50 hover:text-ink">
            <XIcon size={18} />
          </button>}
      </div>

      {/* Quick-filter chips */}
      <div className="mt-5 flex flex-wrap gap-3" role="tablist" aria-label="Filter projects">
        {categories.map((cat) => {
          const isActive = cat === active;
          return (<button key={cat} role="tab" aria-selected={isActive} onClick={() => setActive(cat)} className={`border-2 border-ink px-4 py-2 font-mono text-base max-md:text-[18px] uppercase leading-none transition-all ${isActive ? 'translate-x-[2px] translate-y-[2px] bg-ink text-paper shadow-none' : 'bg-paper text-ink shadow-pixel hover:-translate-x-px hover:-translate-y-px hover:bg-accent hover:text-paper hover:shadow-pixel-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'}`}>

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

      <div className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((project, i) => <ProjectCard key={project.slug} project={project} index={i} />)}
      </div>

      {filtered.length === 0 &&
        <p className="py-16 text-center font-mono text-xl text-ink/50">
          No results{query ? ` for \u201C${query}\u201D` : ''} in this category yet.
        </p>}
    </section>
  </div>);
}