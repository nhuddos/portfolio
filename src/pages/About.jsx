import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  SettingsIcon,
  BriefcaseIcon,
  UserIcon,
  MailIcon,
  SmileIcon,
  ImageIcon,
  SendIcon,
  ArrowLeftIcon
} from 'lucide-react';
import { useScreenInit } from '../useScreenInit.js';
import { CONTACT_LINKS, resolveLogoSrc } from '../data/contactLinks.js';
import { asset } from '../assetUrl.js';

const toolGroups = [
  {
    label: 'Design',
    items: [
      { name: 'Figma', logos: ['/images/logo/figma.webp'] },
      { name: 'Procreate', logos: ['/images/logo/procreate.avif'] },
      { name: 'Adobe Illustrator', logos: ['/images/logo/adobe-illustrator.webp'] },
      { name: 'Adobe Photoshop', logos: ['/images/logo/adobe-photoshop.webp'] },
      { name: 'Miro', logos: ['/images/logo/miro.webp'] }
    ]
  },
  {
    label: 'Development',
    items: [
      { name: 'React JS', logos: ['/images/logo/react.webp'] },
      { name: 'PHP', logos: ['/images/logo/php.svg'] },
      { name: 'Vite', logos: ['/images/logo/vite.svg'] },
      { name: 'HTML/CSS/JS', logos: ['html5', 'css', 'javascript'] },
      { name: 'GitHub', logos: ['github'] },
      { name: 'Creative Coding', logos: ['/images/logo/p5js.webp'] }
    ]
  },
  {
    label: 'Motion',
    items: [
      { name: 'Adobe After Effects', logos: ['/images/logo/after-effects.webp'] }
    ]
  }
];

const timeline = [
  {
    year: '2024',
    title: 'DEVINE Student',
    place: 'Howest University of Applied Sciences',
    desc: 'Two years into the Digital Experience Design (DEVINE) program, building fluency across branding, UX/UI and front-end development.'
  },
  {
    year: '2024',
    title: 'Head Designer',
    place: 'The Cosmos \u2014 Club for International Languages',
    desc: 'Two years leading design for this student-run non-profit connecting people through language exchange.'
  },
  {
    year: '2024',
    title: 'Collaborator',
    place: 'VNXK \u2014 Music Club',
    desc: 'Two years working with this non-profit music club.'
  }
];

const rooms = [
  {
    id: 'khanh',
    label: 'Khanh Do',
    subtitle: 'Visual Designer',
    time: '20m',
    preview: '',
    icon: UserIcon,
    color: 'bg-mint'
  },
  {
    id: 'tools',
    label: 'My tools',
    subtitle: 'what\u2019s usually open on my machine',
    time: '5m',
    preview: '',
    icon: SettingsIcon,
    color: 'bg-accent-2'
  },
  {
    id: 'experience',
    label: 'My experience',
    subtitle: 'the paper trail',
    time: '3d',
    preview: '',
    icon: BriefcaseIcon,
    color: 'bg-sky'
  }
];

const toneClasses = {
  paper: 'bg-paper text-ink',
  mint: 'bg-mint/20 text-ink',
  accent2: 'bg-accent-2/25 text-ink',
  sky: 'bg-sky/30 text-ink'
};

const typingFor = (text) => Math.min(2200, Math.max(700, text.replace(/\*\*/g, '').length * 14));

const khanhTexts = [
  "hey i'm khanh! i'm a **caffeine-driven digital designer** who loves **visual storytelling** and building immersive experiences across web, motion, and print. i'm in my 3rd year of **DEVINE** (digital design and development) at Howest.",
  "i've always been drawn to **art in all its forms**: animation, illustration, photography, music.",
  "but what pulled me into design was making things that look good and also work well. i love taking an idea and turning it into something people can actually interact with and enjoy. right now i'm looking for a **design internship** starting **february 2027**."
];

