import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ChevronDownIcon, CopyIcon, SparklesIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import { projects, imagesFor } from '../data/projects';
import { moreProjects } from '../data/moreProjects';
import { timeline, toolGroups } from '../data/profile';
import { CONTACT_LINKS, resolveLogoSrc } from '../data/contactLinks.js';
import { asset } from '../assetUrl.js';
import { hop, pixelBurst, reducedMotion, wiggle } from '../motion';

/*
  Pieces that make the Works page read like a search engine results page:
  logo, overview box, knowledge panel, "people also ask", image results and
  pagination. Every fact here comes from the About data or the project data.
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

/* Small rounded "source" pill that sits at the end of a sentence. */
function SourceChip({ to, href, children }) {
  const cls = 'ml-1.5 inline-flex translate-y-[-2px] items-center gap-1 bevel bg-paper px-1.5 py-0.5 align-middle font-mono text-sm leading-none text-ink/70 hover:bg-accent-2 max-md:text-[16px]';
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <a href={href} target="_blank" rel="noreferrer" className={cls}>{children}</a>;
}

/* Section header: pinstripe bar with a label, matching the result sections. */
function PanelTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2.5">
      {Icon && <Icon size={18} strokeWidth={2.5} className="shrink-0 text-accent" />}
      <h2 className="shrink-0 font-mono text-xl uppercase leading-none text-ink">{children}</h2>
      <span className="pinstripe h-[12px] flex-1 opacity-50" aria-hidden="true" />
    </div>
  );
}

const byCategory = projects.reduce((acc, p) => {
  (acc[p.category] ??= []).push(p);
  return acc;
}, {});

/* The "AI Overview", except it's just Khanh. */
export function KhanhOverview({ onPickCategory }) {
  const [feedback, setFeedback] = useState(null);
  const bodyRef = useRef(null);

  const copy = (e) => {
    navigator.clipboard?.writeText(bodyRef.current?.innerText ?? '').catch(() => undefined);
    hop(e.currentTarget, 5);
    setFeedback('copied');
  };
  const like = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    pixelBurst(r.left + r.width / 2, r.top + r.height / 2, 18);
    hop(e.currentTarget, 6);
    setFeedback('liked');
  };
  const dislike = (e) => {
    wiggle(e.currentTarget);
    setFeedback('disliked');
  };

  return (
    <section data-anim className="bevel bg-paper p-5" aria-label="Khanh overview">
      <PanelTitle icon={SparklesIcon}>Khanh Overview</PanelTitle>

      <div ref={bodyRef}>
        <div className="mt-4 flex items-end gap-3">
          <h3 className="font-handjet text-5xl uppercase leading-[0.85] tracking-tight text-ink">Khanh Do</h3>
          <p className="pb-1 font-mono text-lg leading-none text-ink/50">visual designer</p>
        </div>

        <p className="mt-4 max-w-2xl font-body text-[15px] leading-relaxed text-ink/85">
          <b>Khanh Do</b> is a <mark className="bg-accent-2/60 px-1 text-ink">Vietnamese, caffeine-driven digital designer</mark> in
          the 3rd year of DEVINE (digital design and development) at Howest, who loves visual storytelling and building
          immersive experiences across web, motion, and print.
          <SourceChip to="/about">About</SourceChip>
        </p>

        <h4 className="mt-5 font-mono text-xl uppercase leading-none text-ink">Range of work</h4>
        <ul className="mt-3 space-y-2 font-body text-[15px] leading-relaxed text-ink/85">
          {Object.entries(byCategory).map(([category, list]) => (
            <li key={category} className="flex gap-2">
              <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 bg-ink" />
              <span>
                <button type="button" onClick={() => onPickCategory(category)} className="font-semibold text-lilac underline-offset-4 hover:underline">
                  {category}:
                </button>{' '}
                {list.map((p) => p.title).join(', ')}.
              </span>
            </li>
          ))}
          {moreProjects.length > 0 && (
            <li className="flex gap-2">
              <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 bg-ink" />
              <span><b>And more:</b> {moreProjects.length} smaller projects, from {moreProjects[0].title} to {moreProjects[moreProjects.length - 1].title}.</span>
            </li>
          )}
        </ul>

        <p className="mt-4 max-w-2xl font-body text-[15px] leading-relaxed text-ink/85">
          Currently looking for a <b>design internship</b> starting <b>February 2027</b>.
          <SourceChip href={asset('/KhanhDo_CV.pdf')}>CV</SourceChip>
        </p>
      </div>

      <p className="mt-4 font-mono text-base leading-none text-ink/45 max-md:text-[16px]">
        Overviews may include mistakes. This one doesn&apos;t.
      </p>

      <div className="mt-3 flex items-center gap-1.5">
        {[
          { label: 'Copy overview', Icon: CopyIcon, onClick: copy },
          { label: 'Good overview', Icon: ThumbsUpIcon, onClick: like },
          { label: 'Bad overview', Icon: ThumbsDownIcon, onClick: dislike }
        ].map(({ label, Icon, onClick }) => (
          <button key={label} type="button" onClick={onClick} aria-label={label} className="grid h-9 w-9 place-items-center text-ink/60 hover:bg-accent-2/40 hover:text-ink">
            <Icon size={16} strokeWidth={2.5} />
          </button>
        ))}
        <span role="status" className="ml-1 font-mono text-lg leading-none text-ink/50">
          {feedback === 'copied' && 'copied to clipboard'}
          {feedback === 'liked' && 'thank you!! (hire me)'}
          {feedback === 'disliked' && 'noted. and ignored.'}
        </span>
      </div>
    </section>
  );
}

