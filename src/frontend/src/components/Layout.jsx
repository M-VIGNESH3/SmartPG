import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-background font-body-md overflow-hidden text-on-background">
      <Sidebar />
      <main className="flex-1 ml-[240px] flex flex-col h-screen overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-[2rem] bg-background">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
