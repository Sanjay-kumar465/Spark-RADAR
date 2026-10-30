import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Truck,
  FileCheck,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Award,
  Calendar,
  Users,
  Check,
} from 'lucide-react';
import { gsap, useGSAP, ScrollTrigger, isReducedMotion } from '../../lib/gsap';

interface SupportingDetail {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}

interface MilestoneItem {
  id: string;
  number: string;
  label: string;
  badge: string;
  heading: string;
  description: string;
  supportingDetails: SupportingDetail[];
  vehicle: {
    src: string;
    alt: string;
    model: string;
    plate: string;
    classification: string;
    status: string;
    statusUrgent?: boolean;
    specLine1: string;
    specLine2: string;
    width: number;
    height: number;
  };
  metaWidget: {
    type: 'normalization' | 'verification' | 'monitor' | 'archive';
    label: string;
    tag: string;
    tagUrgent?: boolean;
    items?: Array<{
      name?: string;
      label?: string;
      value?: string;
      validity?: string;
      status?: string;
      sub?: string;
      urgency?: string;
      urgent?: boolean;
      highlight?: boolean;
    }>;
    note: string;
    rawInput?: string;
    normalized?: string;
    hash?: string;
    actor?: string;
    timestamp?: string;
  };
  ctaText: string;
  ctaHref: string;
  layout: 'text-left' | 'text-right';
}

