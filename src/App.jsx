import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DesktopProvider } from './contexts/DesktopContext';
import { Desktop } from './components/Desktop';
import { CustomCursor } from './components/CustomCursor';

export function App() {
  return (<BrowserRouter>
    <DesktopProvider>
      <CustomCursor />
      <Routes>
        {/* The desktop owns every route: it maps the URL to an open window. */}
        <Route path="*" element={<Desktop />} />
      </Routes>
    </DesktopProvider>
  </BrowserRouter>);
}