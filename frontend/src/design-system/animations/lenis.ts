import { useEffect, useRef } from 'react';

export function useLenis(options = {}) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    let LenisClass: any;
    async function init() {
      try {
        const mod = await import('lenis');
        LenisClass = (mod as any).default || (mod as any).Lenis;
        if (!LenisClass) return;

        const lenis = new LenisClass({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
          ...options,
        });

        lenisRef.current = lenis;

        function raf(time: number) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      } catch {}
    }
    init();

    return () => {
      if (lenisRef.current) lenisRef.current.destroy();
    };
  }, []);

  return lenisRef;
}

export function useLenisScrollTo() {
  return (target: string | HTMLElement, options = {}) => {
    if (typeof window !== 'undefined') {
      import('lenis').then((mod) => {
        const LenisClass = (mod as any).default || (mod as any).Lenis;
        if (LenisClass) {
          const lenis = new LenisClass();
          lenis.scrollTo(target, { duration: 1.2, ...options });
        }
      });
    }
  };
}
