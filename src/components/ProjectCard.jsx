import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    duration: 0.4,
    delay: index % 4 * 0.06
  }} className="h-full">

    <Link to={`/works/${project.slug}`} className="group flex h-full flex-col border-3 border-ink bg-paper shadow-pixel transition-transform duration-100 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-pixel-lg focus:outline-none focus-visible:-translate-x-[2px] focus-visible:-translate-y-[2px] focus-visible:shadow-pixel-lg">

      <div className="aspect-[16/10] w-full shrink-0 overflow-hidden border-b-3 border-ink">
        <img src={project.cover} alt={project.title} loading={index < 3 ? 'eager' : 'lazy'} decoding="async" className="pixelated h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <h3 className="font-mono text-xl leading-snug text-accent group-hover:underline focus-visible:underline">
          {project.title}
        </h3>

        <p className="font-body mt-1.5 line-clamp-2 text-sm text-ink/70">
          {project.summary}
        </p>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-2.5">
          {project.tags.slice(0, 2).map((tag) => <span key={tag} className="border border-ink/30 bg-paper px-1.5 py-0.5 font-mono text-sm max-md:text-[18px] uppercase leading-none text-ink/60">

            {tag}
          </span>)}
        </div>
      </div>
    </Link>
  </motion.article>);
}