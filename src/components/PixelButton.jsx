import React from 'react';
import { Link } from 'react-router-dom';
function classesFor(variant, className) {
    const base = 'inline-flex items-center justify-center gap-2 font-mono text-sm max-md:text-[18px] uppercase tracking-wider px-5 py-3 border-2 border-ink shadow-pixel transition-transform duration-100 hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper';
    const style = variant === 'solid' ?
        'bg-accent text-paper' :
        'bg-paper text-ink hover:bg-ink hover:text-paper';
    return `${base} ${style} ${className}`;
}
export function PixelButton(props) {
    const { children, variant = 'solid', className = '' } = props;
    const cls = classesFor(variant, className);
    if ('to' in props && props.to) {
        return (<Link to={props.to} className={cls}>
            {children}
        </Link>);
    }
    const { onClick, type = 'button' } = props;
    return (<button type={type} onClick={onClick} className={cls}>
        {children}
    </button>);
}