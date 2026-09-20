// src/data/contactLinks.js
//
// Single source of truth for the "connect with me" links shown in a few
// places (Desktop's mobile top bar, the Taskbar's Start menu, and the
// About chat header). Update an account here and it updates everywhere.
//
// `logo` is either a local file under public/images/logo (given as an
// absolute path starting with "/", e.g. "/images/logo/linkedin.svg") or a
// Simple Icons (https://simpleicons.org) slug rendered via their CDN —
// used instead of Lucide's brand icons, since Lucide has
// deprecated/removed its brand icon set. Email has no brand logo, so it
// uses the plain Lucide `Mail` icon instead (see the `icon: 'mail'`
// entry below). Resolve whichever form `logo` is with `resolveLogoSrc`.
//
// Email opens a Gmail compose window directly (rather than `mailto:`,
// which just hands off to whatever mail app is set as the visitor's
// system default — not necessarily Gmail).
export const CONTACT_LINKS = [
  {
    id: 'email',
    label: 'Email',
    href: 'https://mail.google.com/mail/?view=cm&fs=1&to=nhukhanhdo.gd@gmail.com',
    icon: 'mail'
  },
  {
    id: 'behance',
    label: 'Behance',
    href: 'https://www.behance.net/khanhdo34',
    logo: 'behance'
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/yoyoottoo?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==',
    logo: 'instagram'
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/khanh-do-67039b302',
    logo: '/images/logo/linkedin.svg'
  }
];

// A `logo` value is either a local path (starts with "/") or a Simple
// Icons CDN slug — resolve it to an actual <img> src either way.
export function resolveLogoSrc(logo) {
  return logo.startsWith('/') ? logo : `https://cdn.simpleicons.org/${logo}`;
}