import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { stepEase } from '../motion';

export function ProjectCard({ project, index = 0 }) {
  /* Cards wipe in top-to-bottom in hard steps as they scroll into view,
     and lift off the page with a hard shadow on hover. */
  return (<motion.article initial={{
    clipPath: 'inset(0% 0% 100% 0%)'
  }} whileInView={{
    clipPath: 'inset(0% 0% 0% 0%)'
  }} viewport={{
    once: true,
    margin: '-40px'
  }} transition={{
    duration: 0.36,
    ease: stepEase(6),
    delay: index % 3 * 0.08
  }} className="h-full">

    <Link to={`/works/${project.slug}`} className="group flex h-full flex-col overflow-hidden bevel bg-paper transition-[transform,box-shadow] duration-150 [transition-timing-function:steps(2)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-pixel focus:outline-none focus-visible:-translate-x-1 focus-visible:-translate-y-1 focus-visible:shadow-pixel">

      <div className="aspect-[16/10] w-full shrink-0 overflow-hidden border-b-2 border-ink">
        <img src={project.cover} alt={project.title} loading={index < 3 ? 'eager' : 'lazy'} decoding="async" className="pixelated h-full w-full object-cover" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <h3 className="font-mono text-xl leading-snug text-ink underline-offset-4 group-hover:text-lilac group-hover:underline">
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