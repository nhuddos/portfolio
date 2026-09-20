import { useEffect } from 'react';
import { ARROW, HAND, arrowSvg, handSvg } from '../data/cursorArt';

const toCursor = (svg, { hotspot }, fallback) =>
  `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hotspot[0]} ${hotspot[1]}, ${fallback}`;

function applyCursorTheme() {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const ink = styles.getPropertyValue('--ink').trim();
  const paper = styles.getPropertyValue('--paper').trim();
  if (!ink || !paper) return;
  root.style.setProperty('--cursor-arrow', toCursor(arrowSvg(ink, paper), ARROW, 'default'));
  root.style.setProperty('--cursor-hand', toCursor(handSvg(ink, paper), HAND, 'pointer'));
}

export function CustomCursor() {
  useEffect(() => {
    applyCursorTheme();
    const observer = new MutationObserver(applyCursorTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-time-of-day']
    });
    return () => observer.disconnect();
  }, []);

  return null;
}