const COLLAGE = [
  { src: asset('/images/khanhdo.webp'), alt: 'Khanh Do' },
  ...projects.slice(0, 2).map((p) => ({ src: p.cover, alt: p.title }))
];

const toolNames = toolGroups.flatMap((g) => g.items.map((t) => t.name));

/* Knowledge panel on the right, like a search engine's entity card. */
export function KnowledgePanel() {
  const facts = [
    ['Studies', `${timeline[0].title.replace(' Student', '')}, ${timeline[0].place}`],
    ['Roles', timeline.slice(1).map((t) => `${t.title} at ${t.place.split(' — ')[0]}`).join('; ')],
    ['Open to', 'Design internship, February 2027'],
    ['Tools', `${toolNames.slice(0, 5).join(', ')} and more`]
  ];
  return (
    <aside data-anim className="bevel bg-paper" aria-label="About Khanh Do">
      <div className="grid grid-cols-2 gap-[2px] bg-ink p-[2px]">
        {COLLAGE.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            loading="lazy"
            className={`pixelated h-full w-full object-cover ${i === 0 ? 'row-span-2 aspect-[3/4]' : 'aspect-[4/3]'}`}
          />
        ))}
      </div>

      <div className="p-4">
        <h2 className="font-handjet text-4xl uppercase leading-[0.85] tracking-tight text-ink">Khanh Do</h2>
        <p className="mt-1 font-mono text-lg leading-none text-ink/50">Visual designer</p>

        <p className="mt-4 font-body text-sm leading-relaxed text-ink/80">
          A student designer with a passion for visual storytelling, digital design, and creating unique and immersive
          experiences across web, motion, and print.
        </p>
        <p className="mt-2 font-body text-sm text-ink/55">
          Source: <Link to="/about" className="text-lilac underline-offset-4 hover:underline">About</Link>
        </p>

        <dl className="mt-4 space-y-2 border-t-2 border-dashed border-ink/15 pt-4 font-body text-sm leading-snug">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="inline font-semibold text-ink">{k}: </dt>
              <dd className="inline text-ink/75">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 font-mono text-lg uppercase leading-none text-ink/50">Profiles</p>
        <div className="mt-2 flex gap-2">
          {CONTACT_LINKS.map((link) => (
            <a key={link.id} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} onMouseEnter={(e) => wiggle(e.currentTarget)} className="grid h-9 w-9 place-items-center bevel bg-paper hover:bg-accent-2">
              {link.icon === 'mail' ?
                <span className="font-mono text-lg leading-none">@</span> :
                <img src={resolveLogoSrc(link.logo)} alt="" aria-hidden="true" className="h-4 w-4 object-contain" />}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}

const QUESTIONS = [
  {
    q: 'Is Khanh available for work?',
    a: <>Yes. Khanh is looking for a <b>design internship</b> starting <b>February 2027</b>. <Link to="/about" className="text-lilac underline-offset-4 hover:underline">Say hi on the About page</Link>.</>
  },
  {
    q: 'What tools does Khanh use?',
    a: <>{toolGroups.map((g) => <span key={g.label} className="block"><b>{g.label}:</b> {g.items.map((t) => t.name).join(', ')}</span>)}</>
  },
  {
    q: 'Where does Khanh study?',
    a: <>{timeline[0].place}, in the {timeline[0].title.replace(' Student', '')} program. {timeline[0].desc}</>
  },
  {
    q: 'Is it really worth it?',
    a: <>it&apos;s really worth it</>
  }
];

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
      gsap.to(el, { height: opening ? 'auto' : 0, duration: 0.35, ease: opening ? 'back.out(1.4)' : 'power2.in' });
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

/* The "Images" tab: every image from the matching projects, masonry style. */
export function ImageResults({ list }) {
  const images = imagesFor(list);
  const gridRef = useRef(null);

  /* Tiles drop in quickly; total stagger is capped so big grids don't crawl. */
  useLayoutEffect(() => {
    const tiles = gridRef.current?.children;
    if (!tiles?.length || reducedMotion()) return undefined;
    const tween = gsap.fromTo(tiles, { opacity: 0, y: 16 }, {
      opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.6)', stagger: { amount: 0.4 }, clearProps: 'transform,opacity'
    });
    return () => tween.revert();
  }, [list]);

  if (!images.length) {
    return <p className="py-16 text-center font-mono text-xl text-ink/50">No images for this search.</p>;
  }

  return (
    <div ref={gridRef} className="columns-2 gap-4 sm:columns-3 xl:columns-4">
      {images.map((img) => (
        <Link
          key={img.url}
          to={`/works/${img.project.slug}`}
          className="group mb-5 block break-inside-avoid"
        >
          <span className="block overflow-hidden bevel bg-paper">
            <img src={img.url} alt={img.caption} loading="lazy" className="pixelated w-full transition-transform duration-500 group-hover:scale-105" />
          </span>
          <span className="mt-2 block truncate font-mono text-base leading-none text-ink/50 max-md:text-[16px]">{img.project.slug}</span>
          <span className="mt-1 block truncate font-mono text-lg leading-tight text-lilac group-hover:underline">{img.project.title}</span>
        </Link>
      ))}
    </div>
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
    setNote(page === 5 ? 'page 5 is just more of page 1' : `page ${page} is still loading (forever)`);
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
        <Link to="/about" className="mb-[1px] ml-4 font-mono text-xl leading-none text-lilac hover:underline">Next ›</Link>
      </div>
      <p role="status" className="mt-3 h-5 font-mono text-lg leading-none text-ink/50">{note}</p>
    </nav>
  );
}
