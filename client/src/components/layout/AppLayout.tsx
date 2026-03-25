import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useWeddingStore } from '../../store/weddingStore';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { fetchWedding } = useWeddingStore();

  // Fetch wedding data once on mount
  useEffect(() => {
    fetchWedding().catch(() => {
      // silently ignore — dashboard will show empty state
    });
  }, [fetchWedding]);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main
          className="flex-1 overflow-y-auto bg-surface-container-low"
          id="main-content"
          tabIndex={-1}
          aria-label="Main content"
        >
          <div className="p-8 sm:p-10 lg:p-16 max-w-screen-xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
