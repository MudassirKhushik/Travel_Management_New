'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    // Reset scroll position on route change
    window.scrollTo(0, 0);
    
    // Remove any hash from URL
    if (window.location.hash) {
      history.pushState(null, '', window.location.pathname);
    }
  }, [pathname]);

  return null;
}