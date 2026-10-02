import React from 'react';
import { ExternalLinkIcon, MoreVerticalIcon } from 'lucide-react';

const TILE_COLORS = ['bg-accent', 'bg-accent-2', 'bg-mint', 'bg-sky', 'bg-lilac'];

/* Known hosts get a proper site name and their real logo as the favicon. */
const SITES = {
  'figma.com': { name: 'Figma', logo: 'figma' },
  'behance.net': { name: 'Behance', logo: 'behance' },
  'khanhdo.be': { name: 'Khanh Do' }
};

/* Drops opaque IDs (Figma file keys, Behance numbers) from the breadcrumb. */
const isId = (seg) => /^\d+$/.test(seg) || (seg.length >= 16 && /^[A-Za-z0-9]+$/.test(seg));

function parseUrl(project) {
  if (!project.url) return { site: { name: 'Khanh Do' }, crumbs: ['portfolio', 'works', project.slug] };
  try {
    const { hostname, pathname } = new URL(project.url);
    const host = hostname.replace(/^www\./, '');
    const parts = pathname.split('/').filter(Boolean).map((seg) => {
      try {
        return decodeURIComponent(seg);
      } catch {
        return seg;
      }
    }).filter((seg) => !isId(seg));
    return { site: SITES[host] ?? { name: host }, crumbs: [host, ...parts.slice(0, 2)] };
  } catch {
    return { site: { name: project.url }, crumbs: [project.url] };
  }
}

/* A search-engine style result: favicon + breadcrumb URL, title link, snippet.
   These smaller projects have no detail page: the whole result opens the
   project's own link in a new tab (the title link is stretched over the row). */
export function ResultLink({ project, index = 0 }) {
  const { site, crumbs } = parseUrl(project);
  const meta = [project.year, project.category].filter(Boolean).join(' · ');
  const Title = project.url ? 'a' : 'span';
  const titleProps = project.url ? { href: project.url, target: '_blank', rel: 'noreferrer' } : {};

  return (
    <article className="group relative flex gap-3.5">
      {/* Favicon: the site's logo, or the project's initial on a pixel tile */}
      {site.logo ?
        <span aria-hidden="true" className="mt-1 grid h-8 w-8 shrink-0 place-items-center bevel bg-white">
          <img src={`https://cdn.simpleicons.org/${site.logo}`} alt="" className="h-4 w-4 object-contain" />
        </span> :
        <span
          aria-hidden="true"
          className={`mt-1 grid h-8 w-8 shrink-0 place-items-center bevel font-mono text-2xl uppercase leading-none text-ink ${TILE_COLORS[index % TILE_COLORS.length]}`}
        >
          {project.title[0]}
        </span>}

      <div className="min-w-0 flex-1">
        <p className="font-body text-sm leading-tight text-ink">{site.name}</p>
        <p className="flex items-center gap-1 font-mono text-base leading-tight text-ink/55 max-md:text-[18px]">
          <span className="truncate">{crumbs.join(' › ')}</span>
          <MoreVerticalIcon size={14} strokeWidth={2.5} aria-hidden="true" className="shrink-0 text-ink/40" />
        </p>

        <Title
          {...titleProps}
          className={`mt-0.5 inline-flex items-baseline gap-2 font-mono text-2xl leading-tight text-lilac ${project.url ? 'underline-offset-4 after:absolute after:inset-0 after:content-[\'\'] group-hover:underline focus-visible:underline focus-visible:outline-none' : 'cursor-default'}`}
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