const MILESTONES: MilestoneItem[] = [
  {
    id: 'milestone-onboard',
    number: '01',
    label: 'ONBOARD',
    badge: 'Stage 01 • Fleet Onboarding & Identity',
    heading: 'Strict plate normalization eliminates duplicate confusion.',
    description:
      'Fleet managers type registration numbers in varied formats. Spark Radar normalizes casing and whitespace automatically before writing to PostgreSQL, preventing accidental duplicate vehicle profiles across transport yards.',
    supportingDetails: [
      {
        icon: Truck,
        title: 'Vehicle registration',
        desc: 'Deterministic plate normalization and RTO profile sync.',
      },
      {
        icon: FileText,
        title: 'RC and insurance records',
        desc: 'Centralized policy certificates and registration documents.',
      },
      {
        icon: FileCheck,
        title: 'Document collection',
        desc: 'Structured file intake with strict format and completeness checks.',
      },
      {
        icon: Users,
        title: 'Fleet profile creation',
        desc: 'Classification by tonnage, permit jurisdiction, and depot.',
      },
    ],
    vehicle: {
      src: '/images/hero-lorry-cutout.png',
      alt: 'Ashok Leyland 1215 HCV Red Commercial Lorry Cutout',
      model: 'Ashok Leyland 1215 HCV',
      plate: 'TN 01 EX 9988',
      classification: 'Commercial Goods Carrier (HCV)',
      status: '01 ONBOARDED',
      specLine1: 'GVW Rating: 11,990 kg',
      specLine2: 'Permit: National Goods Permit',
      width: 1536,
      height: 1024,
    },
    metaWidget: {
      type: 'normalization',
      label: 'PLATE NORMALIZATION & RTO PROFILE',
      tag: 'DATABASE NORMALIZED',
      rawInput: 'tn01ex9988',
      normalized: 'TN 01 EX 9988',
      items: [
        { label: 'GVW Rating', value: '11,990 kg' },
        { label: 'Permit Class', value: 'National Goods' },
      ],
      note: 'Automated normalization eliminates duplicate vehicle profiles across transport yards.',
    },
    ctaText: 'EXPLORE ONBOARDING WORKFLOW',
    ctaHref: '/register',
    layout: 'text-left',
  },
  {
    id: 'milestone-verify',
    number: '02',
    label: 'VERIFY',
    badge: 'Stage 02 • Document Verification & Validation',
    heading: 'Magic-byte inspection validates binary authenticity.',
    description:
      'Upload registration certificates, insurance binders, and Fitness Form 38. Magic-byte verification checks binary authenticity before file storage, identifying missing, expired, or incomplete compliance records.',
    supportingDetails: [
      {
        icon: ShieldCheck,
        title: 'Insurance validation',
        desc: 'Commercial liability and passenger risk verification.',
      },
      {
        icon: FileCheck,
        title: 'PUC records',
        desc: 'Emission certification and validity schedule alignment.',
      },
      {
        icon: Award,
        title: 'Fitness certificates',
        desc: 'Form 38 roadworthiness tracking with RTO inspection logs.',
      },
      {
        icon: Calendar,
        title: 'Permit and tax records',
        desc: 'State and interstate carriage permits with road tax vouchers.',
      },
    ],
    vehicle: {
      src: '/images/Intercity-Coach-cutout.png',
      alt: 'BharatBenz Intercity Luxury Coach Commercial Passenger Bus Cutout',
      model: 'BharatBenz Intercity Luxury Coach',
      plate: 'TN 07 BS 2024',
      classification: 'Commercial Passenger Coach (45-Seater)',
      status: '02 VERIFIED',
      specLine1: 'Seating: 45-Seater Air Suspended',
      specLine2: 'Permit: All-India Tourist Permit',
      width: 1774,
      height: 887,
    },
    metaWidget: {
      type: 'verification',
      label: 'DOCUMENT VERIFICATION MATRIX',
      tag: '4/4 COMPLIANT',
      items: [
        { name: 'Fitness Form 38', validity: 'Valid till 15 Nov 2026', status: 'Compliant' },
        { name: 'Commercial Liability Policy', validity: 'Verified %PDF-1.4', status: 'Compliant' },
        { name: 'Quarterly Road Tax', validity: 'Valid till 31 Dec 2026', status: 'Compliant' },
        { name: 'PUC Green Slip', validity: 'Valid till 28 Feb 2027', status: 'Compliant' },
      ],
      note: 'Every attached certificate is checked for validity boundaries and explicit expiry dates.',
    },
    ctaText: 'EXPLORE VERIFICATION MATRIX',
    ctaHref: '/register',
    layout: 'text-right',
  },
  {
    id: 'milestone-monitor',
    number: '03',
    label: 'MONITOR',
    badge: 'Stage 03 • Expiry Radar & Alerts',
    heading: 'Deterministic countdown calculations. Zero false validity.',
    description:
      'Continuous multi-tier calculation engine triggers countdown alerts at 30, 15, 7, and 1-day boundaries. Missing expiry dates are never assumed valid, preventing impoundment and penalty fees.',
    supportingDetails: [
      {
        icon: Clock,
        title: 'Expiry monitoring',
        desc: 'Continuous multi-tier surveillance across statutory certificate dates.',
      },
      {
        icon: AlertTriangle,
        title: 'Renewal alerts',
        desc: 'Automated threshold notifications at 30, 15, 7, and 1-day boundaries.',
      },
      {
        icon: Compass,
        title: 'Due-soon tracking',
        desc: 'Dynamic urgency scoring prioritizing at-risk commercial assets.',
      },
      {
        icon: CheckCircle2,
        title: 'Assigned renewal tasks',
        desc: 'Operational task delegation to depot managers and compliance officers.',
      },
    ],
    vehicle: {
      src: '/images/tempo-traveller-cutout.png',
      alt: 'Force Traveller Commercial Passenger Van Cutout',
      model: 'Force Traveller T2 4020',
      plate: 'TN 09 TT 4422',
      classification: 'Commercial Passenger Transport (17+D)',
      status: '03 CRITICAL RADAR',
      statusUrgent: true,
      specLine1: 'Seating: 17 + Driver Luxury Maxi Cab',
      specLine2: 'Permit: Interstate Commercial Tourist',
      width: 1536,
      height: 1024,
    },
    metaWidget: {
      type: 'monitor',
      label: 'URGENCY RADAR TELEMETRY',
      tag: '1 CRITICAL EXPIRY',
      tagUrgent: true,
      items: [
        {
          name: 'Commercial Insurance Policy',
          sub: 'TN 09 TT 4422 • Policy #88219',
          urgency: 'Expires in 24 Hours',
          urgent: true,
        },
        {
          name: 'Fitness Form 38 Inspection',
          sub: 'RTO Inspection Slot Booked',
          urgency: '7 Days Remaining',
          urgent: false,
        },
      ],
      note: 'Deterministic countdown calculations trigger proactive alerts before vehicles face impoundment.',
    },
    ctaText: 'DISCOVER EXPIRY RADAR',
    ctaHref: '/register',
    layout: 'text-left',
  },
  {
    id: 'milestone-archive',
    number: '04',
    label: 'ARCHIVE',
    badge: 'Stage 04 • Immutable History & Audit Docket',
    heading: 'Renewal completed. Antecedent certificates preserved.',
    description:
      'Completing a renewal stamps actor identity and notes. Superseded certificates remain permanently searchable for transport tax, police, and insurance audits with cryptographic integrity.',
    supportingDetails: [
      {
        icon: FileText,
        title: 'Document history',
        desc: 'Non-destructive historical log tracking each statutory renewal lifecycle.',
      },
      {
        icon: ShieldCheck,
        title: 'Superseded records',
        desc: 'Previous policies archived permanently for transport authority inspections.',
      },
      {
        icon: CheckCircle2,
        title: 'Renewal completion history',
        desc: 'Immutable timestamps with verified actor credentials and notes.',
      },
      {
        icon: Award,
        title: 'Audit trail',
        desc: 'Exportable compliance dockets prepared for regulatory review.',
      },
    ],
    vehicle: {
      src: '/images/taxi-cab.png',
      alt: 'Toyota Sedan Commercial Fleet Taxi Cutout',
      model: 'Toyota Commercial Fleet Taxi',
      plate: 'TN 02 TX 8811',
      classification: 'Commercial Passenger Fleet Taxi',
      status: '04 AUDIT SEALED',
      specLine1: 'Fuel Class: Petrol / CNG Hybrid',
      specLine2: 'Permit: City & Statewide Tourist Taxi',
      width: 1555,
      height: 1011,
    },
    metaWidget: {
      type: 'archive',
      label: 'IMMUTABLE AUDIT DOCKET',
      tag: 'AUDIT VERIFIED',
      hash: '#arc-2026-tn02-docket',
      actor: 'Selvam M. (Fleet Operations Manager)',
      timestamp: '2026-10-30 14:30 IST',
      items: [
        { label: 'Policy Confirmation', value: 'Policy #88219-R Confirmed' },
        { label: 'Validity Period', value: 'Valid through 28 Oct 2027' },
      ],
      note: 'Historical certificates remain permanently searchable for transport tax, police, and insurance audits.',
    },
    ctaText: 'VIEW AUDIT ARCHITECTURE',
    ctaHref: '/register',
    layout: 'text-right',
  },
];

