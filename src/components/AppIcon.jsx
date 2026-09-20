import React from 'react';
import { asset } from '../assetUrl.js';

export function iconImage(fileName, alt = '') {
  return function AppIcon({ size = 20, strokeWidth, className = '', ...rest }) {
    return (
      <img
        src={asset(`/images/icon/${fileName}`)}
        alt={alt}
        width={size}
        height={size}
        className={`pixelated shrink-0 object-contain ${className}`}
        {...rest}
      />
    );
  };
}