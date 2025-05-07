"use client";

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function HeaderWrapper() {
  const pathname = usePathname();
  const isChatPage = pathname?.startsWith('/chat/');

  if (isChatPage) {
    return null; // Don't render header on chat pages
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      {/* Add padding to push content below the header */}
      <div className="h-32"></div>
    </>
  );
} 