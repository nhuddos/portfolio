import React, { lazy } from "react";
import { FileTextIcon, HouseIcon, LayersIcon, UserRoundIcon, DiscIcon } from "lucide-react";
import { Home } from "../pages/Home";
const Works = lazy(() => import("../pages/Works").then((m) => ({ default: m.Works })));
const About = lazy(() => import("../pages/About").then((m) => ({ default: m.About })));
const WorkDetail = lazy(() => import("../pages/WorkDetail").then((m) => ({ default: m.WorkDetail })));
const Music = lazy(() => import("../pages/Music").then((m) => ({ default: m.Music })));
import { getProject } from "../data/projects";
export const appRegistry = {
    home: {
        id: 'home',
        label: 'Home',
        icon: HouseIcon,
        color: 'bg-sky',
        tint: 'var(--accent)',
        route: '/',
        onDesktop: true,
        render: () => <Home />
    },
    works: {
        id: 'works',
        label: 'Works',
        icon: LayersIcon,
        color: 'bg-accent-2',
        tint: 'var(--lilac)',
        route: '/works',
        onDesktop: true,
        render: () => <Works />
    },
    about: {
        id: 'about',
        label: 'About',
        icon: UserRoundIcon,
        color: 'bg-mint',
        tint: 'var(--mint)',
        route: '/about',
        onDesktop: true,
        render: () => <About />
    },
    music: {
        id: 'music',
        label: 'Music',
        icon: DiscIcon,
        color: 'bg-accent',
        tint: 'var(--accent-2)',
        route: '/music',
        onDesktop: true,
        size: { w: 380, h: 320 },
        anchor: 'right',
        render: () => <Music />
    },
    project: {
        id: 'project',
        label: 'Project',
        icon: FileTextIcon,
        color: 'bg-accent-2',
        onDesktop: false,
        render: (slug) => <WorkDetail slug={slug} />
    }
};
export const desktopApps = Object.values(appRegistry).filter((a) => a.onDesktop);
export function titleFor(id, slug) {
    if (id === 'project') {
        const project = slug ? getProject(slug) : undefined;
        return project ? `Works \u203A ${project.title}` : 'Works \u203A Project';
    }
    return appRegistry[id].label;
}
export function routeFor(id, slug) {
    if (id === 'project')
        return slug ? `/works/${slug}` : undefined;
    return appRegistry[id].route;
}
export function appForPath(pathname) {
    if (pathname === '/')
        return {
            id: 'home'
        };
    if (pathname.startsWith('/works/')) {
        return {
            id: 'project',
            slug: pathname.replace('/works/', '')
        };
    }
    if (pathname.startsWith('/works'))
        return {
            id: 'works'
        };
    if (pathname.startsWith('/about'))
        return {
            id: 'about'
        };
    if (pathname.startsWith('/music'))
        return {
            id: 'music'
        };
    return null;
}