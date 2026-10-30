import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  CreditCard,
  Menu,
  X,
  ChevronDown,
  FileCheck,
  AlertTriangle,
  FileText,
  Compass,
  Sparkles,
  Award,
  Calendar,
} from 'lucide-react';
import {
  gsap,
  useGSAP,
  SplitText,
  isReducedMotion,
} from '../../lib/gsap';
import { Logo } from '../../components/branding/Logo';
import { Button } from '../../components/common/Button';

export const LandingPage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeJourneyStage, setActiveJourneyStage] = useState<number>(0);

  // GSAP Container & Element Refs
  const mainRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroHeadlineRef = useRef<HTMLHeadingElement>(null);
  const heroVehicleRef = useRef<HTMLDivElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const wordSectionRef = useRef<HTMLElement>(null);
  const journeySectionRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const showcaseRef = useRef<HTMLElement>(null);
  const renewalsRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  // Navigation surface transition on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll using GSAP ScrollToPlugin with reduced-motion fallback
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (isReducedMotion()) {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'auto' });
    } else {
      gsap.to(window, {
        duration: 0.85,
        scrollTo: { y: `#${id}`, offsetY: 70 },
        ease: 'power2.inOut',
      });
    }
  };

  // Switch journey stage with smooth transition
  const handleStageChange = (stageIdx: number) => {
    if (stageIdx === activeJourneyStage) return;
    if (isReducedMotion()) {
      setActiveJourneyStage(stageIdx);
      return;
    }
    const panel = document.querySelector('.journey-stage-content');
    if (panel) {
      gsap.fromTo(
        panel,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
    setActiveJourneyStage(stageIdx);
  };

  // Coordinated GSAP Timelines with lifecycle-safe useGSAP hook
  useGSAP(
    () => {
      if (typeof window === 'undefined') return;
      const reduced = isReducedMotion();

      // ─────────────────────────────────────────────────────────────
      // 1. HERO ENTRANCE & SCROLL-DRIVEN LORRY DEPTH
      // ─────────────────────────────────────────────────────────────
      if (!reduced && heroRef.current) {
        const heroTl = gsap.timeline({ defaults: { ease: 'lorryEntrance' } });

        // Line / Word entrance via SplitText
        if (heroHeadlineRef.current) {
          try {
            const split = new SplitText(heroHeadlineRef.current, { type: 'lines,words' });
            heroTl.from(split.words, {
              opacity: 0,
              y: 40,
              stagger: 0.04,
              duration: 0.85,
            });
          } catch {
            heroTl.fromTo(
              heroHeadlineRef.current.querySelectorAll('.hero-line'),
              { opacity: 0, y: 35 },
              { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }
            );
          }
        }

        heroTl
          .fromTo(
            '.hero-supporting',
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.6 },
            '-=0.45'
          )
          .fromTo(
            heroCtaRef.current,
            { opacity: 0, y: 18, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5 },
            '-=0.35'
          )
          .fromTo(
            heroVehicleRef.current,
            { opacity: 0, x: 80, scale: 0.92 },
            { opacity: 1, x: 0, scale: 1, duration: 1.15, ease: 'lorryEntrance' },
            '-=0.7'
          );

        // Scroll-Driven Lorry Depth Effect (Moves closer to viewer with 3D scale & parallax)
        if (heroVehicleRef.current) {
          gsap.to(heroVehicleRef.current, {
            scale: 1.18,
            xPercent: -8,
            yPercent: 14,
            ease: 'none',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 1,
            },
          });
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 2. FLEET OVERVIEW & BENEFIT WORD COMPOSITIONS
      // ─────────────────────────────────────────────────────────────
      if (!reduced && wordSectionRef.current) {
        // Section header line reveal
        gsap.fromTo(
          wordSectionRef.current.querySelector('.word-section-header'),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: wordSectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Word composition phrases scrub
        const wordTl = gsap.timeline({
          scrollTrigger: {
            trigger: wordSectionRef.current,
            start: 'top 70%',
            end: 'bottom 50%',
            scrub: 0.8,
          },
        });

        wordTl
          .fromTo('.composition-word-1', { opacity: 0, x: -70 }, { opacity: 1, x: 0, duration: 1 })
          .fromTo('.composition-word-2', { opacity: 0, x: 70 }, { opacity: 1, x: 0, duration: 1 }, '-=0.5')
          .fromTo('.composition-word-3', { opacity: 0, y: 40 }, { opacity: 1, x: 0, y: 0, duration: 1 }, '-=0.4')
          .fromTo('.composition-word-4', { opacity: 0, scale: 0.9, y: 25 }, { opacity: 1, scale: 1, y: 0, duration: 1.2 }, '-=0.3');

        // 4 Core architecture pillars staggered entrance
        gsap.fromTo(
          wordSectionRef.current.querySelectorAll('.pillar-card'),
          { opacity: 0, y: 35, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.pillar-grid',
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // ─────────────────────────────────────────────────────────────
      // 3. COMPLIANCE JOURNEY MASTER COORDINATED SCROLL TIMELINE
      // ─────────────────────────────────────────────────────────────
      if (!reduced && journeySectionRef.current) {
        // Section Header Reveal
        gsap.fromTo(
          journeySectionRef.current.querySelector('.journey-header'),
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: journeySectionRef.current,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Coordinated Master Timeline with standard phase labels
        const journeyTl = gsap.timeline({
          scrollTrigger: {
            trigger: journeySectionRef.current.querySelector('.journey-main-container'),
            start: 'top 75%',
            end: '+=1200',
            scrub: 0.8,
            onUpdate: (self) => {
              // Smoothly synchronize active stage selector pill with scroll progress
              if (self.progress < 0.45) {
                setActiveJourneyStage(0);
              } else if (self.progress < 0.75) {
                setActiveJourneyStage(1);
              } else if (self.progress < 0.90) {
                setActiveJourneyStage(2);
              } else {
                setActiveJourneyStage(3);
              }
            },
          },
        });

        journeyTl
          .addLabel('onboard-enter')
          // 1. Reveal outer black panel
          .fromTo(
            '.journey-main-container',
            { opacity: 0.85, y: 35 },
            { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
            'onboard-enter'
          )
          // 2. Reveal lorry image with initial scale 0.92 -> 1.00
          .fromTo(
            '.journey-lorry-img',
            { opacity: 0, scale: 0.92, y: 20 },
            { opacity: 1, scale: 1.0, y: 0, duration: 1.2, ease: 'power2.out' },
            'onboard-enter+=0.2'
          )
          // 3. Reveal registration details badge
          .fromTo(
            '.journey-lorry-badge',
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
            'onboard-enter+=0.4'
          )
          .addLabel('onboard-details')
          // 4. Reveal stage label
          .fromTo(
            '.journey-stage-badge',
            { opacity: 0, x: -15 },
            { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' },
            'onboard-details'
          )
          // 5. Line-reveal headline
          .fromTo(
            '.journey-headline',
            { opacity: 0, y: 15, clipPath: 'inset(0 0 100% 0)' },
            { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'power3.out' },
            'onboard-details+=0.2'
          )
          // 6. Explanatory paragraph
          .fromTo(
            '.journey-paragraph',
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
            'onboard-details+=0.35'
          )
          // 7. GVW & Permit specification cards stagger
          .fromTo(
            '.journey-spec-card',
            { opacity: 0, y: 15, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, stagger: 0.15, duration: 0.7, ease: 'power2.out' },
            'onboard-details+=0.45'
          )
          .addLabel('normalization')
          // 8. Registration normalization strip clip reveal from left to right
          .fromTo(
            '.journey-normalization-strip',
            { opacity: 0, clipPath: 'inset(0 100% 0 0)', x: -20 },
            { opacity: 1, clipPath: 'inset(0 0% 0 0)', x: 0, duration: 1.0, ease: 'power2.out' },
            'normalization'
          )
          // Lorry cinematic depth: scale up to 1.08 with restrained upward parallax
          .to(
            '.journey-lorry-img',
            { scale: 1.08, y: -25, duration: 1.5, ease: 'power1.out' },
            'normalization+=0.2'
          )
          // Text column subtle parallax
          .to(
            '.journey-stage-content',
            { y: -15, duration: 1.5, ease: 'power1.out' },
            'normalization+=0.2'
          )
          .addLabel('onboard-exit')
          // Transition: Lorry moves slightly toward left and reduces scale gently
          .to(
            '.journey-lorry-img',
            { x: -16, scale: 1.0, duration: 1.0, ease: 'power2.inOut' },
            'onboard-exit'
          )
          // Outgoing onboarding details fade out
          .to(
            '.journey-onboard-view',
            { opacity: 0, y: -20, duration: 0.8, ease: 'power2.in' },
            'onboard-exit'
          )
          .addLabel('verify-enter')
          // Reveal Verify stage content with smooth overlap
          .fromTo(
            '.journey-verify-view',
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' },
            'verify-enter-=0.3'
          )
          .fromTo(
            '.journey-verify-item',
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, stagger: 0.12, duration: 0.8, ease: 'power2.out' },
            'verify-enter'
          );
      }

      // ─────────────────────────────────────────────────────────────
      // 4. FEATURES SUITE REVEALS (Distinct Art Direction)
      // ─────────────────────────────────────────────────────────────
      if (!reduced && featuresRef.current) {
        // Feature 1: Telemetry HUD
        gsap.fromTo(
          '.feature-scroll-hud',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.feature-scroll-hud',
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Feature 2: Document Compliance Matrix
        gsap.fromTo(
          '.feature-doc-card',
          { opacity: 0, x: -35 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.feature-doc-card',
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Feature 3: Driver Directory
        gsap.fromTo(
          '.feature-driver-card',
          { opacity: 0, x: 35 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.feature-driver-card',
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // ─────────────────────────────────────────────────────────────
      // 6. PRODUCT SHOWCASE LIVE COCKPIT REVEAL
      // ─────────────────────────────────────────────────────────────
      if (!reduced && showcaseRef.current) {
        gsap.fromTo(
          showcaseRef.current.querySelector('.showcase-header'),
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: showcaseRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        gsap.fromTo(
          showcaseRef.current.querySelector('.showcase-frame'),
          { opacity: 0, y: 50, scale: 0.96, rotateX: 3 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.showcase-frame',
              start: 'top 72%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Stagger cockpit metric items
        gsap.fromTo(
          showcaseRef.current.querySelectorAll('.cockpit-metric-card'),
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.cockpit-metrics-grid',
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Stagger vehicle rows
        gsap.fromTo(
          showcaseRef.current.querySelectorAll('.cockpit-vehicle-row'),
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.cockpit-vehicle-list',
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // ─────────────────────────────────────────────────────────────
      // 7. RENEWAL WORKFLOW 5-STAGE PROGRESSION REVEAL
      // ─────────────────────────────────────────────────────────────
      if (!reduced && renewalsRef.current) {
        gsap.fromTo(
          renewalsRef.current.querySelector('.renewals-header'),
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: renewalsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        gsap.fromTo(
          renewalsRef.current.querySelectorAll('.workflow-step-card'),
          { opacity: 0, y: 35, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.65,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.workflow-steps-grid',
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // ─────────────────────────────────────────────────────────────
      // 8. FINAL CTA REVEAL
      // ─────────────────────────────────────────────────────────────
      if (!reduced && ctaRef.current) {
        gsap.fromTo(
          ctaRef.current.querySelector('.final-cta-card'),
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    },
    { scope: mainRef }
  );

  return (
    <div ref={mainRef} className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-golden selection:text-black">
      {/* ─────────────────────────────────────────────────────────────
          PERSISTENT NAVIGATION (Transparent -> Deep Solid Black on Scroll)
      ───────────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-black/95 backdrop-blur-md border-b border-graphite shadow-dropdown py-3.5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="focus:outline-none focus:ring-2 focus:ring-golden rounded-lg">
            <Logo size="md" variant="light" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-sand">
            <button
              onClick={() => scrollToSection('word-compositions')}
              className="hover:text-golden transition-colors focus:outline-none"
            >
              Overview
            </button>
            <button
              onClick={() => scrollToSection('compliance-journey')}
              className="hover:text-golden transition-colors focus:outline-none"
            >
              Compliance Journey
            </button>
            <button
              onClick={() => scrollToSection('features-suite')}
              className="hover:text-golden transition-colors focus:outline-none"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('renewals-workflow')}
              className="hover:text-golden transition-colors focus:outline-none"
            >
              Workflow
            </button>
            <button
              onClick={() => scrollToSection('product-preview')}
              className="hover:text-golden transition-colors focus:outline-none"
            >
              Live Cockpit
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/login">
              <Button
                variant="ghost"
                size="md"
                className="text-white hover:text-golden hover:bg-graphite"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="primary"
                size="md"
                className="shadow-subtle hover:shadow-elevated gap-1.5"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-sand hover:text-white hover:bg-graphite"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-golden" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black border-b border-graphite px-6 py-5 shadow-dropdown animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col gap-4 text-base font-medium text-sand">
              <button
                onClick={() => scrollToSection('word-compositions')}
                className="text-left py-1 hover:text-golden"
              >
                Overview & Principles
              </button>
              <button
                onClick={() => scrollToSection('compliance-journey')}
                className="text-left py-1 hover:text-golden"
              >
                Compliance Journey (Two-Column)
              </button>
              <button
                onClick={() => scrollToSection('features-suite')}
                className="text-left py-1 hover:text-golden"
              >
                Features Suite
              </button>
              <button
                onClick={() => scrollToSection('renewals-workflow')}
                className="text-left py-1 hover:text-golden"
              >
                5-Stage Workflow
              </button>
              <button
                onClick={() => scrollToSection('product-preview')}
                className="text-left py-1 hover:text-golden"
              >
                Live Cockpit Preview
              </button>
              <div className="pt-4 border-t border-graphite flex flex-col gap-2.5">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────
          1. CINEMATIC HERO SECTION (Oversized Kinetic Typography & Depth Lorry)
      ───────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden bg-gradient-to-b from-black via-graphite to-black border-b border-graphite"
      >
        {/* Radar & Highway Grid Background Motif (Layer 1 - Background z-0) */}
        <div className="absolute inset-0 opacity-15 pointer-events-none z-0">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 65% 40%, rgba(230, 178, 60, 0.18) 0%, transparent 65%),
                linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)`,
              backgroundSize: '100% 100%, 56px 56px, 56px 56px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Typography & CTAs (Layer 2 - Content z-20) */}
            <div className="lg:col-span-7 xl:col-span-6 text-left space-y-6 relative z-20">
              {/* Market Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-graphite border border-golden/30 text-golden text-xs font-semibold tracking-wide uppercase shadow-subtle">
                <ShieldCheck className="w-4 h-4 text-golden" />
                <span>Tamil Nadu Commercial Fleet Compliance SaaS</span>
              </div>

              {/* Oversized Kinetic Headline */}
              <h1
                ref={heroHeadlineRef}
                className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight text-white leading-[1.04] font-heading"
              >
                <span className="block hero-line overflow-hidden">
                  <span className="inline-block hero-word">Your fleet.</span>
                </span>
                <span className="block hero-line overflow-hidden">
                  <span className="inline-block hero-word">Every document.</span>
                </span>
                <span className="block hero-line overflow-hidden">
                  <span className="inline-block hero-word text-golden underline decoration-golden/40 underline-offset-8">
                    Always accounted for.
                  </span>
                </span>
              </h1>

              {/* Supporting Copy */}
              <p className="hero-supporting text-lg sm:text-xl text-sand max-w-xl leading-relaxed">
                Manage vehicle documents, renewals, driver licences, and compliance tasks from one clear fleet workspace.
              </p>

              {/* Action Buttons */}
              <div ref={heroCtaRef} className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto gap-2 px-8 py-3.5 text-base font-semibold shadow-elevated">
                    Get Started <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <button
                  onClick={() => scrollToSection('compliance-journey')}
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="dark-outline"
                    size="lg"
                    className="w-full sm:w-auto gap-2 px-7 py-3.5 text-base text-sand hover:text-white"
                  >
                    Explore Journey
                  </Button>
                </button>
              </div>

              {/* Key Highlights */}
              <div className="pt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-medium text-sand">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-golden" />
                  <span>Vehicle-Centric Cockpit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-golden" />
                  <span>RTO Jurisdiction Ready (TN & All India)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-golden" />
                  <span>Zero Spreadsheets & Paper Loss</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Real Photograph Depth Reveal (Layer 3 - Cutout Lorry with Parallax Depth) */}
            <div
              ref={heroVehicleRef}
              className="lg:col-span-5 xl:col-span-6 flex items-center justify-center relative z-10 select-none pointer-events-none mt-6 lg:mt-0 xl:-mr-12"
            >
              <div className="relative w-full max-w-lg sm:max-w-xl lg:max-w-2xl xl:max-w-3xl flex flex-col items-center">
                {/* Subtle warm golden ambient ground glow */}
                <div
                  className="absolute -inset-8 sm:-inset-14 rounded-full opacity-45 blur-3xl pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(230, 178, 60, 0.35) 0%, rgba(230, 178, 60, 0.08) 55%, transparent 75%)',
                  }}
                />

                {/* Real Commercial Lorry Cutout (High-resolution Transparent RGBA Cutout, Zero White Box) */}
                <img
                  src="/images/hero-lorry-cutout.png"
                  alt="Real Commercial Lorry Ashok Leyland 1215 HCV"
                  className="relative z-10 w-full h-auto object-contain filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.95)] max-h-[460px] sm:max-h-[540px] lg:max-h-[620px] xl:max-h-[680px] scale-105 sm:scale-110 lg:scale-120 transform-gpu transition-transform duration-700"
                  width="1536"
                  height="1024"
                />

                {/* Floating Plate Pill Overlay (Layer 4) */}
                <div className="relative z-20 -mt-6 sm:-mt-8 lg:-mt-10 bg-black/95 backdrop-blur-md border border-golden/50 px-5 py-2.5 rounded-2xl flex items-center justify-between gap-4 shadow-elevated w-4/5 max-w-sm sm:max-w-md">
                  <div>
                    <span className="font-mono text-golden font-bold block text-sm sm:text-base tracking-wider">TN 01 EX 9988</span>
                    <span className="text-sand text-[11px] sm:text-xs">Ashok Leyland 1215 • Goods HCV</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-golden text-black font-mono font-bold text-[10px] sm:text-xs tracking-wide">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll Indicator Cue */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-sand/60 text-xs z-20">
          <span className="uppercase tracking-widest text-[10px]">Scroll to Explore</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-golden" />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. SCROLL-DRIVEN WORD COMPOSITIONS & 4 ARCHITECTURE PILLARS
      ───────────────────────────────────────────────────────────── */}
      <section
        id="word-compositions"
        ref={wordSectionRef}
        className="py-24 sm:py-28 bg-black relative border-b border-graphite overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="word-section-header text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-graphite border border-golden/30 text-golden text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-golden" />
              <span>Core Compliance Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
              Total visibility across every asset.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-sand leading-relaxed">
              When commercial enforcement stops your vehicle on the highway, answers must be instant.
            </p>
          </div>

          {/* Large Kinetic Word Compositions Layout */}
          <div className="relative max-w-5xl mx-auto space-y-8 sm:space-y-12">
            <div className="composition-word-1 flex items-baseline justify-start gap-4 border-b border-graphite pb-6">
              <span className="text-4xl sm:text-7xl font-extrabold text-white font-heading tracking-tight">
                Every <span className="text-golden">vehicle.</span>
              </span>
              <span className="hidden sm:inline-block text-xs font-mono text-sand uppercase tracking-wider">
                Heavy Lorries • Autos • Vans • Taxis • Coaches
              </span>
            </div>

            <div className="composition-word-2 flex items-baseline justify-end gap-4 border-b border-graphite pb-6">
              <span className="hidden sm:inline-block text-xs font-mono text-sand uppercase tracking-wider">
                RC • Fitness Form 38 • Insurance • Tax • PUC
              </span>
              <span className="text-4xl sm:text-7xl font-extrabold text-white font-heading tracking-tight">
                Every <span className="text-sand">document.</span>
              </span>
            </div>

            <div className="composition-word-3 flex items-baseline justify-start gap-4 border-b border-graphite pb-6">
              <span className="text-4xl sm:text-7xl font-extrabold text-white font-heading tracking-tight">
                Every <span className="text-racing">deadline.</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-racing/10 border border-racing/30 text-racing text-xs font-mono font-bold">
                <AlertTriangle className="w-3.5 h-3.5" /> 30-15-7-1 Day Alert Engine
              </span>
            </div>

            <div className="composition-word-4 text-center pt-4">
              <span className="text-5xl sm:text-8xl font-black text-golden font-heading tracking-tight block">
                One clear workspace.
              </span>
              <p className="mt-4 text-base sm:text-xl text-sand max-w-2xl mx-auto">
                No scattered WhatsApp screenshots, no forgotten paper folders, no fines at police checkpoints.
              </p>
            </div>
          </div>

          {/* 4 Architecture Pillars Staggered Grid */}
          <div className="pillar-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 max-w-5xl mx-auto">
            <div className="pillar-card p-6 rounded-2xl bg-graphite border border-black/40">
              <span className="text-2xl font-extrabold text-golden font-mono block">01</span>
              <h4 className="text-base font-bold text-white font-heading mt-2">Vehicle-Centric</h4>
              <p className="text-xs text-sand mt-2 leading-relaxed">
                Every document, expiry, and driver mapped directly to its chassis and normalized registration.
              </p>
            </div>
            <div className="pillar-card p-6 rounded-2xl bg-graphite border border-black/40">
              <span className="text-2xl font-extrabold text-golden font-mono block">02</span>
              <h4 className="text-base font-bold text-white font-heading mt-2">Magic-Byte Shield</h4>
              <p className="text-xs text-sand mt-2 leading-relaxed">
                Binary file header validation ensures authentic PDFs and images with zero file corruption.
              </p>
            </div>
            <div className="pillar-card p-6 rounded-2xl bg-graphite border border-black/40">
              <span className="text-2xl font-extrabold text-golden font-mono block">03</span>
              <h4 className="text-base font-bold text-white font-heading mt-2">Zero False Validity</h4>
              <p className="text-xs text-sand mt-2 leading-relaxed">
                Missing expiry dates never imply compliance. Deterministic countdowns calculate true urgency.
              </p>
            </div>
            <div className="pillar-card p-6 rounded-2xl bg-graphite border border-black/40">
              <span className="text-2xl font-extrabold text-golden font-mono block">04</span>
              <h4 className="text-base font-bold text-white font-heading mt-2">Sealed History</h4>
              <p className="text-xs text-sand mt-2 leading-relaxed">
                Renewal completion logs actor timestamps, verified notes, and permanent antecedent records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. COMPLIANCE JOURNEY (Balanced Two-Column Layout, Zero Cropping)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="compliance-journey"
        ref={journeySectionRef}
        className="py-24 sm:py-28 bg-gradient-to-b from-black via-graphite to-black border-b border-graphite relative"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Section Heading & Stage Indicator Bar */}
          <div className="journey-header text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black border border-golden/30 text-golden text-xs font-semibold mb-3">
              <Compass className="w-3.5 h-3.5 text-golden" />
              <span>Interactive Lifecycle Journey</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
              The Complete Vehicle Compliance Journey
            </h2>
            <p className="mt-3 text-base text-sand">
              Experience the four operational milestones: from initial onboarding and verification to proactive monitoring and audit-proof archive.
            </p>

            {/* Stage Selector Pills (Interactive and Clickable) */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6">
              {[
                { idx: 0, title: '01 Onboard' },
                { idx: 1, title: '02 Verify' },
                { idx: 2, title: '03 Monitor' },
                { idx: 3, title: '04 Archive' },
              ].map((s) => (
                <button
                  key={s.idx}
                  onClick={() => handleStageChange(s.idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                    activeJourneyStage === s.idx
                      ? 'bg-golden text-black shadow-elevated scale-105'
                      : 'bg-graphite text-sand hover:text-white border border-graphite'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Balanced Two-Column Main Container (Sized to fit naturally with zero clipping) */}
          <div className="journey-main-container bg-black/85 border border-graphite rounded-3xl p-6 sm:p-10 shadow-dropdown">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Left Column (md:col-span-6 min-w-0): Real Vehicle Showcase */}
              <div className="md:col-span-6 min-w-0 space-y-4">
                <div className="p-6 rounded-2xl bg-graphite/40 border border-graphite flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Real Cutout Image */}
                  <img
                    src="/images/hero-lorry-cutout.png"
                    alt="Ashok Leyland 1215 HCV Real Lorry Cutout"
                    className="journey-lorry-img w-full h-auto max-h-72 sm:max-h-84 object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] scale-105"
                    width="1536"
                    height="1024"
                  />
                  
                  {/* Vehicle Identity Badge */}
                  <div className="journey-lorry-badge mt-4 w-full bg-black/80 border border-golden/40 px-3.5 py-2 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-golden font-bold block text-sm">TN 01 EX 9988</span>
                      <span className="text-sand text-[11px]">Ashok Leyland 1215 • Goods Carrier (HCV)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-golden text-black font-mono font-bold text-[10px]">
                      REGISTERED
                    </span>
                  </div>
                </div>

                {/* Normalization & Specs Bar */}
                <div className="journey-normalization-strip p-3.5 rounded-xl bg-graphite border border-black/40 text-xs font-mono text-sand flex flex-wrap items-center justify-between gap-2">
                  <span>Input: <span className="text-racing">"tn01ex9988"</span></span>
                  <ArrowRight className="w-4 h-4 text-golden" />
                  <span>Stored: <span className="text-golden font-bold">"TN 01 EX 9988"</span></span>
                </div>
              </div>

              {/* Right Column (md:col-span-6 min-w-0): Dynamic Stage Content */}
              <div className="journey-stage-content md:col-span-6 min-w-0 space-y-4 text-left">
                
                {/* ── STAGE 01: ONBOARD ── */}
                {activeJourneyStage === 0 && (
                  <div className="journey-onboard-view space-y-4">
                    <span className="journey-stage-badge text-xs font-bold text-golden uppercase tracking-wider font-mono block">
                      Stage 01 • Onboarding & Identity
                    </span>
                    <h3 className="journey-headline text-2xl font-bold text-white font-heading">
                      Strict plate normalization eliminates duplicate confusion.
                    </h3>
                    <p className="journey-paragraph text-sm text-sand leading-relaxed">
                      Fleet managers type registration numbers in varied formats. Spark Radar normalizes casing and whitespace automatically before writing to PostgreSQL, preventing accidental duplicate vehicle profiles across transport yards.
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="journey-spec-card p-3 rounded-xl bg-graphite border border-black/40">
                        <span className="text-sand/60 block text-[10px] uppercase font-mono">GVW Rating</span>
                        <span className="font-bold text-white text-sm">11,990 kg</span>
                      </div>
                      <div className="journey-spec-card p-3 rounded-xl bg-graphite border border-black/40">
                        <span className="text-sand/60 block text-[10px] uppercase font-mono">Permit Type</span>
                        <span className="font-bold text-golden text-sm">National Goods Permit</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STAGE 02: VERIFY ── */}
                {activeJourneyStage === 1 && (
                  <div className="journey-verify-view space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-black/40">
                      <span className="text-xs font-bold text-sand uppercase font-mono">Stage 02 • Verification Matrix</span>
                      <span className="text-xs font-bold text-golden bg-golden/10 px-2 py-0.5 rounded">4/4 Attached</span>
                    </div>
                    {[
                      { name: 'Fitness Form 38', exp: 'Valid till 15 Nov 2026', status: 'Compliant' },
                      { name: 'Commercial Goods Policy', exp: 'Expires in 2 Days', status: 'Urgent' },
                      { name: 'Quarterly Road Tax', exp: 'Valid till 31 Dec 2026', status: 'Compliant' },
                      { name: 'PUC Green Slip', exp: 'Valid till 28 Feb 2027', status: 'Compliant' },
                    ].map((doc, idx) => (
                      <div key={idx} className="journey-verify-item p-3 rounded-xl bg-graphite border border-black/40 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <FileCheck className="w-4 h-4 text-golden shrink-0" />
                          <div>
                            <span className="font-bold text-white block">{doc.name}</span>
                            <span className="text-[10px] text-sand/70 font-mono">%PDF-1.4 Verified</span>
                          </div>
                        </div>
                        <span className={`text-[11px] font-mono font-bold ${doc.status === 'Urgent' ? 'text-racing' : 'text-golden'}`}>
                          {doc.exp}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── STAGE 03: MONITOR ── */}
                {activeJourneyStage === 2 && (
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-racing uppercase tracking-wider font-mono">
                      Stage 03 • Expiry Radar & Alerts
                    </span>
                    <h3 className="text-2xl font-bold text-white font-heading">
                      Deterministic urgency calculations. Zero false validity.
                    </h3>
                    <p className="text-sm text-sand leading-relaxed">
                      Our calculation engine triggers countdown alerts at 30, 15, 7, and 1-day boundaries. Missing expiry dates are never assumed valid.
                    </p>
                    <div className="space-y-2.5 pt-1">
                      <div className="p-3.5 rounded-xl bg-graphite border border-racing/50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-racing shrink-0" />
                          <div>
                            <span className="font-bold text-white block">Commercial Insurance Expiring</span>
                            <span className="text-[10px] text-sand">TN 01 EX 9988 • Policy #88219</span>
                          </div>
                        </div>
                        <span className="font-mono text-racing font-bold">1 Day (Due Today)</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-graphite border border-golden/40 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-golden shrink-0" />
                          <div>
                            <span className="font-bold text-white block">Fitness Form 38 Inspection</span>
                            <span className="text-[10px] text-sand">RTO Slot Booked</span>
                          </div>
                        </div>
                        <span className="font-mono text-golden font-bold">7 Days Remaining</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STAGE 04: ARCHIVE ── */}
                {activeJourneyStage === 3 && (
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-golden uppercase tracking-wider font-mono">
                      Stage 04 • Immutable History
                    </span>
                    <h3 className="text-2xl font-bold text-white font-heading">
                      Renewal completed. Antecedent certificates preserved.
                    </h3>
                    <p className="text-sm text-sand leading-relaxed">
                      Completing a renewal stamps actor identity and notes. Superseded certificates remain permanently searchable for transport tax and police audits.
                    </p>
                    <div className="p-4 rounded-xl bg-graphite border border-golden/40 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">Policy #88219 Renewal Confirmed</span>
                        <CheckCircle2 className="w-4 h-4 text-golden" />
                      </div>
                      <p className="text-sand text-[11px] leading-relaxed">
                        Valid through 28 Oct 2027. Previous policy archived under hash <span className="text-golden font-mono">#arc-2025-tn01</span>.
                      </p>
                      <div className="pt-2 border-t border-black/30 flex items-center justify-between text-[11px] text-sand">
                        <span>Actor: <span className="text-golden font-bold">Selvam M. (Manager)</span></span>
                        <span className="font-mono">2026-10-29 14:30 IST</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. FEATURES SUITE (Distinct Art-Directed Compositions)
      ───────────────────────────────────────────────────────────── */}
      <section id="features-suite" ref={featuresRef} className="py-24 bg-gradient-to-b from-black via-graphite to-black border-b border-graphite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          
          {/* Feature 1: Scroll Management — "Make every scroll count." (fleet-highway.webp) */}
          <div className="feature-scroll-hud rounded-3xl bg-graphite border border-graphite overflow-hidden relative shadow-dropdown">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              <div className="lg:col-span-6 p-8 sm:p-12 space-y-5 text-left">
                <span className="text-xs uppercase tracking-widest text-golden font-bold font-mono">
                  01 • Fleet Telemetry HUD
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
                  Make every scroll count.
                </h3>
                <p className="text-sm sm:text-base text-sand leading-relaxed">
                  Spark Radar organizes vehicles by operational urgency. Overdue and critical expiries automatically rise to the top of your screen, ensuring immediate action before vehicle impoundment.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-black/60 border border-black/40">
                    <span className="text-[10px] uppercase font-mono text-sand">Instant Triage</span>
                    <p className="text-sm font-bold text-white mt-0.5">Critical-First Sorting</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/60 border border-black/40">
                    <span className="text-[10px] uppercase font-mono text-sand">Zero Lag</span>
                    <p className="text-sm font-bold text-golden mt-0.5">Sub-millisecond UI</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6 aspect-video sm:aspect-auto sm:h-full relative overflow-hidden bg-black">
                <img
                  src="/images/fleet-highway.webp"
                  alt="Real Commercial Fleet Highway in India"
                  className="w-full h-full object-cover object-center"
                  width="700"
                  height="450"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-graphite via-transparent to-transparent hidden lg:block" />
              </div>
            </div>
          </div>

          {/* Feature 2: Document Management — "Every document has its place." */}
          <div className="feature-doc-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="text-xs uppercase tracking-widest text-golden font-bold font-mono">
                02 • Document Compliance Matrix
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
                Every document has its place.
              </h3>
              <p className="text-sm sm:text-base text-sand leading-relaxed">
                Upload registration certificates, insurance binders, Fitness Form 38, quarterly road tax receipts, and PUC certificates. Magic-byte verification checks binary authenticity before file storage.
              </p>
              <div className="p-3.5 rounded-xl bg-graphite border border-golden/30 text-xs font-mono text-golden flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-golden" />
                <span>Binary Signature: %PDF-1.4 / JFIF Validated</span>
              </div>
            </div>
            <div className="lg:col-span-7 bg-graphite rounded-3xl p-6 sm:p-8 border border-graphite shadow-dropdown space-y-3">
              {[
                { name: 'Fitness Form 38', vehicle: 'TN 01 EX 9988', status: 'Compliant', date: 'Valid till 15 Nov 2026' },
                { name: 'Commercial Goods Policy', vehicle: 'TN 01 EX 9988', status: 'Urgent', date: 'Expires in 2 Days' },
                { name: 'Quarterly Road Tax', vehicle: 'TN 07 TT 4567', status: 'Compliant', date: 'Valid till 31 Dec 2026' },
                { name: 'PUC Green Slip', vehicle: 'TN 02 AR 3311', status: 'Compliant', date: 'Valid till 28 Feb 2027' },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-black/60 border border-black/40 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-golden/10 flex items-center justify-center text-golden">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block text-sm">{doc.name}</span>
                      <span className="text-sand text-[11px]">{doc.vehicle}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono text-xs font-bold block ${doc.status === 'Urgent' ? 'text-racing' : 'text-golden'}`}>
                      {doc.date}
                    </span>
                    <span className="text-[10px] text-sand/60 uppercase">{doc.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature 3: Driver Management — "Keep every licence in view." (taxi-cab.webp) */}
          <div className="feature-driver-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="text-xs uppercase tracking-widest text-golden font-bold font-mono">
                03 • Driver & PSV Badge Directory
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
                Keep every licence in view.
              </h3>
              <p className="text-sm sm:text-base text-sand leading-relaxed">
                Assign qualified commercial drivers to specific vehicles. Track commercial driving licence endorsements (Transport / Hazardous / Hill Driving) and PSV badge expiry dates.
              </p>
              <div className="pt-2">
                <span className="text-xs text-sand font-mono">
                  Audit-Ready: Driver Assigned • Selvam M. (Badge #99482)
                </span>
              </div>
            </div>
            <div className="lg:col-span-7 bg-graphite rounded-3xl p-6 sm:p-8 border border-graphite shadow-dropdown">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/60 border border-black/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-golden" />
                    <span className="font-bold text-white text-sm">Commercial DL Tracker</span>
                  </div>
                  <p className="text-xs text-sand leading-relaxed">
                    Tracks transport class validity separate from non-transport validity with automated 30-day renewal reminders.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-black/60 border border-black/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-golden" />
                    <span className="font-bold text-white text-sm">Vehicle Assignment</span>
                  </div>
                  <p className="text-xs text-sand leading-relaxed">
                    Instant primary driver assignment prevents unauthorized driving and logs driver responsibility in case of challans.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. ACTUAL PRODUCT SHOWCASE (Live Cockpit Mockup)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="product-preview"
        ref={showcaseRef}
        className="py-24 bg-black relative border-b border-graphite"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="showcase-header text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-graphite border border-golden/30 text-golden text-xs font-semibold mb-4">
              <span>Interactive Cockpit Preview</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
              One clear screen for every vehicle, deadline, and task
            </h2>
            <p className="mt-4 text-base sm:text-lg text-sand">
              Inspect how Spark Radar replaces scattered WhatsApp messages and missing papers with a structured, vehicle-centric dashboard.
            </p>
          </div>

          {/* Interactive UI Mockup Container */}
          <div className="showcase-frame rounded-2xl border border-graphite bg-black overflow-hidden shadow-dropdown max-w-6xl mx-auto">
            {/* Top Window Bar */}
            <div className="bg-graphite px-6 py-4 border-b border-black/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-racing" />
                  <div className="w-3 h-3 rounded-full bg-golden" />
                  <div className="w-3 h-3 rounded-full bg-black" />
                </div>
                <span className="text-xs font-mono text-sand pl-2">app.sparkradar.in / overview</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-black border border-graphite text-sand font-medium">
                  Workspace: Meenakshi Tourist Fleet (Chennai • TN)
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-golden text-black font-bold text-[10px]">
                  5 ACTIVE FLEET
                </span>
              </div>
            </div>

            {/* Dashboard Content Mockup with Racing Sunset Colors */}
            <div className="p-6 sm:p-8 bg-ivory text-charcoal">
              {/* Executive Metrics Bar */}
              <div className="cockpit-metrics-grid grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="cockpit-metric-card bg-white p-4 rounded-xl border border-stone shadow-subtle">
                  <span className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">Active Vehicles</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-charcoal font-heading">5</span>
                    <span className="text-xs text-sand-dark font-semibold bg-sand-light px-2 py-0.5 rounded">All Registered</span>
                  </div>
                </div>

                <div className="cockpit-metric-card bg-white p-4 rounded-xl border border-stone shadow-subtle">
                  <span className="text-xs font-semibold text-racing uppercase tracking-wider">Overdue Documents</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-racing font-heading">1</span>
                    <span className="text-xs text-racing-dark font-semibold bg-racing-light px-2 py-0.5 rounded">Action Required</span>
                  </div>
                </div>

                <div className="cockpit-metric-card bg-white p-4 rounded-xl border border-stone shadow-subtle">
                  <span className="text-xs font-semibold text-golden-dark uppercase tracking-wider">Renewals Due Soon</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-golden-dark font-heading">2</span>
                    <span className="text-xs text-golden-dark font-semibold bg-golden-light px-2 py-0.5 rounded">Within 15 Days</span>
                  </div>
                </div>

                <div className="cockpit-metric-card bg-white p-4 rounded-xl border border-stone shadow-subtle">
                  <span className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">Pending Tasks</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-charcoal font-heading">3</span>
                    <span className="text-xs text-black font-medium bg-stone px-2 py-0.5 rounded">Assigned</span>
                  </div>
                </div>
              </div>

              {/* Vehicle List & Priority Queue */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-stone shadow-subtle p-5">
                  <div className="flex items-center justify-between pb-4 border-b border-stone mb-4">
                    <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider font-heading">
                      Fleet Compliance Cockpit
                    </h3>
                    <span className="text-xs text-txt-secondary font-medium">Sorted by urgency</span>
                  </div>

                  <div className="cockpit-vehicle-list space-y-3">
                    {/* Vehicle 1 */}
                    <div className="cockpit-vehicle-row p-3.5 rounded-lg border border-racing/30 bg-racing-light/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-racing/10 flex items-center justify-center shrink-0">
                          <Truck className="w-5 h-5 text-racing" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-charcoal font-heading tracking-wide">
                              TN 01 EX 9988
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-racing-light text-racing-dark font-semibold">
                              Critical
                            </span>
                          </div>
                          <span className="text-xs text-txt-secondary">
                            Ashok Leyland 1215 • Commercial Insurance expired 2 days ago
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-racing shrink-0">Renew Immediately</span>
                    </div>

                    {/* Vehicle 2 */}
                    <div className="cockpit-vehicle-row p-3.5 rounded-lg border border-golden/40 bg-golden-light/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-golden/20 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-golden-dark" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-charcoal font-heading tracking-wide">
                              TN 07 TT 4567
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-golden-light text-golden-dark font-semibold">
                              Due in 8 Days
                            </span>
                          </div>
                          <span className="text-xs text-txt-secondary">
                            Force Traveller 3350 • PUC Certificate expires 06 Nov
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-golden-dark shrink-0">Assigned: Selvam M.</span>
                    </div>

                    {/* Vehicle 3 */}
                    <div className="cockpit-vehicle-row p-3.5 rounded-lg border border-stone bg-ivory/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-sand/20 flex items-center justify-center shrink-0">
                          <CreditCard className="w-5 h-5 text-sand-dark" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-charcoal font-heading tracking-wide">
                              TN 10 TC 8819
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-sand-light text-graphite font-semibold">
                              Compliant
                            </span>
                          </div>
                          <span className="text-xs text-txt-secondary">
                            Toyota Innova Crysta • Next renewal in 118 days
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-golden-dark font-semibold shrink-0">All 6 Docs Verified</span>
                    </div>
                  </div>
                </div>

                {/* Priority Queue */}
                <div className="bg-white rounded-xl border border-stone shadow-subtle p-5">
                  <div className="flex items-center justify-between pb-4 border-b border-stone mb-4">
                    <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider font-heading">
                      Next Priority Actions
                    </h3>
                    <Clock className="w-4 h-4 text-golden" />
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="p-3 rounded-lg bg-ivory border border-stone">
                      <span className="font-bold text-racing text-[11px] uppercase tracking-wide">High Priority</span>
                      <p className="font-semibold text-charcoal mt-1">Book RTO slot for Fitness Form 38</p>
                      <span className="text-txt-secondary mt-1 block">TN 01 EX 9988 • Due in 12 days</span>
                    </div>

                    <div className="p-3 rounded-lg bg-ivory border border-stone">
                      <span className="font-bold text-golden-dark text-[11px] uppercase tracking-wide">Reminder</span>
                      <p className="font-semibold text-charcoal mt-1">Upload renewed Road Tax receipt</p>
                      <span className="text-txt-secondary mt-1 block">TN 07 TT 4567 • Quarterly Tax</span>
                    </div>

                    <div className="p-3 rounded-lg bg-ivory border border-stone">
                      <span className="font-bold text-black text-[11px] uppercase tracking-wide">Driver Check</span>
                      <p className="font-semibold text-charcoal mt-1">Verify Murugan K. Commercial Badge</p>
                      <span className="text-txt-secondary mt-1 block">PSV Badge 994821 • Valid till 2028</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. RENEWAL WORKFLOW (5-Stage Lifecycle Progression)
      ───────────────────────────────────────────────────────────── */}
      <section id="renewals-workflow" ref={renewalsRef} className="py-24 bg-gradient-to-b from-black via-graphite to-black border-b border-graphite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="renewals-header text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black border border-golden/30 text-golden text-xs font-semibold mb-4">
              <Calendar className="w-3.5 h-3.5 text-golden" />
              <span>Audit-Preserving Renewals</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
              A transparent 5-stage renewal workflow
            </h2>
            <p className="mt-4 text-base sm:text-lg text-sand">
              Upcoming → Assigned → In Progress → Completed → Evidence Saved. How tasks transition without altering historical records.
            </p>
          </div>

          <div className="workflow-steps-grid grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="workflow-step-card p-5 rounded-2xl bg-graphite border border-black/40 text-left">
              <span className="text-xs font-bold text-golden uppercase tracking-wider font-mono">Stage 01</span>
              <h4 className="text-base font-bold text-white font-heading mt-2">Upcoming Alert</h4>
              <p className="text-xs text-sand mt-1.5 leading-relaxed">
                System flags expiry 30, 15, and 7 days prior. Days remaining calculated automatically.
              </p>
            </div>

            {/* Step 2 */}
            <div className="workflow-step-card p-5 rounded-2xl bg-graphite border border-black/40 text-left">
              <span className="text-xs font-bold text-golden uppercase tracking-wider font-mono">Stage 02</span>
              <h4 className="text-base font-bold text-white font-heading mt-2">Assigned</h4>
              <p className="text-xs text-sand mt-1.5 leading-relaxed">
                Designate a fleet supervisor or driver responsible for paperwork, inspection, or tax fee payment.
              </p>
            </div>

            {/* Step 3 */}
            <div className="workflow-step-card p-5 rounded-2xl bg-graphite border border-black/40 text-left">
              <span className="text-xs font-bold text-golden uppercase tracking-wider font-mono">Stage 03</span>
              <h4 className="text-base font-bold text-white font-heading mt-2">In Progress</h4>
              <p className="text-xs text-sand mt-1.5 leading-relaxed">
                RTO inspection slot booked or insurance agent premium payment submitted.
              </p>
            </div>

            {/* Step 4 */}
            <div className="workflow-step-card p-5 rounded-2xl bg-graphite border border-golden/50 text-left relative overflow-hidden shadow-subtle">
              <div className="absolute top-0 right-0 w-12 h-12 bg-golden/10 rounded-bl-full pointer-events-none" />
              <span className="text-xs font-bold text-golden uppercase tracking-wider font-mono">Stage 04</span>
              <h4 className="text-base font-bold text-white font-heading mt-2">Completed</h4>
              <p className="text-xs text-sand mt-1.5 leading-relaxed">
                Task marked done with actor timestamp and RTO verification notes recorded in DB.
              </p>
            </div>

            {/* Step 5 */}
            <div className="workflow-step-card p-5 rounded-2xl bg-graphite border border-black/40 text-left">
              <span className="text-xs font-bold text-sand uppercase tracking-wider font-mono">Stage 05</span>
              <h4 className="text-base font-bold text-white font-heading mt-2">Evidence Saved</h4>
              <p className="text-xs text-sand mt-1.5 leading-relaxed">
                New policy PDF uploaded. Antecedent certificate archived for tax and historical fleet review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. FINAL CTA & TRANSITIONS
      ───────────────────────────────────────────────────────────── */}
      <section ref={ctaRef} className="py-24 bg-black border-t border-graphite">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="final-cta-card p-10 sm:p-16 rounded-3xl bg-graphite border border-golden/40 shadow-dropdown relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-golden/10 blur-3xl pointer-events-none" />

            <span className="text-xs font-bold text-golden uppercase tracking-widest font-mono">
              Commercial Fleet Deployment Ready
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight mt-3">
              Bring your fleet into one clear workspace.
            </h2>

            <p className="mt-5 text-base sm:text-lg text-sand max-w-2xl mx-auto leading-relaxed">
              No spreadsheets, no expired insurance surprises, no missing RTO fitness certificates. Keep every commercial vehicle accounted for.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 px-8 py-3.5 text-base font-semibold shadow-elevated">
                  Get Started Today <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="dark-outline" size="lg" className="w-full sm:w-auto px-7 py-3.5 text-base">
                  Sign In to Workspace
                </Button>
              </Link>
            </div>

            <p className="text-xs text-sand/80 mt-6 font-mono">
              Full pre-populated demo fleet: <span className="text-golden font-bold">demo@sparkradar.in</span>
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. ACCESSIBLE HIGH-CONTRAST FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="bg-black border-t border-graphite py-12 text-sand text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-graphite">
            <Logo size="md" variant="light" />
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-sand">
              <Link to="/dashboard" className="hover:text-golden transition-colors">Overview</Link>
              <Link to="/vehicles" className="hover:text-golden transition-colors">Vehicles</Link>
              <Link to="/renewals" className="hover:text-golden transition-colors">Renewals</Link>
              <Link to="/drivers" className="hover:text-golden transition-colors">Drivers</Link>
              <Link to="/settings" className="hover:text-golden transition-colors">Settings</Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-sand/80">
            <p>
              © {new Date().getFullYear()} Spark Radar. Vehicle-centric fleet compliance & renewal management SaaS.
            </p>
            <p className="text-[11px] max-w-md">
              Disclaimer: Spark Radar tracks recorded document validity based on user submissions. It distinguishes recorded document status from legally verified government certification. Jurisdiction-specific RTO regulations apply.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
