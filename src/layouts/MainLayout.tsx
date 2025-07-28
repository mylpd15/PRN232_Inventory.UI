import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [showSidebar, setShowSidebar] = useState(true);

  const toggleSidebar = () => setShowSidebar((prev) => !prev);

  return (
    <div className="flex h-screen bg-gray-50 font-['Montserrat',sans-serif]">
      {/* Conditionally render Sidebar */}
      {showSidebar && <Sidebar />}

      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50 font-['Montserrat',sans-serif]">
          {children}
        </main>
      </div>
    </div>
  );
}
