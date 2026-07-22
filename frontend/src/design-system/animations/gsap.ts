import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const animations = {
  fadeIn: (el: gsap.TweenTarget, delay = 0) =>
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4, delay, ease: 'power2.out' }),

  fadeUp: (el: gsap.TweenTarget, delay = 0) =>
    gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay, ease: 'power2.out' }),

  fadeDown: (el: gsap.TweenTarget, delay = 0) =>
    gsap.fromTo(el, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, delay, ease: 'power2.out' }),

  slideLeft: (el: gsap.TweenTarget, delay = 0) =>
    gsap.fromTo(el, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, delay, ease: 'power2.out' }),

  slideRight: (el: gsap.TweenTarget, delay = 0) =>
    gsap.fromTo(el, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, delay, ease: 'power2.out' }),

  scale: (el: gsap.TweenTarget, delay = 0) =>
    gsap.fromTo(el, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.3, delay, ease: 'power2.out' }),

  reveal: (el: gsap.TweenTarget, delay = 0) => {
    gsap.set(el, { clipPath: 'inset(0 100% 0 0)' });
    return gsap.to(el, { clipPath: 'inset(0 0% 0 0)', duration: 0.8, delay, ease: 'power3.inOut' });
  },

  counter: (el: HTMLElement, start: number, end: number, duration = 1.5) => {
    const obj = { value: start };
    return gsap.to(obj, {
      value: end,
      duration,
      ease: 'power2.out',
      onUpdate: () => { el.textContent = Math.round(obj.value).toLocaleString(); },
    });
  },

  sectionReveal: (el: gsap.TweenTarget, delay = 0) =>
    gsap.fromTo(el, { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 0.6, delay, ease: 'power2.out',
      scrollTrigger: { trigger: el as HTMLElement, start: 'top 85%' },
    }),

  staggerList: (items: gsap.TweenTarget, delay = 0) =>
    gsap.fromTo(items, { opacity: 0, y: 12 }, {
      opacity: 1, y: 0, duration: 0.3, delay, stagger: 0.05, ease: 'power2.out',
    }),

  modalEnter: (el: gsap.TweenTarget) =>
    gsap.fromTo(el, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' }),

  modalExit: (el: gsap.TweenTarget) =>
    gsap.to(el, { opacity: 0, scale: 0.96, duration: 0.15, ease: 'power2.in' }),

  pageEnter: (el: gsap.TweenTarget) =>
    gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }),

  pageExit: (el: gsap.TweenTarget) =>
    gsap.to(el, { opacity: 0, y: -8, duration: 0.2, ease: 'power2.in' }),
};

export function useGsapAnimation(animation: keyof typeof animations, deps: any[] = []) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && animations[animation]) {
      (animations[animation] as any)(ref.current);
    }
  }, deps);

  return ref;
}

export function useGsapTimeline() {
  return useCallback(() => gsap.timeline(), []);
}
