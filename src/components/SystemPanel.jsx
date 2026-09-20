import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CoffeeIcon, HeartIcon, SparklesIcon, ZapIcon } from 'lucide-react';

const stats = [
  { label: 'Caffeine', value: 92, icon: CoffeeIcon, color: 'bg-accent' },
  { label: 'Pixel Precision', value: 99, icon: SparklesIcon, color: 'bg-accent-2' },
  { label: 'Ship Velocity', value: 78, icon: ZapIcon, color: 'bg-mint' },
  { label: 'Enthusiasm', value: 100, icon: HeartIcon, color: 'bg-lilac' }
];

export function SystemPanel() {
  const rootRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const bars = root.querySelectorAll('[data-bar]');
    const nums = root.querySelectorAll('[data-num]');
    const ctx = gsap.context(() => {
      gsap.fromTo(bars, { scaleX: 0 }, {
        scaleX: 1,
        transformOrigin: 'left center',
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08
      });
      nums.forEach((el) => {
        const target = Number(el.dataset.num ?? 0);
        const counter = { v: 0 };
        gsap.to(counter, {
          v: target,
          duration: 0.9,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = String(Math.round(counter.v));
          }
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (<div ref={rootRef} className="p-5">
    <h2 className="font-mono text-sm">Task Manager</h2>
    <p className="font-body mt-2 text-[20px] text-ink/60">
      Live readout of the developer process.
    </p>

    <dl className="mt-6 space-y-4">
      {stats.map((stat) => <div key={stat.label} className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center bevel bg-paper text-ink">
          <stat.icon size={16} strokeWidth={2.5} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <dt className="font-mono text-lg uppercase">{stat.label}</dt>
            <dd className="font-mono text-[11px]">
              <span data-num={stat.value}>0</span>
              <span className="text-ink/40">/100</span>
            </dd>
          </div>
          <div className="mt-1.5 bevel-in h-4 bg-paper p-0.5">
            <div data-bar className={`h-full ${stat.color}`} style={{ width: `${stat.value}%` }} />

          </div>
        </div>
      </div>)}
    </dl>

    <div className="mt-6 bevel-in bg-paper p-3 font-mono text-lg leading-relaxed">
      <p className="uppercase text-ink/50">Uptime</p>
      <p>8 years designing &amp; shipping software.</p>
      <p className="mt-2 uppercase text-ink/50">Status</p>
      <p className="text-accent">◆ Available for new projects</p>
    </div>
  </div>);
}