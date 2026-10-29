import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

// Register plugins globally once on client
if (typeof window !== 'undefined') {
  gsap.registerPlugin(
    ScrollTrigger,
    ScrollToPlugin,
    MotionPathPlugin,
    CustomEase,
    Flip,
    DrawSVGPlugin,
    SplitText
  );

  // Configure smooth custom eases tailored for transport & SaaS motion
  try {
    CustomEase.create('fleetEase', 'M0,0 C0.16,1 0.3,1 1,1');
    CustomEase.create('lorryEntrance', 'M0,0 C0.22,1 0.36,1 1,1');
    CustomEase.create('roadScrub', 'M0,0 C0.25,0.1 0.25,1 1,1');
  } catch {
    // CustomEase graceful fallback
  }

  // Set default ScrollTrigger settings
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });
}

/**
 * Checks if reduced motion is preferred by user system.
 */
export const isReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  ScrollToPlugin,
  MotionPathPlugin,
  CustomEase,
  Flip,
  DrawSVGPlugin,
  SplitText,
};

export default gsap;