const roomMessages = {
  khanh: [
    { id: 'k-photo', kind: 'photo', src: asset('/images/khanhdo.webp'), alt: 'Khanh Do', typing: 700 },
    ...khanhTexts.map((text, i) => ({ id: `k-${i}`, kind: 'text', text, typing: typingFor(text) }))
  ],
  tools: toolGroups.map((group) => ({ id: `t-${group.label}`, kind: 'tools', group, typing: 900 })),
  experience: timeline.map((item, i) => ({ id: `e-${i}`, kind: 'experience', item, typing: 1200 }))
};

const clockTime = () =>
  new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function RoomAvatar({ room, size = 'md' }) {
  const dims = size === 'lg' ? 'h-11 w-11' : 'h-10 w-10';
  const Icon = room.icon;
  return (
    <span className={`bevel grid shrink-0 place-items-center ${room.color} text-ink ${dims}`}>
      <Icon size={size === 'lg' ? 18 : 16} strokeWidth={2.5} />
    </span>
  );
}

function Pop({ animate, children }) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 12, scale: 0.96 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{ transformOrigin: 'bottom left' }}
      className="flex justify-start"
    >
      {children}
    </motion.div>
  );
}

function Bubble({ time, tone = 'paper', wide = false, animate, children }) {
  return (
    <Pop animate={animate}>
      <div className={`max-w-[88%] ${wide ? 'sm:max-w-lg' : 'sm:max-w-md'}`}>
        <div className={`border-2 border-ink px-4 py-3 shadow-pixel ${toneClasses[tone]}`}>
          {children}
        </div>
        <div className="mt-1.5 font-mono text-sm max-md:text-[18px] uppercase text-ink/40">{time}</div>
      </div>
    </Pop>
  );
}

function PhotoBubble({ src, alt, time, animate }) {
  return (
    <Pop animate={animate}>
      <div className="max-w-[70%] sm:max-w-xs">
        <div
          className="overflow-hidden border-2 border-ink shadow-pixel"
          style={{ background: 'linear-gradient(160deg, var(--checker-a), var(--checker-b))' }}
        >
          <img src={src} alt={alt} className="pixelated w-full object-cover" />
        </div>
        <div className="mt-1.5 font-mono text-sm max-md:text-[18px] uppercase text-ink/40">{time}</div>
      </div>
    </Pop>
  );
}

