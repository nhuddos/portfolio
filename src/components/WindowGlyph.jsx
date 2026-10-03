import React from 'react';

/* 7x7 pixel glyphs for window controls, drawn on a grid so they stay crisp. */
const GLYPHS = {
  close: [[0, 0], [6, 0], [1, 1], [5, 1], [2, 2], [4, 2], [3, 3], [2, 4], [4, 4], [1, 5], [5, 5], [0, 6], [6, 6]],
  minimize: [[1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6]],
  maximize: [
    ...[0, 1, 2, 3, 4, 5, 6].flatMap((x) => [[x, 0], [x, 1], [x, 6]]),
    ...[2, 3, 4, 5].flatMap((y) => [[0, y], [6, y]])
  ],
  restore: [
    ...[2, 3, 4, 5, 6].flatMap((x) => [[x, 0]]),
    [6, 1], [6, 2], [6, 3],
    ...[0, 1, 2, 3, 4].flatMap((x) => [[x, 2], [x, 6]]),
    ...[3, 4, 5].flatMap((y) => [[0, y], [4, y]]),
    [2, 1]
  ]
};

export function WindowGlyph({ name, size = 11 }) {
  return (
    <svg viewBox="0 0 7 7" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true" fill="currentColor">
      {GLYPHS[name].map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)}
    </svg>
  );
}
