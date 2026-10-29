/**
 * SPARK RADAR — Central Motion Tokens
 * Standardized easing curves, durations, and staggers for fleet compliance interactions.
 */

export const motionTokens = {
  duration: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.35,
    moderate: 0.5,
    slow: 0.8,
    cinematic: 1.2,
    radarSweep: 4.0,
  },
  stagger: {
    tight: 0.04,
    cards: 0.08,
    rows: 0.06,
    stages: 0.15,
  },
  ease: {
    // Standard ease for UI elements
    default: 'power2.out',
    // Snappy entrance for modals, cards, badges
    snappy: 'power3.out',
    // Smooth deceleration for vehicle and camera movement
    smooth: 'power4.out',
    // Custom cubic-bezier for transport & SaaS motion
    fleet: 'cubic-bezier(0.16, 1, 0.3, 1)',
    // In-out for loop sweeps
    sweep: 'none',
  },
  scale: {
    hover: 1.02,
    press: 0.98,
    cardLift: 1.015,
    lorryInitial: 0.92,
    lorryIntermediate: 1.0,
    lorryPeak: 1.08,
  },
  distance: {
    desktop: {
      cardLift: -4,
      sectionReveal: 35,
      headlineReveal: 25,
      parallaxDelta: -30,
    },
    tablet: {
      cardLift: -2,
      sectionReveal: 20,
      headlineReveal: 15,
      parallaxDelta: -15,
    },
    mobile: {
      cardLift: 0,
      sectionReveal: 10,
      headlineReveal: 8,
      parallaxDelta: 0,
    },
  },
};

export default motionTokens;

