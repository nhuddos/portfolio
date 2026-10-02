import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import {
  ArrowLeftIcon,
  ExternalLinkIcon
} from 'lucide-react';
import { useScreenInit } from '../useScreenInit.js';
import { getProject } from '../data/projects';

const storySections = [
  { id: 'challenge', label: 'The Challenge' },
  { id: 'approach', label: 'The Approach' },
  { id: 'outcome', label: 'The Outcome' }
];

function splitIntoGroups(images, count) {
  const base = Math.floor(images.length / count);
  const extra = images.length % count;
  let start = 0;
  return Array.from({ length: count }, (_, i) => {
    const size = base + (i < extra ? 1 : 0);
    const group = images.slice(start, start + size);
    start += size;
    return group;
  });
}

function Highlighted({ text, terms }) {
  if (!terms || terms.length === 0) return <>{text}</>;
  const escaped = [...terms]
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(pattern);
  return (<>
    {parts.map((part, i) => terms.some((t) => t.toLowerCase() === part.toLowerCase()) ?
      <mark key={i} className="rounded bg-accent-2/45 px-1 text-ink">{part}</mark> :
      <React.Fragment key={i}>{part}</React.Fragment>)}
  </>);
}

function ProjectImage({ image, className = '' }) {
  return (<motion.figure initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className={className}>
    <img src={image.url} alt={image.caption} loading="lazy" className="w-full rounded-2xl border border-ink/[0.06] object-cover" />
    {image.caption && <figcaption className="mt-3 max-w-xl text-[13px] leading-relaxed text-ink/50">{image.caption}</figcaption>}
  </motion.figure>);
}

