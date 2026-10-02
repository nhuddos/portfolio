import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  RotateCcwIcon,
  RotateCwIcon,
  RepeatIcon,
  DiscIcon
} from 'lucide-react';
import { useScreenInit } from '../useScreenInit.js';
import { useIsNarrow } from '../useIsNarrow.js';
import { tracks } from '../data/tracks';

/* A vinyl record: fine grooves, a sheen, and an accent label in the middle. */
function Vinyl({ spinning, className = '' }) {
  return (
    <motion.div
      animate={{ rotate: spinning ? 360 : 0 }}
      transition={{ repeat: spinning ? Infinity : 0, duration: 5, ease: 'linear' }}
      className={`relative aspect-square shrink-0 rounded-full shadow-float ${className}`}
      style={{
        background: `conic-gradient(from 30deg, rgb(255 255 255 / 0.10), transparent 15%, transparent 35%, rgb(255 255 255 / 0.10) 50%, transparent 65%, transparent 85%, rgb(255 255 255 / 0.10)),
          repeating-radial-gradient(circle, #141218 0 1px, #1d1a22 1px 3px)`
      }}
      aria-hidden="true"
    >
      <div className="absolute inset-[32%] grid place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2">
        <span className="h-[14%] w-[14%] rounded-full bg-paper" />
      </div>
    </motion.div>
  );
}