function TypingBubble({ name }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="flex justify-start"
      role="status"
      aria-label={`${name} is typing`}
    >
      <div className="flex items-center gap-1.5 border-2 border-ink bg-paper px-4 py-3.5 shadow-pixel">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 bg-ink"
            style={{ animation: 'blink 1s steps(1) infinite', animationDelay: `${-i * 0.25}s` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function Highlighted({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <mark key={i} className="bg-accent-2 px-1 text-ink">
        {part.slice(2, -2)}
      </mark>
    ) : (
      part
    )
  );
}

function ChatMessage({ msg, time, animate }) {
  switch (msg.kind) {
    case 'photo':
      return <PhotoBubble src={msg.src} alt={msg.alt} time={time} animate={animate} />;
    case 'text':
      return (
        <Bubble time={time} animate={animate}>
          <p className="font-body text-[16px] leading-relaxed">
            <Highlighted text={msg.text} />
          </p>
        </Bubble>
      );
    case 'tools':
      return (
        <Bubble time={time} tone="accent2" animate={animate}>
          <p className="mb-2 font-mono text-sm max-md:text-[18px] uppercase tracking-wide text-ink/50">
            {msg.group.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {msg.group.items.map((tool) => (
              <span
                key={tool.name}
                className="flex items-center gap-1.5 border border-ink/30 bg-paper px-2.5 py-1 font-mono text-sm max-md:text-[18px] uppercase text-ink"
              >
                <span className="flex shrink-0 items-center gap-0.5">
                  {tool.logos.map((entry) => (
                    <img
                      key={entry}
                      src={resolveLogoSrc(entry)}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="h-4 w-4 shrink-0 rounded-sm object-contain"
                    />
                  ))}
                </span>
                {tool.name}
              </span>
            ))}
          </div>
        </Bubble>
      );
    case 'experience':
      return (
        <Bubble time={time} tone="sky" wide animate={animate}>
          <div className="flex items-start gap-3">
            <span className="shrink-0 border border-ink/30 bg-paper px-2 py-0.5 font-mono text-base max-md:text-[18px] leading-none">
              {msg.item.year}
            </span>
            <div className="min-w-0">
              <p className="font-mono text-lg leading-snug">{msg.item.title}</p>
              <p className="mt-1 font-mono text-sm max-md:text-[18px] uppercase text-ink/50">{msg.item.place}</p>
              <p className="mt-1.5 font-body text-[15px] leading-relaxed text-ink/80">
                {msg.item.desc}
              </p>
            </div>
          </div>
        </Bubble>
      );
    default:
      return null;
  }
}

function Conversation({ room, progressRef, onTyping }) {
  const messages = roomMessages[room.id];
  const saved = progressRef.current[room.id];

  const [count, setCount] = useState(saved?.count ?? 0);
  const [times, setTimes] = useState(saved?.times ?? []);
  const [typing, setTyping] = useState(false);

  const initialCount = useRef(saved?.count ?? 0).current;
  const reduced = useRef(prefersReducedMotion()).current;
  const scrollRef = useRef(null);
  const firstScroll = useRef(true);

  useEffect(() => {
    if (count >= messages.length) return undefined;

    if (reduced) {
      const stamp = clockTime();
      setTimes((t) => [...t, ...messages.slice(t.length).map(() => stamp)]);
      setCount(messages.length);
      return undefined;
    }

    const lead = count === 0 ? 600 : 400;
    const showTyping = setTimeout(() => setTyping(true), lead);
    const deliver = setTimeout(() => {
      setTyping(false);
      setTimes((t) => [...t, clockTime()]);
      setCount((c) => c + 1);
    }, lead + messages[count].typing);

    return () => {
      clearTimeout(showTyping);
      clearTimeout(deliver);
      setTyping(false);
    };
  }, [count, messages, reduced]);

  useEffect(() => {
    progressRef.current[room.id] = { count, times };
  }, [room.id, count, times, progressRef]);

  useEffect(() => {
    onTyping(typing);
  }, [typing, onTyping]);
  useEffect(() => () => onTyping(false), [onTyping]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const behavior = firstScroll.current || reduced ? 'auto' : 'smooth';
    firstScroll.current = false;
    const id = requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior }));
    return () => cancelAnimationFrame(id);
  }, [count, typing, reduced]);

  return (
    <div
      ref={scrollRef}
      className="window-scroll min-h-0 flex-1 space-y-4 overflow-y-auto bg-sky/10 px-4 py-6 sm:px-6"
    >
      <div className="flex justify-center">
        <span className="border border-ink/30 bg-paper px-2.5 py-0.5 font-mono text-sm max-md:text-[18px] uppercase text-ink/50">
          Today
        </span>
      </div>

      {messages.slice(0, count).map((msg, i) => (
        <ChatMessage key={msg.id} msg={msg} time={times[i]} animate={i >= initialCount} />
      ))}

      {typing && <TypingBubble name={room.label} />}
    </div>
  );
}

