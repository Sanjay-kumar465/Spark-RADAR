/**
 * SPARK RADAR — Shared Animation Module
 * Centralized GSAP registration and lifecycle management with motion tokens.
 */
import {
  gsap,
  useGSAP,
  ScrollTrigger,
  ScrollToPlugin,
  MotionPathPlugin,
  CustomEase,
  Flip,
  DrawSVGPlugin,
  SplitText,
  isReducedMotion,
} from '../lib/gsap';
import { motionTokens } from '../lib/motionTokens';

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
  isReducedMotion,
  motionTokens,
};

export default gsap;

