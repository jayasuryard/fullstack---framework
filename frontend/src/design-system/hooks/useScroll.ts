import { useState, useEffect } from 'react';

export function useScroll() {
  const [state, setState] = useState({ y: 0, direction: 'up' as 'up' | 'down', atTop: true, atBottom: false });

  useEffect(() => {
    let last = 0;
    function handler() {
      const y = window.scrollY;
      const dir = y > last ? 'down' : 'up';
      last = y;
      setState({
        y,
        direction: dir,
        atTop: y < 10,
        atBottom: y + window.innerHeight >= document.documentElement.scrollHeight - 10,
      });
    }
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return state;
}
