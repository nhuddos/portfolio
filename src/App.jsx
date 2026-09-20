import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DesktopProvider } from './contexts/DesktopContext';
import { Desktop } from './components/Desktop';
import { CustomCursor } from './components/CustomCursor';

export function App() {
  return (<BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
    <DesktopProvider>
      <CustomCursor />
      <Routes>
        <Route path="*" element={<Desktop />} />
      </Routes>
    </DesktopProvider>
  </BrowserRouter>);
}