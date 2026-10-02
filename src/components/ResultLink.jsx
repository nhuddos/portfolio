import React from 'react';
import { ExternalLinkIcon } from 'lucide-react';

const TILE_COLORS = ['bg-accent', 'bg-accent-2', 'bg-mint', 'bg-sky', 'bg-lilac'];

function displayUrl(project) {
  if (!project.url) return ['khanh do', 'works', project.slug];
  try {
    const { hostname, pathname } = new URL(project.url);
    return [hostname.replace(/^www\./, ''), ...pathname.split('/').filter(Boolean).slice(0, 2)];
  } catch {
    return [project.url];
  }
}

/* A search-engine style result: favicon + breadcrumb URL, title link, snippet. */
export function ResultLink({ project, index = 0 }) {
  const crumbs = displayUrl(project);
  const meta = [project.year, project.category].filter(Boolean).join(' · ');
  const Title = project.url ? 'a' : 'span';
  const titleProps = project.url ? { href: project.url, target: '_blank', rel: 'noreferrer' } : {};

  return (
    <article className="group flex gap-3.5">
      {/* Pixel favicon: the project's initial on a palette tile */}
      <span
        aria-hidden="true"
        className={`mt-1 grid h-8 w-8 shrink-0 place-items-center bevel font-mono text-2xl uppercase leading-none text-ink ${TILE_COLORS[index % TILE_COLORS.length]}`}
      >
        {project.title[0]}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-base leading-tight text-ink/55 max-md:text-[18px]">
          {crumbs.join(' › ')}
        </p>

        <Title
          {...titleProps}
          className={`mt-0.5 inline-flex items-baseline gap-2 font-mono text-2xl leading-tight text-lilac ${project.url ? 'underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none' : 'cursor-default'}`}
        >
          {project.title}
          {project.url && <ExternalLinkIcon size={14} strokeWidth={2.5} className="shrink-0 self-center opacity-0 transition-opacity group-hover:opacity-60" />}
        </Title>

        {(meta || project.summary) &&
          <p className="mt-1 max-w-2xl font-body text-sm leading-relaxed text-ink/70">
            {meta && <span className="text-ink/45">{meta}{project.summary ? ' — ' : ''}</span>}
            {project.summary}
          </p>}

        {project.tags?.length > 0 &&
          <p className="mt-1 font-mono text-sm uppercase leading-none text-ink/40 max-md:text-[18px]">
            {project.tags.join(' · ')}
          </p>}
      </div>
    </article>
  );
}