export function About() {
  useScreenInit();
  const [activeId, setActiveId] = useState('khanh');
  const [isTyping, setIsTyping] = useState(false);
  const progressRef = useRef({});
  const [mobileView, setMobileView] = useState('list');
  const activeRoom = rooms.find((r) => r.id === activeId) ?? rooms[0];

  const selectRoom = (id) => {
    setActiveId(id);
    setMobileView('chat');
  };

  return (
    <div className="flex h-full min-h-0">
      <aside
        className={`${mobileView === 'chat' ? 'hidden' : 'flex'} w-full shrink-0 flex-col border-r-2 border-ink bg-paper sm:flex sm:w-64`}
      >
        <div className="shrink-0 border-b-2 border-ink px-3 py-2.5 sm:px-4 sm:py-3">
          <p className="font-mono text-[24px] uppercase leading-none">Chats</p>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="Chatrooms">
          {rooms.map((room) => {
            const isActive = room.id === activeRoom.id;
            return (
              <button
                key={room.id}
                onClick={() => selectRoom(room.id)}
                aria-current={isActive}
                className={`flex w-full items-center gap-2.5 border-b-2 border-ink/10 px-3 py-3 text-left sm:gap-3 sm:px-4 ${isActive ? 'bg-accent-2/40' : 'hover:bg-accent-2/15'}`}
              >
                <RoomAvatar room={room} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate font-mono text-xl leading-none">{room.label}</p>
                    <span className="shrink-0 font-mono text-sm max-md:text-[18px] text-ink/40">{room.time}</span>
                  </div>
                  <p className="mt-1.5 hidden truncate font-mono text-sm max-md:text-[18px] text-ink/50 sm:block">
                    {room.preview}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      <div
        className={`${mobileView === 'list' ? 'hidden' : 'flex'} min-w-0 flex-1 flex-col sm:flex`}
      >
        <div className="flex shrink-0 items-center gap-3 border-b-2 border-ink bg-paper px-4 py-3 sm:px-5">
          <button
            onClick={() => setMobileView('list')}
            aria-label="Back to chats"
            className="grid h-9 w-9 shrink-0 place-items-center border-2 border-ink bg-paper text-ink hover:bg-accent hover:text-paper sm:hidden"
          >
            <ArrowLeftIcon size={16} />
          </button>
          <RoomAvatar room={activeRoom} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-xl leading-none">{activeRoom.label}</p>
            <p className="mt-1.5 truncate font-mono text-sm max-md:text-[18px] uppercase leading-none text-ink/50">
              {isTyping ? 'typing...' : activeRoom.subtitle}
            </p>
          </div>
          <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
            {CONTACT_LINKS.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                className="grid h-9 w-9 place-items-center border-2 border-ink bg-paper text-ink hover:bg-accent hover:text-paper"
              >
                {link.icon === 'mail' ? (
                  <MailIcon size={15} />
                ) : (
                  <img
                    src={resolveLogoSrc(link.logo)}
                    alt=""
                    aria-hidden="true"
                    className="h-3.5 w-3.5 object-contain"
                  />
                )}
              </a>
            ))}
          </div>
        </div>

        <Conversation
          key={activeRoom.id}
          room={activeRoom}
          progressRef={progressRef}
          onTyping={setIsTyping}
        />

        <div className="shrink-0 border-t-2 border-ink bg-paper px-3 py-3 sm:px-4">
          <div className="flex cursor-not-allowed items-center gap-2 bevel-in bg-paper px-3 py-2">
            <SmileIcon size={16} className="shrink-0 text-ink/40" aria-hidden />
            <input
              type="text"
              value=""
              readOnly
              disabled
              tabIndex={-1}
              placeholder={`Message ${activeRoom.label}...`}
              aria-label="This conversation is read-only"
              className="min-w-0 flex-1 cursor-not-allowed bg-transparent font-mono text-base max-md:text-[18px] text-ink placeholder:text-ink/40 focus:outline-none disabled:opacity-100"
            />
            <ImageIcon size={16} className="shrink-0 text-ink/40" aria-hidden />
            <button
              type="button"
              disabled
              tabIndex={-1}
              aria-label="This conversation is read-only"
              className="grid h-8 w-8 shrink-0 cursor-not-allowed place-items-center border-2 border-ink bg-accent text-paper disabled:opacity-100"
            >
              <SendIcon size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}