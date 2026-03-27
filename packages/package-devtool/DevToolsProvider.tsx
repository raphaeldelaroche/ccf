'use client';

import { DevToolsPanel } from './DevToolsPanel';

export function DevToolsProvider({ children }: { children: React.ReactNode }) {
  // Only render in development
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENV === 'development';
    
  if (!isDevelopment) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <DevToolsPanel />
    </>
  );
}
