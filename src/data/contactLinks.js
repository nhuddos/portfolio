import { asset } from '../assetUrl.js';

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

export function resolveLogoSrc(logo) {
  return logo.startsWith('/') ? asset(logo) : `https://cdn.simpleicons.org/${logo}`;
}