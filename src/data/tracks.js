// src/data/tracks.js
//
// The Music tab plays whatever is listed here. To add a song:
//   1. Drop the audio file into `public/music/` (e.g. public/music/discipline-mix.mp4).
//   2. Add an entry below with a matching `src` path.
//
// `src` is served straight from the public folder, so it always starts
// with `/music/...` — no `import`, no bundler involvement.
//
// Note on file types: the <audio> element in Music.jsx can play .mp3,
// .wav, .ogg, .m4a, and audio-only .mp4 files (an .mp4 that contains an
// AAC audio track, which is what most "voice memo" / phone recordings
// export as). If a .mp4 has no video track, it just plays like a song —
// nothing extra to do. If you have real video files, this player will
// still play the audio, but it won't show any video.
export const tracks = [
  {
    id: 'track-1',
    title: 'for u',
    artist: 'ICZBEATS',
    src: '/music/foryou.mp3'
  },
  {
    id: 'track-2',
    title: 'a clearing color parade',
    artist: 'unknown',
    src: '/music/aclearingcolorparade.mp3'
  },
  {
    id: 'track-3',
    title: 'dreams of you',
    artist: 'ICZBEATS',
    src: '/music/dreamsofyou.mp3'
  },
  {
    id: 'track-4',
    title: 'apricity',
    artist: 'unknown',
    src: '/music/apricity.mp3'
  },
  {
    id: 'track-5',
    title: 'i find peace in your eyes',
    artist: 'ICZBEATS',
    src: '/music/peace.mp3'
  },
  {
    id: 'track-6',
    title: 'cozy places',
    artist: 'yokonap',
    src: '/music/cozyplaces.mp3'
  }
];