const iconBtn = 'grid place-items-center rounded-full text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink active:scale-95';

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function Music() {
  useScreenInit();
  const isNarrow = useIsNarrow();
  const audioRef = useRef(null);
  const hasTracks = tracks.length > 0;

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const track = hasTracks ? tracks[index] : null;

  // Keep the <audio> element's native loop attribute in sync with our toggle.
  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = isLooping;
  }, [isLooping]);

  // Whenever the track changes, load the new source and (if we were
  // already playing) keep playback going without the user re-pressing play.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hasTracks) return;
    setCurrentTime(0);
    setDuration(0);
    audio.load();
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const goTo = (nextIndex, autoplay) => {
    const total = tracks.length;
    const wrapped = ((nextIndex % total) + total) % total;
    setIsPlaying(autoplay);
    setIndex(wrapped);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const seekBy = (delta) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(Math.max(audio.currentTime + delta, 0), audio.duration);
  };

  const handleNext = () => goTo(index + 1, isPlaying);

  const handlePrev = () => {
    const audio = audioRef.current;
    // Like most players: past the first few seconds, "previous" restarts
    // the current track; right at the start, it actually goes back one.
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    goTo(index - 1, isPlaying);
  };

  const handleEnded = () => {
    if (isLooping) return; // native loop already handles this
    goTo(index + 1, true);
  };

  const handleScrub = (e) => {
    const audio = audioRef.current;
    const value = Number(e.target.value);
    if (audio) audio.currentTime = value;
    setCurrentTime(value);
  };

  if (!hasTracks) {
    return (<div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <DiscIcon size={32} strokeWidth={1.5} className="opacity-40" />
      <p className="text-[14px] text-ink/60">
        Drop audio files into <code>public/music</code> and list them in{' '}
        <code>src/data/tracks.js</code>.
      </p>
    </div>);
  }

  if (isNarrow) {
    return (<div className="flex h-full flex-col gap-6 p-6">
      <p className="eyebrow shrink-0 text-center text-ink/45">
        Now playing
      </p>

      {/* Cover art */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <Vinyl spinning={isPlaying} className="w-full max-w-[240px]" />

        <div className="w-full max-w-[260px] text-center">
          <p className="truncate font-display text-3xl italic leading-tight">
            {track.title}
          </p>
          {track.artist &&
            <p className="mt-1 truncate text-[14px] text-ink/50">
              {track.artist}
            </p>}
        </div>
      </div>

      {/* Scrub bar */}
      <div className="shrink-0">
        <input type="range" min={0} max={duration || 0} step={0.1} value={Math.min(currentTime, duration || 0)} onChange={handleScrub} aria-label="Seek" className="w-full accent-[var(--accent)]" />

        <div className="mt-1 flex justify-between font-mono text-[11px] tabular-nums text-ink/45">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Primary transport */}
      <div className="flex shrink-0 items-center justify-center gap-6">
        <button onClick={handlePrev} aria-label="Previous track" className={`${iconBtn} h-11 w-11`}>
          <SkipBackIcon size={20} strokeWidth={1.75} />
        </button>
        <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} className="grid h-16 w-16 place-items-center rounded-full bg-ink text-paper shadow-float transition-transform active:scale-95">
          {isPlaying ? <PauseIcon size={24} strokeWidth={1.75} /> : <PlayIcon size={24} strokeWidth={1.75} className="ml-0.5" />}
        </button>
        <button onClick={handleNext} aria-label="Next track" className={`${iconBtn} h-11 w-11`}>
          <SkipForwardIcon size={20} strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-6">
        <button onClick={() => seekBy(-10)} aria-label="Rewind 10 seconds" className={`${iconBtn} h-11 w-11`}>
          <RotateCcwIcon size={16} strokeWidth={1.75} />
        </button>
        <button onClick={() => setIsLooping((v) => !v)} aria-pressed={isLooping} aria-label="Toggle loop" className={`grid h-11 w-11 place-items-center rounded-full transition-colors ${isLooping ? 'bg-accent text-on-accent' : 'text-ink/70 hover:bg-ink/5'}`}>
          <RepeatIcon size={16} strokeWidth={1.75} />
        </button>
        <button onClick={() => seekBy(10)} aria-label="Forward 10 seconds" className={`${iconBtn} h-11 w-11`}>
          <RotateCwIcon size={16} strokeWidth={1.75} />
        </button>
      </div>

      <audio ref={audioRef} src={track.src} preload="metadata" onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} onEnded={handleEnded} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />

    </div>);
  }

  return (<div className="mx-auto flex h-full w-full max-w-sm flex-col justify-center gap-5 p-5">
    {/* Record + title + loop */}
    <div className="flex items-center gap-4">
      <Vinyl spinning={isPlaying} className="w-16" />
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-ink/40">Now playing</p>
        <p className="mt-1.5 truncate font-display text-2xl italic leading-tight">
          {track.title}
        </p>
        {track.artist &&
          <p className="truncate text-[12px] text-ink/50">
            {track.artist}
          </p>}
      </div>
      <button onClick={() => setIsLooping((v) => !v)} aria-pressed={isLooping} aria-label="Toggle loop" className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${isLooping ? 'bg-accent text-on-accent' : 'text-ink/60 hover:bg-ink/5'}`}>
        <RepeatIcon size={14} strokeWidth={1.75} />
      </button>
    </div>

    {/* Scrub bar */}
    <div>
      <input type="range" min={0} max={duration || 0} step={0.1} value={Math.min(currentTime, duration || 0)} onChange={handleScrub} aria-label="Seek" className="w-full accent-[var(--accent)]" />

      <div className="mt-1 flex justify-between font-mono text-[10px] tabular-nums text-ink/45">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>

    {/* Transport */}
    <div className="flex items-center justify-center gap-1.5">
      <button onClick={handlePrev} aria-label="Previous track" className={`${iconBtn} h-9 w-9`}>
        <SkipBackIcon size={16} strokeWidth={1.75} />
      </button>
      <button onClick={() => seekBy(-10)} aria-label="Rewind 10 seconds" className={`${iconBtn} h-9 w-9`}>
        <RotateCcwIcon size={15} strokeWidth={1.75} />
      </button>
      <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} className="mx-1 grid h-12 w-12 place-items-center rounded-full bg-ink text-paper shadow-soft transition-transform hover:scale-105 active:scale-95">
        {isPlaying ? <PauseIcon size={18} strokeWidth={1.75} /> : <PlayIcon size={18} strokeWidth={1.75} className="ml-0.5" />}
      </button>
      <button onClick={() => seekBy(10)} aria-label="Forward 10 seconds" className={`${iconBtn} h-9 w-9`}>
        <RotateCwIcon size={15} strokeWidth={1.75} />
      </button>
      <button onClick={handleNext} aria-label="Next track" className={`${iconBtn} h-9 w-9`}>
        <SkipForwardIcon size={16} strokeWidth={1.75} />
      </button>
    </div>

    <audio ref={audioRef} src={track.src} preload="metadata" onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} onEnded={handleEnded} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />

  </div>);
}