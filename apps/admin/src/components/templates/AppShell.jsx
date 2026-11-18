import React, { useState } from 'react';
import Sidebar from '../organisms/Sidebar';

export default function AppShell({
  user,
  pendingApprovalsCount = 0,
  children,
  onLogout
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg flex flex-col antialiased selection:bg-blue selection:text-white">
      {/* Sidebar Component */}
      <Sidebar
        user={user}
        pendingApprovalsCount={pendingApprovalsCount}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {typeof children === 'function'
            ? children({ onMenuToggle: () => setIsSidebarOpen(true) })
            : children}
        </main>
      </div>
    </div>
  );
}
