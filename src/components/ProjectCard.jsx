import React, { useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { reducedMotion } from '../motion';
export function ProjectCard({ project, index = 0 }) {
  const cardRef = useRef(null);
  const imgRef = useRef(null);

  /* The card tilts toward the pointer like a print held up to the light,
     and the cover drifts the other way for a touch of depth. */
  const onMove = (e) => {
    if (reducedMotion()) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(cardRef.current, { rotateY: px * 8, rotateX: -py * 8, y: -4, transformPerspective: 800, duration: 0.4, ease: 'power2.out' });
    gsap.to(imgRef.current, { x: -px * 10, y: -py * 10, scale: 1.08, duration: 0.5, ease: 'power2.out' });
  };
  const onLeave = () => {
    gsap.to(cardRef.current, { rotateY: 0, rotateX: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
    gsap.to(imgRef.current, { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' });
  };

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
    duration: 0.6,
    ease: [0.34, 1.56, 0.64, 1],
    delay: index % 4 * 0.08
  }} className="h-full">

    <Link ref={cardRef} onPointerMove={onMove} onPointerLeave={onLeave} to={`/works/${project.slug}`} className="group flex h-full flex-col bevel bg-paper hover:shadow-pixel-sm focus:outline-none focus-visible:shadow-pixel-sm">

      <div className="aspect-[16/10] w-full shrink-0 overflow-hidden border-b-3 border-ink">
        <img ref={imgRef} src={project.cover} alt={project.title} loading={index < 3 ? 'eager' : 'lazy'} decoding="async" className="pixelated h-full w-full object-cover" />
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