export const ComplianceJourney: React.FC = () => {
  const [activeMilestone, setActiveMilestone] = useState<number>(0);
  const activeMilestoneRef = useRef<number>(0);

  // Scoped container refs
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const progressBarFillRef = useRef<HTMLDivElement>(null);
  const desktopScrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Synchronize state without re-creating timelines
  const updateActiveIndex = (newIdx: number) => {
    if (activeMilestoneRef.current !== newIdx) {
      activeMilestoneRef.current = newIdx;
      setActiveMilestone(newIdx);
    }
  };

  // Interactive navigation click handler
  const handleMilestoneClick = (index: number) => {
    updateActiveIndex(index);

    if (isReducedMotion()) {
      return;
    }

    if (window.innerWidth >= 768 && desktopScrollTriggerRef.current) {
      const st = desktopScrollTriggerRef.current;
      const totalDistance = st.end - st.start;
      // 4 milestones spaced evenly across scroll duration
      const scrollTargets = [0.05, 0.35, 0.65, 0.95];
      const targetScroll = st.start + scrollTargets[index] * totalDistance;

      gsap.to(window, {
        scrollTo: targetScroll,
        duration: 0.85,
        ease: 'power2.inOut',
      });
    } else {
      const el = document.getElementById(`mobile-milestone-card-${index}`);
      if (el) {
        gsap.to(window, {
          scrollTo: { y: el, offsetY: 80 },
          duration: 0.7,
          ease: 'power2.inOut',
        });
      }
    }
  };

  useGSAP(
    () => {
      if (typeof window === 'undefined' || !containerRef.current) return;
      const reduced = isReducedMotion();

      // ─────────────────────────────────────────────────────────────
      // A. SECTION HEADER & NAVIGATION REVEAL (Responsive)
      // ─────────────────────────────────────────────────────────────
      if (!reduced && headerRef.current) {
        const headerTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        });

        headerTl
          .fromTo(
            '.journey-header-badge',
            { opacity: 0, y: -16 },
            { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }
          )
          .fromTo(
            '.journey-header-title',
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' },
            '-=0.35'
          )
          .fromTo(
            '.journey-header-desc',
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
            '-=0.45'
          )
          .fromTo(
            '.journey-nav-pill',
            { opacity: 0, y: 14, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, stagger: 0.08, duration: 0.5, ease: 'power2.out' },
            '-=0.35'
          )
          .fromTo(
            '.journey-progress-track',
            { opacity: 0, scaleX: 0.9 },
            { opacity: 1, scaleX: 1, duration: 0.5, ease: 'power2.out' },
            '-=0.3'
          );
      }

      // ─────────────────────────────────────────────────────────────
      // B. RESPONSIVE ANIMATIONS: PINNED STORYTELLING DECK (md+)
      // ─────────────────────────────────────────────────────────────
      const mm = gsap.matchMedia();

      // 1. PINNED STORYTELLING MODE (min-width: 768px for all tablets, laptops & desktops)
      mm.add('(min-width: 768px)', () => {
        if (reduced) {
          gsap.set('.desktop-milestone-card', { opacity: 1, y: 0, scale: 1 });
          return;
        }

        // Set initial card visibility: Card 0 active and visible, 1-3 hidden
        gsap.set('.desktop-card-0', { opacity: 1, y: 0, pointerEvents: 'auto', zIndex: 10 });
        gsap.set(['.desktop-card-1', '.desktop-card-2', '.desktop-card-3'], {
          opacity: 0,
          y: 20,
          pointerEvents: 'none',
          zIndex: 1,
        });

        // Pinned Storytelling Master Scrub Timeline: Locks container still in viewport
        const masterTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            pin: true,
            pinSpacing: true,
            start: 'top top',
            end: '+=2800',
            scrub: 0.8,
            anticipatePin: 1,
            onUpdate: (self) => {
              const p = self.progress;
              let currentStage = 0;
              if (p < 0.25) currentStage = 0;
              else if (p < 0.50) currentStage = 1;
              else if (p < 0.75) currentStage = 2;
              else currentStage = 3;

              updateActiveIndex(currentStage);

              // Update scrubbed progress bar
              if (progressBarFillRef.current) {
                const fillPercent = Math.min(100, Math.max(5, p * 100));
                progressBarFillRef.current.style.width = `${fillPercent}%`;
              }
            },
          },
        });

        desktopScrollTriggerRef.current = masterTimeline.scrollTrigger ?? null;

        // --- STAGE 0: Hold Card 0 (Ashok Leyland Lorry Cutout) ---
        masterTimeline.to(
          '.desktop-vehicle-0',
          { y: -6, scale: 1.02, duration: 2, ease: 'none' },
          0
        );

        // --- TRANSITION 0 -> 1: Card 0 (Lorry) exits, Card 1 (Intercity Coach) enters ---
        masterTimeline
          .addLabel('trans-0-1', 2.0)
          .to('.desktop-card-0', { opacity: 0, y: -20, duration: 1.0, ease: 'power2.in' }, 'trans-0-1')
          .set('.desktop-card-0', { pointerEvents: 'none', zIndex: 1 }, 'trans-0-1+=1.0')
          .set('.desktop-card-1', { pointerEvents: 'auto', zIndex: 10 }, 'trans-0-1+=0.5')
          .fromTo(
            '.desktop-card-1',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' },
            'trans-0-1+=0.5'
          )
          .fromTo(
            '.desktop-vehicle-1',
            { opacity: 0, scale: 0.95, y: 25 },
            { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power3.out' },
            'trans-0-1+=0.6'
          );

        // --- STAGE 1: Hold Card 1 (Intercity Coach Cutout) ---
        masterTimeline.to(
          '.desktop-vehicle-1',
          { y: -6, scale: 1.02, duration: 2, ease: 'none' },
          3.5
        );

        // --- TRANSITION 1 -> 2: Card 1 (Coach) exits, Card 2 (Tempo Traveller) enters ---
        masterTimeline
          .addLabel('trans-1-2', 5.5)
          .to('.desktop-card-1', { opacity: 0, y: -20, duration: 1.0, ease: 'power2.in' }, 'trans-1-2')
          .set('.desktop-card-1', { pointerEvents: 'none', zIndex: 1 }, 'trans-1-2+=1.0')
          .set('.desktop-card-2', { pointerEvents: 'auto', zIndex: 10 }, 'trans-1-2+=0.5')
          .fromTo(
            '.desktop-card-2',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' },
            'trans-1-2+=0.5'
          )
          .fromTo(
            '.desktop-vehicle-2',
            { opacity: 0, scale: 0.95, y: 25 },
            { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power3.out' },
            'trans-1-2+=0.6'
          );

        // --- STAGE 2: Hold Card 2 (Tempo Traveller Cutout) ---
        masterTimeline.to(
          '.desktop-vehicle-2',
          { y: -6, scale: 1.02, duration: 2, ease: 'none' },
          7.0
        );

        // --- TRANSITION 2 -> 3: Card 2 (Tempo) exits, Card 3 (Sedan Taxi) enters ---
        masterTimeline
          .addLabel('trans-2-3', 9.0)
          .to('.desktop-card-2', { opacity: 0, y: -20, duration: 1.0, ease: 'power2.in' }, 'trans-2-3')
          .set('.desktop-card-2', { pointerEvents: 'none', zIndex: 1 }, 'trans-2-3+=1.0')
          .set('.desktop-card-3', { pointerEvents: 'auto', zIndex: 10 }, 'trans-2-3+=0.5')
          .fromTo(
            '.desktop-card-3',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' },
            'trans-2-3+=0.5'
          )
          .fromTo(
            '.desktop-vehicle-3',
            { opacity: 0, scale: 0.95, y: 25 },
            { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power3.out' },
            'trans-2-3+=0.6'
          );

        // --- STAGE 3: Hold Card 3 (Sedan Taxi Cutout) ---
        masterTimeline.to(
          '.desktop-vehicle-3',
          { y: -6, scale: 1.02, duration: 2, ease: 'none' },
          10.5
        );
      });

      // 2. MOBILE STREAM MODE (max-width: 767px)
      mm.add('(max-width: 767px)', () => {
        if (reduced) return;

        MILESTONES.forEach((_, idx) => {
          const cardEl = document.getElementById(`mobile-milestone-card-${idx}`);
          if (!cardEl) return;

          // Sequential Entrance for each mobile card
          const mobileTl = gsap.timeline({
            scrollTrigger: {
              trigger: cardEl,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          });

          mobileTl
            .fromTo(
              cardEl.querySelector('.mobile-vehicle-img'),
              { opacity: 0, y: 55, scale: 0.9 },
              { opacity: 1, y: 0, scale: 1, duration: 0.95, ease: 'power3.out' }
            )
            .fromTo(
              cardEl.querySelectorAll('.mobile-reveal-item'),
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, stagger: 0.06, duration: 0.65, ease: 'power2.out' },
              '-=0.6'
            );

          // Update active milestone indicator as user scrolls
          ScrollTrigger.create({
            trigger: cardEl,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => updateActiveIndex(idx),
            onEnterBack: () => updateActiveIndex(idx),
          });
        });
      });

      return () => {
        mm.revert();
      };
    },
    { scope: containerRef }
  );

  return (
    <section
      id="compliance-journey"
      ref={containerRef}
      className="relative bg-black text-white md:h-screen md:max-h-screen flex flex-col justify-center pt-18 pb-6 md:pt-20 md:pb-6 border-b border-graphite overflow-hidden selection:bg-golden selection:text-black"
    >
      {/* Background Ambience: Subtle Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top,rgba(230,178,60,0.12),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex flex-col justify-between md:justify-center relative z-10">
        {/* ─────────────────────────────────────────────────────────────
            1. SECTION HEADER & INTERACTIVE NAVIGATION
        ───────────────────────────────────────────────────────────── */}
        <div ref={headerRef} className="journey-header text-center max-w-4xl mx-auto mb-3 md:mb-5 shrink-0">
          {/* Category Badge */}
          <div className="journey-header-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-graphite/60 border border-golden/30 text-golden text-[11px] font-semibold font-mono tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5 text-golden" />
            <span>FLEET COMPLIANCE LIFECYCLE</span>
          </div>

          {/* Editorial Title */}
          <h2 className="journey-header-title text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ivory font-heading tracking-tight leading-tight">
            The Complete Vehicle Compliance Journey
          </h2>

          {/* Subtitle */}
          <p className="journey-header-desc mt-1.5 text-xs sm:text-sm text-sand max-w-2xl mx-auto leading-normal">
            From initial vehicle onboarding and document verification to proactive expiry monitoring
            and audit-proof historical archiving.
          </p>

          {/* Milestone Tabs Navigation */}
          <div className="mt-3.5 flex flex-col items-center">
            <div
              role="tablist"
              aria-label="Vehicle Compliance Milestones"
              className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-1 rounded-2xl bg-graphite/40 border border-graphite/70"
            >
              {MILESTONES.map((m, idx) => {
                const isActive = activeMilestone === idx;
                return (
                  <button
                    key={m.id}
                    role="tab"
                    id={`milestone-tab-${idx}`}
                    aria-selected={isActive}
                    aria-controls={`milestone-panel-${idx}`}
                    onClick={() => handleMilestoneClick(idx)}
                    className={`journey-nav-pill px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold font-mono transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-golden text-black shadow-[0_0_15px_rgba(230,178,60,0.35)] scale-102 border border-golden'
                        : 'bg-transparent text-sand hover:text-white hover:bg-graphite/60 border border-transparent'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-black' : 'bg-sand/40'
                      }`}
                    />
                    <span>
                      {m.number} {m.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Segmented Progress Line aligned with tab pill box */}
            <div className="journey-progress-track mt-2 w-full max-w-md h-1 bg-graphite/80 rounded-full overflow-hidden border border-graphite/40">
              <div
                ref={progressBarFillRef}
                className="h-full bg-golden transition-all duration-150 ease-out rounded-full"
                style={{ width: `${(activeMilestone + 1) * 25}%` }}
              />
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. PINNED STORYTELLING DECK (md:grid)
        ───────────────────────────────────────────────────────────── */}
        <div className="hidden md:grid grid-cols-1 grid-rows-1 relative items-center w-full my-auto">
          {MILESTONES.map((m, idx) => {
            return (
              <div
                key={m.id}
                id={`milestone-panel-${idx}`}
                role="tabpanel"
                aria-labelledby={`milestone-tab-${idx}`}
                className={`desktop-milestone-card desktop-card-${idx} col-start-1 row-start-1 w-full rounded-2xl bg-black/95 border border-graphite/80 p-5 lg:p-7 xl:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.95)] relative overflow-hidden transition-opacity`}
              >
                {/* Subtle Ambient Radial Spotlight behind Vehicle */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 left-8 w-[420px] h-[360px] pointer-events-none rounded-full blur-3xl opacity-25 bg-golden/20"
                />

                {/* Technical Watermark Coordinates */}
                <div className="absolute top-4 right-6 text-[10px] font-mono text-sand/40 tracking-widest uppercase flex items-center gap-2">
                  <span>SPEC // RADAR-{m.number}</span>
                  <span className="w-1 h-1 rounded-full bg-golden/50" />
                  <span>FLEET-COMPLIANCE-SYSTEM</span>
                </div>

                {/* Balanced Consistent Two-Column Grid: Vehicle Left, Text Right across all 4 stages */}
                <div className="grid grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
                  {/* ── LEFT COLUMN: VEHICLE HERO STAGE ── */}
                  <div className="col-span-5 min-w-0">
                    <VehicleHeroStage milestone={m} index={idx} isDesktop />
                  </div>

                  {/* ── RIGHT COLUMN: TEXT & METRICS CONTENT ── */}
                  <div className="col-span-7 min-w-0">
                    <TextColumnContent milestone={m} index={idx} isDesktop />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. MOBILE EDITORIAL STREAM (md:hidden)
        ───────────────────────────────────────────────────────────── */}
        <div className="md:hidden space-y-10 sm:space-y-12">
          {MILESTONES.map((m, idx) => (
            <div
              key={m.id}
              id={`mobile-milestone-card-${idx}`}
              className="rounded-3xl bg-black border border-graphite/80 p-6 sm:p-8 shadow-dropdown relative overflow-hidden"
            >
              {/* Top Milestone Badge */}
              <div className="flex items-center justify-between border-b border-graphite/50 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-golden" />
                  <span className="font-mono text-xs font-bold text-golden uppercase tracking-wider">
                    {m.number} • {m.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-sand/60 uppercase">
                  {m.vehicle.status}
                </span>
              </div>

              {/* Vehicle Cutout (Centered Hero) */}
              <div className="relative py-4 flex flex-col items-center justify-center">
                <div className="w-full max-w-[420px] aspect-[16/10] flex items-center justify-center relative">
                  <img
                    src={m.vehicle.src}
                    alt={m.vehicle.alt}
                    className="mobile-vehicle-img w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.95)]"
                    width={m.vehicle.width}
                    height={m.vehicle.height}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                  {/* Ground Contact Shadow */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-5 bg-black/90 blur-lg rounded-[100%] pointer-events-none" />
                </div>

                {/* Identity Bar */}
                <div className="mobile-reveal-item mt-4 w-full bg-graphite/70 border border-graphite px-4 py-2.5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-golden font-bold block text-sm">
                      {m.vehicle.plate}
                    </span>
                    <span className="text-sand text-[11px] block">{m.vehicle.model}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      m.vehicle.statusUrgent
                        ? 'bg-racing/20 text-racing border border-racing/40'
                        : 'bg-golden/10 text-golden border border-golden/30'
                    }`}
                  >
                    {m.vehicle.status}
                  </span>
                </div>
              </div>

              {/* Main Typography */}
              <div className="mt-6 space-y-4 text-left">
                <h3 className="mobile-reveal-item text-2xl font-bold text-ivory font-heading leading-snug">
                  {m.heading}
                </h3>
                <p className="mobile-reveal-item text-sm text-sand leading-relaxed">
                  {m.description}
                </p>

                {/* Supporting Details List */}
                <div className="mobile-reveal-item grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {m.supportingDetails.map((detail, dIdx) => {
                    const Icon = detail.icon;
                    return (
                      <div
                        key={dIdx}
                        className="p-3 rounded-xl bg-graphite/40 border border-graphite/60 flex items-start gap-2.5 text-xs"
                      >
                        <div className="p-1 rounded bg-black border border-golden/30 shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5 text-golden" />
                        </div>
                        <div>
                          <span className="font-bold text-white block text-xs">{detail.title}</span>
                          <span className="text-[11px] text-sand/80 leading-normal block mt-0.5">
                            {detail.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Telemetry Micro-Widget */}
                <div className="mobile-reveal-item pt-2">
                  <TelemetryWidget widget={m.metaWidget} />
                </div>

                {/* Mobile CTA */}
                <div className="mobile-reveal-item pt-3">
                  <Link
                    to={m.ctaHref}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-graphite hover:bg-graphite/80 text-golden hover:text-white font-mono text-xs font-bold border border-golden/30 transition-colors w-full justify-center"
                  >
                    <span>{m.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS FOR CLEAN ARCHITECTURE & DATA DRIVEN REUSE
// ─────────────────────────────────────────────────────────────

interface ColumnProps {
  milestone: MilestoneItem;
  index: number;
  isDesktop?: boolean;
}

const TextColumnContent: React.FC<ColumnProps> = ({ milestone: m, index: idx }) => {
  return (
    <div className={`desktop-text-${idx} space-y-3 text-left`}>
      {/* Category Stage Badge */}
      <div className={`desktop-reveal-${idx} flex items-center gap-2`}>
        <span className="w-2 h-2 rounded-full bg-golden" />
        <span className="text-[11px] font-mono font-bold text-golden uppercase tracking-wider">
          {m.badge}
        </span>
      </div>

      {/* Primary Headline */}
      <h3
        className={`desktop-reveal-${idx} text-xl lg:text-2xl font-extrabold text-ivory font-heading tracking-tight leading-snug`}
      >
        {m.heading}
      </h3>

      {/* Description */}
      <p className={`desktop-reveal-${idx} text-xs lg:text-sm text-sand leading-relaxed line-clamp-3`}>
        {m.description}
      </p>

      {/* Technical Telemetry / Specification Micro-Widget */}
      <div className={`desktop-reveal-${idx} pt-0.5`}>
        <TelemetryWidget widget={m.metaWidget} />
      </div>

      {/* Key Supporting Details in Clean Row + CTA */}
      <div className={`desktop-reveal-${idx} flex flex-wrap items-center justify-between gap-3 pt-1`}>
        <div className="flex items-center gap-2 text-xs text-sand/80">
          {m.supportingDetails.slice(0, 2).map((detail, dIdx) => (
            <div key={dIdx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-graphite/40 border border-graphite/60">
              <span className="w-1.5 h-1.5 rounded-full bg-golden" />
              <span className="text-white font-medium text-[11px]">{detail.title}</span>
            </div>
          ))}
        </div>

        <Link
          to={m.ctaHref}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-graphite hover:bg-graphite/80 text-golden hover:text-white font-mono text-xs font-bold border border-golden/40 transition-all hover:shadow-[0_0_15px_rgba(230,178,60,0.25)] hover:border-golden"
        >
          <span>{m.ctaText}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
};

const VehicleHeroStage: React.FC<ColumnProps> = ({ milestone: m, index: idx }) => {
  return (
    <div className="flex flex-col items-center justify-center relative w-full">
      {/* Vehicle Stage Box */}
      <div className="w-full relative py-2 flex items-center justify-center">
        {/* Transparent Cutout Image */}
        <div className="w-full aspect-[16/10] max-h-[220px] lg:max-h-[260px] xl:max-h-[280px] flex items-center justify-center relative">
          <img
            src={m.vehicle.src}
            alt={m.vehicle.alt}
            className={`desktop-vehicle-${idx} w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)]`}
            width={m.vehicle.width}
            height={m.vehicle.height}
            loading={idx === 0 ? 'eager' : 'lazy'}
          />

          {/* Ground Contact Shadow */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-black/95 blur-md rounded-[100%] pointer-events-none" />
        </div>
      </div>

      {/* Vehicle Specification Identity HUD Badge */}
      <div className={`desktop-reveal-${idx} w-full mt-2 bg-graphite/40 border border-graphite/80 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs backdrop-blur-sm shadow-dropdown`}>
        <div className="min-w-0 pr-2">
          <span className="font-mono text-golden font-bold block text-sm tracking-wider">
            {m.vehicle.plate}
          </span>
          <span className="text-sand text-[11px] block mt-0.5 truncate">
            {m.vehicle.model} • {m.vehicle.classification}
          </span>
          <span className="text-sand/60 text-[10px] font-mono block mt-0.5 truncate">
            {m.vehicle.specLine1} • {m.vehicle.specLine2}
          </span>
        </div>

        <span
          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider shrink-0 ${
            m.vehicle.statusUrgent
              ? 'bg-racing/20 text-racing border border-racing/50'
              : 'bg-golden/10 text-golden border border-golden/30'
          }`}
        >
          {m.vehicle.status}
        </span>
      </div>
    </div>
  );
};

interface TelemetryProps {
  widget: MilestoneItem['metaWidget'];
}

const TelemetryWidget: React.FC<TelemetryProps> = ({ widget: w }) => {
  if (w.type === 'normalization') {
    return (
      <div className="p-2.5 rounded-xl bg-graphite/40 border border-graphite/70 text-xs font-mono text-sand space-y-1.5">
        <div className="flex items-center justify-between border-b border-graphite/40 pb-1 text-[10px]">
          <span className="text-sand/70 uppercase tracking-wider">{w.label}</span>
          <span className="text-golden font-bold">{w.tag}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-sand/60 text-[11px]">Input:</span>
            <span className="text-racing font-bold px-1.5 py-0.5 rounded bg-black/50 border border-racing/30">
              "{w.rawInput}"
            </span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-golden shrink-0" />
          <div className="flex items-center gap-1.5">
            <span className="text-sand/60 text-[11px]">Stored:</span>
            <span className="text-golden font-bold px-1.5 py-0.5 rounded bg-black/50 border border-golden/30">
              "{w.normalized}"
            </span>
          </div>
        </div>
        <p className="text-[10px] font-sans text-sand/60 leading-tight pt-0.5 border-t border-graphite/30">
          {w.note}
        </p>
      </div>
    );
  }

  if (w.type === 'verification') {
    return (
      <div className="p-2.5 rounded-xl bg-graphite/40 border border-graphite/70 text-xs font-mono space-y-1.5">
        <div className="flex items-center justify-between border-b border-graphite/40 pb-1 text-[10px]">
          <span className="text-sand/70 uppercase tracking-wider">{w.label}</span>
          <span className="text-golden font-bold bg-golden/10 px-2 py-0.5 rounded">
            {w.tag}
          </span>
        </div>
        <div className="space-y-1">
          {w.items?.slice(0, 3).map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-[11px] p-1.5 rounded bg-black/40 border border-graphite/40"
            >
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-golden" />
                <span className="text-white font-sans">{item.name}</span>
              </div>
              <span className="text-golden font-mono text-[10px]">{item.validity}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] font-sans text-sand/60 leading-tight pt-0.5">
          {w.note}
        </p>
      </div>
    );
  }

  if (w.type === 'monitor') {
    return (
      <div className="p-2.5 rounded-xl bg-graphite/40 border border-graphite/70 text-xs font-mono space-y-1.5">
        <div className="flex items-center justify-between border-b border-graphite/40 pb-1 text-[10px]">
          <span className="text-sand/70 uppercase tracking-wider">{w.label}</span>
          <span className="text-racing font-bold bg-racing/10 px-2 py-0.5 rounded border border-racing/30">
            {w.tag}
          </span>
        </div>
        <div className="space-y-1.5">
          {w.items?.map((item, i) => (
            <div
              key={i}
              className={`p-1.5 rounded-lg flex items-center justify-between text-[11px] ${
                item.urgent
                  ? 'bg-racing/10 border border-racing/40 text-racing'
                  : 'bg-black/40 border border-golden/30 text-golden'
              }`}
            >
              <div className="flex items-center gap-2">
                {item.urgent ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-racing shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-golden shrink-0" />
                )}
                <div>
                  <span className="font-bold text-white block font-sans">{item.name}</span>
                  <span className="text-[10px] text-sand/70 block">{item.sub}</span>
                </div>
              </div>
              <span className="font-mono font-bold text-[10px] shrink-0">{item.urgency}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] font-sans text-sand/60 leading-tight pt-0.5">
          {w.note}
        </p>
      </div>
    );
  }

  if (w.type === 'archive') {
    return (
      <div className="p-2.5 rounded-xl bg-graphite/40 border border-graphite/70 text-xs font-mono space-y-1.5">
        <div className="flex items-center justify-between border-b border-graphite/40 pb-1 text-[10px]">
          <span className="text-sand/70 uppercase tracking-wider">{w.label}</span>
          <span className="text-golden font-bold bg-golden/10 px-2 py-0.5 rounded border border-golden/30">
            {w.tag}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-black/50 border border-golden/30 space-y-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white font-sans">Policy #88219 Renewal Confirmed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-golden shrink-0" />
          </div>
          <p className="text-sand/80 text-[10px] font-sans leading-tight">
            Valid through 28 Oct 2027. Superseded record sealed under hash{' '}
            <span className="text-golden font-mono">{w.hash}</span>.
          </p>
          <div className="pt-1 border-t border-graphite/40 flex items-center justify-between text-[10px] text-sand/70">
            <span>Actor: <strong className="text-golden font-mono">{w.actor}</strong></span>
            <span>{w.timestamp}</span>
          </div>
        </div>
        <p className="text-[10px] font-sans text-sand/60 leading-tight pt-0.5">
          {w.note}
        </p>
      </div>
    );
  }

  return null;
};

export default ComplianceJourney;

