import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DesktopProvider } from './contexts/DesktopContext';
import { Desktop } from './components/Desktop';

export function App() {
  return (<BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
    <DesktopProvider>
      <Routes>
        <Route path="*" element={<Desktop />} />
      </Routes>
    </DesktopProvider>
  </BrowserRouter>);
}