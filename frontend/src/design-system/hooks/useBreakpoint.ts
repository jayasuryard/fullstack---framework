import { useState, useEffect } from 'react';

const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1440 };

export function useBreakpoint() {
  const [current, setCurrent] = useState<keyof typeof breakpoints>('lg');

  useEffect(() => {
    function check() {
      const width = window.innerWidth;
      const entry = Object.entries(breakpoints).reverse().find(([, v]) => width >= v);
      setCurrent((entry?.[0] as keyof typeof breakpoints) || 'sm');
    }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return {
    isSm: current === 'sm',
    isMd: current === 'md',
    isLg: current === 'lg',
    isXl: current === 'xl',
    is2xl: current === '2xl',
    breakpoint: current,
  };
}