function BigButton({ href, to, tone = 'solid', children }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-medium transition-all duration-300 ease-out-expo hover:-translate-y-0.5 active:translate-y-0 ${tone === 'solid' ? 'bg-ink text-paper' : 'border border-ink/15 text-ink hover:border-ink/40'}`;
  if (to) {
    return <Link to={to} className={cls}>{children}</Link>;
  }
  return <a href={href} target="_blank" rel="noreferrer" className={cls}>{children}</a>;
}

export function WorkDetail({ slug: slugProp } = {}) {
  useScreenInit();
  const params = useParams();
  const slug = slugProp ?? params.slug;
  const project = slug ? getProject(slug) : undefined;

  const sectionEls = useRef({});
  const panelEls = useRef({});
  const rootRef = useRef(null);
  const scrollElRef = useRef(null);
  const progressFillRef = useRef(null);
  const [activeSection, setActiveSection] = useState('challenge');
  const [heroHeight, setHeroHeight] = useState(null);

  const storyImages = project ?
    project.images.filter((img) => img.url !== project.cover && img.url !== project.heroImage) :
    [];
  const imageGroups = project ?
    splitIntoGroups(storyImages, storySections.length).map((images, i) => ({ ...storySections[i], images })) :
    [];

  const tocSections = storySections;

  const registerSection = (id) => (el) => {
    sectionEls.current[id] = el;
  };

  const registerPanel = (id) => (el) => {
    panelEls.current[id] = el;
  };

  useEffect(() => {
    if (!project) return;
    const scrollEl = rootRef.current?.closest('.window-scroll');
    scrollElRef.current = scrollEl;
    if (!scrollEl) return;

    const updateProgress = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      const max = scrollHeight - clientHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;
      if (progressFillRef.current) {
        gsap.to(progressFillRef.current, { scaleX: pct, duration: 0.12, ease: 'none' });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { root: scrollEl, rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );
    Object.values(sectionEls.current).forEach((el) => el && observer.observe(el));

    scrollEl.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => {
      observer.disconnect();
      scrollEl.removeEventListener('scroll', updateProgress);
    };
  }, [project]);

  useEffect(() => {
    const scrollEl = rootRef.current?.closest('.window-scroll');
    if (!scrollEl) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setHeroHeight(entry.contentRect.height);
    });
    ro.observe(scrollEl);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    storySections.forEach((s) => {
      const el = panelEls.current[s.id];
      if (!el) return;
      const isActive = activeSection === s.id;
      gsap.to(el, {
        height: isActive ? 'auto' : 0,
        opacity: isActive ? 1 : 0,
        duration: 0.35,
        ease: 'power3.out'
      });
    });
  }, [activeSection]);

  useEffect(() => {
    if (!project || !rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-reveal]', { opacity: 0, y: 24 }, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.08
      });
    }, rootRef);
    return () => ctx.revert();

  }, [project?.slug]);

  const scrollToSection = (id) => (e) => {
    e.preventDefault();
    const el = sectionEls.current[id];
    const scrollEl = scrollElRef.current;
    if (!el || !scrollEl) return;
    const top = el.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top + scrollEl.scrollTop - 16;
    scrollEl.scrollTo({ top, behavior: 'smooth' });
  };

  if (!project) {
    return (<div className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-24 text-center">
      <h1 className="font-display text-5xl italic">Project not found</h1>
      <p className="mt-4 text-[15px] text-ink/60">
        This work may have been moved or retired.
      </p>
      <div className="mt-8">
        <BigButton to="/works">
          <ArrowLeftIcon size={16} /> Back to works
        </BigButton>
      </div>
    </div>);
  }

  return (<div ref={rootRef} className="w-full">
    <div className="sticky top-0 z-30 h-0.5 w-full bg-ink/[0.06]">
      <div ref={progressFillRef} className="h-full w-full origin-left scale-x-0 bg-accent" />
    </div>

    <section
      className={`flex flex-col justify-center border-b border-ink/[0.08] px-6 py-14 sm:px-10 ${project.heroImage ? 'md:flex-row md:items-center md:gap-14' : ''}`}
      style={{ minHeight: heroHeight ? `${heroHeight}px` : '100%' }}
    >
      <div className={project.heroImage ? 'md:flex-1' : ''}>
        <p data-reveal className="eyebrow flex items-center gap-2 text-ink/50">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          {project.category} <span className="text-ink/30">/</span> {project.year}
        </p>
        <h1 data-reveal className="mt-4 font-display text-5xl italic leading-[0.95] tracking-[-0.01em] sm:text-6xl lg:text-7xl">
          {project.title}
        </h1>

        {project.heroImage &&
          <div data-reveal className="mt-6 md:hidden">
            <img
              src={project.heroImage}
              alt={project.title}
              loading="lazy"
              className="mx-auto max-h-80 w-full object-contain"
            />
          </div>}

        <p data-reveal className="mt-6 max-w-xl text-[16px] leading-relaxed text-ink/70">
          <Highlighted text={project.summary} terms={project.highlightTerms} />
        </p>

        <div data-reveal className="mt-6 flex flex-wrap gap-2">
          {project.stack.map((tool) => <span key={tool} className="rounded-full border border-ink/10 px-3 py-1.5 font-mono text-[11px] text-ink/70">
            {tool}
          </span>)}
        </div>

        <div data-reveal className="mt-8 flex flex-wrap gap-3">
          {project.liveUrl &&
            <BigButton href={project.liveUrl}>
              Visit live site <ExternalLinkIcon size={16} />
            </BigButton>}
          {project.links && project.links.map((link, i) => <BigButton key={link.url} href={link.url} tone={i === 0 ? 'solid' : 'outline'}>
            {link.label} <ExternalLinkIcon size={16} />
          </BigButton>)}
        </div>
      </div>

      {project.heroImage &&
        <div
          data-reveal
          className="hidden items-center justify-center md:flex md:w-[55%] md:shrink-0"
          style={{ height: heroHeight ? `${Math.round(heroHeight * 0.85)}px` : undefined }}
        >
          <img
            src={project.heroImage}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        </div>}
    </section>

    <div className="md:flex md:items-start">
      <aside className="sticky top-6 hidden shrink-0 self-start pb-10 pl-5 pt-10 md:block md:w-[45%] md:pr-10">
        <p className="eyebrow text-ink/40">
          On this page
        </p>
        <nav className="relative mt-3 max-w-md">
          <ul className="space-y-1">
            {tocSections.map((s) => {
              const isStory = storySections.some((story) => story.id === s.id);
              const isActive = activeSection === s.id;
              return (<li key={s.id} className={`border-l pl-4 transition-colors duration-300 ${isActive ? 'border-accent' : 'border-ink/10'}`}>
                <button
                  type="button"
                  data-toc-id={s.id}
                  onClick={scrollToSection(s.id)}
                  className={`block w-full py-2 text-left font-display text-2xl italic transition-colors ${isActive ? 'text-ink' : 'text-ink/40 hover:text-ink'}`}
                >
                  {s.label}
                </button>
                {isStory &&
                  <div ref={registerPanel(s.id)} className="h-0 overflow-hidden opacity-0">
                    <p className="pb-4 pr-2 text-[14px] leading-relaxed text-ink/65">
                      <Highlighted text={project[s.id]} terms={project.highlightTerms} />
                    </p>
                  </div>}
              </li>);
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content column */}
      <div className="min-w-0 flex-1">
        <section className="w-full px-6 py-14 sm:px-10 md:py-20">
          <div className="space-y-16 md:space-y-10">
            {imageGroups.map((s) => <div key={s.id} id={s.id} ref={registerSection(s.id)} className="scroll-mt-6">
              <h2 className="font-display text-4xl italic md:hidden">{s.label}</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink/70 md:hidden">
                <Highlighted text={project[s.id]} terms={project.highlightTerms} />
              </p>

              {s.images.length > 0 &&
                <div className="mt-6 space-y-12 md:mt-0">
                  {s.images.map((img) => <ProjectImage key={img.url} image={img} />)}
                </div>}
            </div>)}
          </div>
        </section>

      </div>
    </div>
  </div>);
}