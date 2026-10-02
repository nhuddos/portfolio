import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon } from 'lucide-react';
export function ProjectCard({ project, index = 0 }) {
  return (<motion.article initial={{
    opacity: 0,
    y: 24
  }} whileInView={{
    opacity: 1,
    y: 0
  }} viewport={{
    once: true,
    margin: '-40px'
  }} transition={{
    duration: 0.7,
    ease: [0.16, 1, 0.3, 1],
    delay: index % 4 * 0.06
  }} className="h-full">

    <Link to={`/works/${project.slug}`} className="group flex h-full flex-col focus:outline-none">

      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl border border-ink/[0.08] bg-ink/[0.04] transition-shadow duration-500 group-hover:shadow-float group-focus-visible:ring-2 group-focus-visible:ring-accent">
        <img src={project.cover} alt={project.title} loading={index < 3 ? 'eager' : 'lazy'} decoding="async" className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]" />
        <span className="eyebrow absolute left-3 top-3 rounded-full bg-paper/85 px-2.5 py-1.5 text-ink/70 backdrop-blur">
          {project.category}
        </span>
        <span className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-paper text-ink opacity-0 shadow-soft transition-all duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRightIcon size={16} strokeWidth={1.75} />
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-1 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[17px] font-medium leading-snug tracking-[-0.01em] text-ink">
            {project.title}
          </h3>
          <span className="shrink-0 font-mono text-[11px] text-ink/40">{project.year}</span>
        </div>

        <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-ink/60">
          {project.summary}
        </p>

        <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-3">
          {project.tags.slice(0, 3).map((tag) => <span key={tag} className="eyebrow text-ink/40">

            {tag}
          </span>)}
        </div>
      </div>
    </Link>
  </motion.article>);
}