import React from 'react';

export function iconImage(fileName, alt = '') {
  return function AppIcon({ size = 20, strokeWidth, className = '', ...rest }) {
    return (
      <img
        src={`/images/icon/${fileName}`}
        alt={alt}
        width={size}
        height={size}
        className={`pixelated shrink-0 object-contain ${className}`}
        {...rest}
      />
    );
  };
}
