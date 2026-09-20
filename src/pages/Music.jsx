import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  RotateCcwIcon,
  RotateCwIcon,
  RepeatIcon
} from 'lucide-react';
import { useScreenInit } from '../useScreenInit.js';
import { useIsNarrow } from '../useIsNarrow.js';
import { PixelMusicIcon } from '../components/PixelIcons';
import { tracks } from '../data/tracks';

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
      <PixelMusicIcon size={32} className="opacity-40" />
      <p className="font-body text-base text-ink/60">
        Drop audio files into <code>public/music</code> and list them in{' '}
        <code>src/data/tracks.js</code>.
      </p>
    </div>);
  }

  if (isNarrow) {
    return (<div className="flex h-full flex-col gap-6 p-6">
      <p className="shrink-0 text-center font-mono text-lg uppercase tracking-[0.2em] text-ink/40">
        Now Playing
      </p>

      {/* Cover art */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <motion.div animate={{
          rotate: isPlaying ? 360 : 0
        }} transition={{
          repeat: isPlaying ? Infinity : 0,
          duration: 6,
          ease: 'linear'
        }} className="grid aspect-square w-full max-w-[260px] shrink-0 place-items-center border-3 border-ink bg-accent-2 shadow-pixel-lg">

          <PixelMusicIcon size={64} />
        </motion.div>

        <div className="w-full max-w-[260px] text-center">
          <p className="truncate font-mono text-lg leading-relaxed">
            {track.title}
          </p>
          {track.artist &&
            <p className="mt-1.5 truncate font-mono text-lg text-ink/50">
              {track.artist}
            </p>}
        </div>
      </div>

      {/* Scrub bar */}
      <div className="shrink-0">
        <input type="range" min={0} max={duration || 0} step={0.1} value={Math.min(currentTime, duration || 0)} onChange={handleScrub} aria-label="Seek" className="w-full accent-[var(--accent)]" />

        <div className="mt-1 flex justify-between font-mono text-lg text-ink/50">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Primary transport: big, Spotify-style center play button */}
      <div className="flex shrink-0 items-center justify-center gap-6">
        <button onClick={handlePrev} aria-label="Previous track" className="grid h-11 w-11 place-items-center border-2 border-ink bg-paper hover:bg-accent-2/40 active:translate-y-0.5">

          <SkipBackIcon size={18} />
        </button>
        <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} className="grid h-16 w-16 place-items-center rounded-full border-2 border-ink bg-accent text-paper shadow-pixel-lg transition-transform active:translate-y-0.5 active:shadow-pixel">

          {isPlaying ? <PauseIcon size={26} /> : <PlayIcon size={26} className="ml-0.5" />}
        </button>
        <button onClick={handleNext} aria-label="Next track" className="grid h-11 w-11 place-items-center border-2 border-ink bg-paper hover:bg-accent-2/40 active:translate-y-0.5">

          <SkipForwardIcon size={18} />
        </button>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-6">
        <button onClick={() => seekBy(-10)} aria-label="Rewind 10 seconds" className="grid h-11 w-11 place-items-center text-ink/60 hover:text-ink active:translate-y-0.5">

          <RotateCcwIcon size={16} />
        </button>
        <button onClick={() => setIsLooping((v) => !v)} aria-pressed={isLooping} aria-label="Toggle loop" className={`grid h-11 w-11 place-items-center border-2 border-ink transition-colors ${isLooping ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-accent-2/40'}`}>

          <RepeatIcon size={15} />
        </button>
        <button onClick={() => seekBy(10)} aria-label="Forward 10 seconds" className="grid h-11 w-11 place-items-center text-ink/60 hover:text-ink active:translate-y-0.5">

          <RotateCwIcon size={16} />
        </button>
      </div>

      <audio ref={audioRef} src={track.src} preload="metadata" onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} onEnded={handleEnded} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />

    </div>);
  }

  return (<div className="mx-auto flex h-full w-full max-w-sm flex-col justify-center gap-4 p-4">
    {/* Icon + title + loop */}
    <div className="flex items-center gap-3">
      <div className="grid h-14 w-14 shrink-0 place-items-center border-3 border-ink bg-accent-2 shadow-pixel">
        <motion.div animate={{
          rotate: isPlaying ? 360 : 0
        }} transition={{
          repeat: isPlaying ? Infinity : 0,
          duration: 4,
          ease: 'linear'
        }}>

          <PixelMusicIcon size={32} />
        </motion.div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-sm leading-relaxed">
          {track.title}
        </p>
        {track.artist &&
          <p className="truncate font-mono text-sm text-ink/50">
            {track.artist}
          </p>}
      </div>
      <button onClick={() => setIsLooping((v) => !v)} aria-pressed={isLooping} aria-label="Toggle loop" className={`grid h-8 w-8 shrink-0 place-items-center border-2 border-ink transition-colors ${isLooping ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-accent-2/40'}`}>

        <RepeatIcon size={13} />
      </button>
    </div>

    {/* Scrub bar */}
    <div>
      <input type="range" min={0} max={duration || 0} step={0.1} value={Math.min(currentTime, duration || 0)} onChange={handleScrub} aria-label="Seek" className="w-full accent-[var(--accent)]" />

      <div className="mt-1 flex justify-between font-mono text-xs text-ink/50">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>

    {/* Transport */}
    <div className="flex items-center justify-center gap-2">
      <button onClick={handlePrev} aria-label="Previous track" className="grid h-8 w-8 place-items-center border-2 border-ink bg-paper hover:bg-accent-2/40 active:translate-y-0.5">

        <SkipBackIcon size={14} />
      </button>
      <button onClick={() => seekBy(-10)} aria-label="Rewind 10 seconds" className="grid h-8 w-8 place-items-center border-2 border-ink bg-paper hover:bg-accent-2/40 active:translate-y-0.5">

        <RotateCcwIcon size={14} />
      </button>
      <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} className="grid h-11 w-11 place-items-center border-2 border-ink bg-accent text-paper shadow-pixel transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none">

        {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
      </button>
      <button onClick={() => seekBy(10)} aria-label="Forward 10 seconds" className="grid h-8 w-8 place-items-center border-2 border-ink bg-paper hover:bg-accent-2/40 active:translate-y-0.5">

        <RotateCwIcon size={14} />
      </button>
      <button onClick={handleNext} aria-label="Next track" className="grid h-8 w-8 place-items-center border-2 border-ink bg-paper hover:bg-accent-2/40 active:translate-y-0.5">

        <SkipForwardIcon size={14} />
      </button>
    </div>

    <audio ref={audioRef} src={track.src} preload="metadata" onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} onEnded={handleEnded} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />

  </div>);
}