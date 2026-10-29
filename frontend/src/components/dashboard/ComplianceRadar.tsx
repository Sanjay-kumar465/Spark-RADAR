import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  Info,
  Truck,
} from 'lucide-react';
import { useGSAP, gsap, isReducedMotion } from '../../animations/gsap';
import type { Vehicle } from '../../types';
import { getVehicleImage } from '../../utils/vehicleImages';

interface ComplianceRadarProps {
  vehicles: Vehicle[];
  loading?: boolean;
}

interface RadarMarker {
  vehicle: Vehicle;
  cx: number;
  cy: number;
  angle: number;
  radius: number;
  urgency: 'CRITICAL' | 'ATTENTION' | 'INCOMPLETE' | 'COMPLIANT';
  label: string;
  obligation: string;
}

export const ComplianceRadar: React.FC<ComplianceRadarProps> = ({ vehicles }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sweepGroupRef = useRef<SVGGElement>(null);
  const telemetryHudRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Interaction State: Persistent click selection vs. transient hover preview
  const [selectedMarker, setSelectedMarker] = useState<RadarMarker | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<RadarMarker | null>(null);

  // Deterministically position markers based on urgency (radius) and registration string (angle)
  const markers: RadarMarker[] = useMemo(() => {
    const center = 250;
    return vehicles.map((v, idx) => {
      // Deterministic angle from registration string hash
      let hash = 0;
      const str = v.registration_number || v.id || `veh-${idx}`;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      const absHash = Math.abs(hash);

      // Distribute evenly if small set, plus deterministic hash jitter
      const baseAngle = vehicles.length > 0 ? (idx / vehicles.length) * 360 : 0;
      const jitter = (absHash % 28) - 14;
      const angleDeg = (baseAngle + jitter + 360) % 360;
      const angleRad = (angleDeg * Math.PI) / 180;

      // Deterministic radius by compliance severity
      let r = 212; // default compliant perimeter
      const urgency = (v.attention_status as RadarMarker['urgency']) || 'COMPLIANT';

      if (urgency === 'CRITICAL') {
        r = 55 + (absHash % 25); // Inner circle (55 - 80px)
      } else if (urgency === 'ATTENTION') {
        r = 105 + (absHash % 32); // Middle circle (105 - 137px)
      } else if (urgency === 'INCOMPLETE') {
        r = 155 + (absHash % 25); // Incomplete / Missing evidence (155 - 180px)
      } else {
        r = 198 + (absHash % 18); // Compliant perimeter (198 - 216px)
      }

      const cx = center + r * Math.cos(angleRad);
      const cy = center + r * Math.sin(angleRad);

      let obligation = 'All obligations compliant';
      if (v.expired_count > 0) {
        obligation = `${v.expired_count} Expired Certificate${v.expired_count > 1 ? 's' : ''}`;
      } else if (v.due_soon_count > 0) {
        obligation = `${v.due_soon_count} Renewal${v.due_soon_count > 1 ? 's' : ''} Due Soon (<=30d)`;
      } else if (v.missing_count > 0) {
        obligation = `${v.missing_count} Document${v.missing_count > 1 ? 's' : ''} Pending Verification`;
      }

      return {
        vehicle: v,
        cx,
        cy,
        angle: angleDeg,
        radius: r,
        urgency,
        label: v.registration_number,
        obligation,
      };
    });
  }, [vehicles]);

  // Default vehicle fallback: automatically select the most urgent fleet unit if neither clicked nor hovered
  const defaultMarker = useMemo(() => {
    if (markers.length === 0) return null;
    const critical = markers.find((m) => m.urgency === 'CRITICAL');
    if (critical) return critical;
    const attention = markers.find((m) => m.urgency === 'ATTENTION');
    if (attention) return attention;
    const incomplete = markers.find((m) => m.urgency === 'INCOMPLETE');
    if (incomplete) return incomplete;
    return markers[0];
  }, [markers]);

  // The active inspection item:
  // 1. hoveredMarker during mouseover / focus preview
  // 2. selectedMarker when locked by click / Enter
  // 3. defaultMarker (most urgent vehicle in fleet) so HUD is never blank
  const activeInspection = hoveredMarker || selectedMarker || defaultMarker;
  const isSelectedLocked = Boolean(selectedMarker && (!hoveredMarker || hoveredMarker.vehicle.id === selectedMarker.vehicle.id));
  const isHoverPreview = Boolean(hoveredMarker && (!selectedMarker || hoveredMarker.vehicle.id !== selectedMarker.vehicle.id));
  const isDefaultInspection = !hoveredMarker && !selectedMarker && Boolean(defaultMarker);

  // GSAP continuous radar sweep animation rotating around exact SVG origin (250, 250)
  useGSAP(
    () => {
      if (isReducedMotion() || !sweepGroupRef.current) return;

      tweenRef.current = gsap.to(sweepGroupRef.current, {
        rotation: 360,
        svgOrigin: '250 250',
        duration: 6.5,
        repeat: -1,
        ease: 'none',
      });

      // Gracefully pause rotation when document tab is hidden / backgrounded
      const handleVisibilityChange = () => {
        if (document.hidden) {
          tweenRef.current?.pause();
        } else {
          tweenRef.current?.play();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        tweenRef.current?.kill();
      };
    },
    { scope: containerRef }
  );

  // Subtle telemetry HUD entrance transition on active vehicle change
  useEffect(() => {
    if (!telemetryHudRef.current || isReducedMotion()) return;
    gsap.fromTo(
      telemetryHudRef.current,
      { opacity: 0.85, y: 4 },
      { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
    );
  }, [activeInspection?.vehicle.id]);

  const activeVehicleImage = activeInspection
    ? getVehicleImage(
        activeInspection.vehicle.vehicle_category, { preferCutout: true }
      )
    : null;

  return (
    <div
      ref={containerRef}
      className="rounded-3xl bg-black border border-graphite p-6 sm:p-8 shadow-dropdown relative overflow-hidden"
    >
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-graphite/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-graphite border border-golden/30 text-golden text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-golden animate-ping" />
            <span>Live Compliance Radar</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
            Fleet Obligation & Expiry Radar
          </h2>
          <p className="text-xs sm:text-sm text-sand mt-0.5">
            Real-time radial proximity visualization. Inner ring reflects critical overdue items; outer ring indicates compliant vehicles.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-graphite border border-racing/40 text-racing font-bold">
            <span className="w-2 h-2 rounded-full bg-racing" />
            <span>Critical / Overdue</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-graphite border border-golden/40 text-golden font-bold">
            <span className="w-2 h-2 rounded-full bg-golden" />
            <span>Due Soon (&le;30d)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-graphite border border-sand/40 text-sand font-bold">
            <span className="w-2 h-2 rounded-full bg-sand" />
            <span>Missing / Incomplete</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-graphite border border-stone-dark text-txt-muted font-bold">
            <span className="w-2 h-2 rounded-full bg-txt-muted" />
            <span>Compliant</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
        {/* Radar SVG Visualizer */}
        <div className="lg:col-span-7 flex justify-center relative select-none">
          <svg
            viewBox="0 0 500 500"
            className="w-full max-w-[440px] sm:max-w-[480px] aspect-square overflow-visible"
            aria-label="Interactive Fleet Compliance Radar"
          >
            <defs>
              {/* Radial gradient for sweep wedge anchored at exact SVG center (250, 250) */}
              <radialGradient
                id="radarSweepGradient"
                cx="250"
                cy="250"
                r="235"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#E6B23C" stopOpacity="0.4" />
                <stop offset="65%" stopColor="#E6B23C" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#E6B23C" stopOpacity="0.01" />
              </radialGradient>

              {/* Boundary clip path confining all radar sweeps inside the 235px disc */}
              <clipPath id="radarBoundaryClip">
                <circle cx="250" cy="250" r="235" />
              </clipPath>

              {/* Marker glow filters */}
              <filter id="criticalGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#B41E2D" />
              </filter>
              <filter id="goldenGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#E6B23C" />
              </filter>
            </defs>

            {/* Background disc */}
            <circle cx="250" cy="250" r="235" fill="#0d0f12" stroke="#1F2226" strokeWidth="2" />

            {/* Concentric rings representing urgency tiers */}
            {/* Zone 1: Critical Ring (r=85) */}
            <circle
              cx="250"
              cy="250"
              r="85"
              fill="rgba(180, 30, 45, 0.06)"
              stroke="#B41E2D"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              opacity="0.65"
            />
            {/* Zone 2: Attention / Due Soon Ring (r=145) */}
            <circle
              cx="250"
              cy="250"
              r="145"
              fill="rgba(230, 178, 60, 0.03)"
              stroke="#E6B23C"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.55"
            />
            {/* Zone 3: Incomplete / Missing Evidence Ring (r=185) */}
            <circle
              cx="250"
              cy="250"
              r="185"
              fill="none"
              stroke="#C7B394"
              strokeWidth="1"
              strokeDasharray="2 3"
              opacity="0.4"
            />
            {/* Zone 4: Compliant Perimeter (r=220) */}
            <circle
              cx="250"
              cy="250"
              r="220"
              fill="none"
              stroke="#4A5056"
              strokeWidth="1"
              opacity="0.35"
            />

            {/* Crosshair Axes */}
            <line x1="250" y1="15" x2="250" y2="485" stroke="#1F2226" strokeWidth="1.5" />
            <line x1="15" y1="250" x2="485" y2="250" stroke="#1F2226" strokeWidth="1.5" />
            <line x1="84" y1="84" x2="416" y2="416" stroke="#1F2226" strokeWidth="0.8" strokeDasharray="2 4" />
            <line x1="84" y1="416" x2="416" y2="84" stroke="#1F2226" strokeWidth="0.8" strokeDasharray="2 4" />

            {/* Zone Distance Labels */}
            <text x="254" y="172" fill="#B41E2D" fontSize="8" fontFamily="monospace" fontWeight="bold">
              &lt;= 0d OVERDUE
            </text>
            <text x="254" y="112" fill="#E6B23C" fontSize="8" fontFamily="monospace" fontWeight="bold">
              1 - 30d DUE SOON
            </text>
            <text x="254" y="72" fill="#C7B394" fontSize="8" fontFamily="monospace">
              MISSING EVIDENCE
            </text>
            <text x="254" y="38" fill="#7A8288" fontSize="8" fontFamily="monospace">
              COMPLIANT (&gt;30d)
            </text>

            {/* Conventional Rotating Radar Sweep (Confined by boundary clipPath) */}
            <g clipPath="url(#radarBoundaryClip)">
              <g ref={sweepGroupRef}>
                {/* Translucent trailing wedge (arc behind leading edge, fading counter-clockwise) */}
                <path
                  d="M 250 250 L 250 15 A 235 235 0 0 0 115 57 Z"
                  fill="url(#radarSweepGradient)"
                  opacity="0.85"
                />
                {/* Thin gold radial sweep line extending from center to edge */}
                <line
                  x1="250"
                  y1="250"
                  x2="250"
                  y2="15"
                  stroke="#E6B23C"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  opacity="0.95"
                />
              </g>
            </g>

            {/* Radar Center Hub Anchor */}
            <circle cx="250" cy="250" r="16" fill="#000000" stroke="#E6B23C" strokeWidth="2.5" />
            <circle cx="250" cy="250" r="5" fill="#E6B23C" />

            {/* Interactive Vehicle Markers */}
            {markers.map((m) => {
              const isSelected = selectedMarker?.vehicle.id === m.vehicle.id;
              const isHovered = hoveredMarker?.vehicle.id === m.vehicle.id;
              const isDefault = isDefaultInspection && defaultMarker?.vehicle.id === m.vehicle.id;
              const isInspected = isSelected || isHovered || isDefault;

              const isCritical = m.urgency === 'CRITICAL';
              const isAttention = m.urgency === 'ATTENTION';

              const fillColor = isCritical
                ? '#B41E2D'
                : isAttention
                ? '#E6B23C'
                : m.urgency === 'INCOMPLETE'
                ? '#C7B394'
                : '#7A8288';

              return (
                <g
                  key={m.vehicle.id}
                  transform={`translate(${m.cx}, ${m.cy})`}
                  className="cursor-pointer focus:outline-none"
                  tabIndex={0}
                  role="button"
                  aria-label={`Vehicle ${m.vehicle.registration_number}: ${m.obligation}`}
                  onMouseEnter={() => setHoveredMarker(m)}
                  onMouseLeave={() => setHoveredMarker(null)}
                  onFocus={() => setHoveredMarker(m)}
                  onBlur={() => setHoveredMarker(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMarker((prev) => (prev?.vehicle.id === m.vehicle.id ? null : m));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedMarker((prev) => (prev?.vehicle.id === m.vehicle.id ? null : m));
                    }
                  }}
                >
                  {/* Persistent Selection Gold Halo */}
                  {isSelected && (
                    <circle
                      r="15"
                      fill="none"
                      stroke="#E6B23C"
                      strokeWidth="2"
                      strokeDasharray="3 2"
                      className="animate-spin"
                      style={{ transformOrigin: '0 0', animationDuration: '8s' }}
                    />
                  )}

                  {/* Subtle Ping Wave for Critical or Actively Selected Vehicles */}
                  {(isCritical || isSelected) && (
                    <circle
                      r={isSelected ? 16 : 11}
                      fill="none"
                      stroke={fillColor}
                      strokeWidth="1.5"
                      opacity="0.6"
                      className="animate-ping"
                    />
                  )}

                  {/* Marker Dot */}
                  <circle
                    r={isSelected ? 8.5 : isInspected ? 7.5 : isCritical ? 6.5 : 5.5}
                    fill={fillColor}
                    stroke={isSelected ? '#E6B23C' : '#000000'}
                    strokeWidth={isSelected ? 2 : 1.5}
                    filter={isCritical ? 'url(#criticalGlow)' : isAttention ? 'url(#goldenGlow)' : undefined}
                    className="transition-transform duration-200"
                  />

                  {/* Accessible Registration Label Tag */}
                  <text
                    x="10"
                    y="3"
                    fill={isSelected ? '#E6B23C' : isInspected ? '#FFFFFF' : '#C7B394'}
                    fontSize={isInspected ? '9.5' : '8.5'}
                    fontFamily="monospace"
                    fontWeight={isInspected ? 'bold' : 'normal'}
                    className="pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                  >
                    {m.vehicle.registration_number}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Anchored Inspection Panel (Details HUD) */}
        <div
          ref={telemetryHudRef}
          className="lg:col-span-5 bg-graphite/60 border border-graphite rounded-2xl p-5 sm:p-6 text-left space-y-4 shadow-elevated"
        >
          {/* Top HUD Status Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-graphite">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-golden flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              <span>Marker Telemetry HUD</span>
            </span>

            <div className="flex items-center gap-2">
              {isSelectedLocked ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase bg-golden/20 text-golden border border-golden/40">
                    Locked Selection
                  </span>
                  <button
                    onClick={() => setSelectedMarker(null)}
                    className="text-[10px] text-sand hover:text-white underline font-mono ml-1"
                    title="Unlock persistent selection"
                  >
                    Clear
                  </button>
                </div>
              ) : isHoverPreview ? (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase bg-sand/20 text-sand border border-sand/40">
                  Hover Preview
                </span>
              ) : isDefaultInspection ? (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase bg-graphite text-sand/80 border border-graphite">
                  Priority Lead
                </span>
              ) : null}

              {activeInspection && (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    activeInspection.urgency === 'CRITICAL'
                      ? 'bg-racing/20 text-racing border border-racing/40'
                      : activeInspection.urgency === 'ATTENTION'
                      ? 'bg-golden/20 text-golden border border-golden/40'
                      : activeInspection.urgency === 'INCOMPLETE'
                      ? 'bg-sand/20 text-sand border border-sand/40'
                      : 'bg-graphite text-txt-muted border border-stone-dark'
                  }`}
                >
                  {activeInspection.urgency}
                </span>
              )}
            </div>
          </div>

          {activeInspection ? (
            <div className="space-y-4">
              {/* Vehicle Photograph Preview & Registration Identity */}
              <div className="flex items-center gap-4">
                {activeVehicleImage && (
                  <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl bg-black/90 border border-graphite/60 flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-sm">
                    <img
                      src={activeVehicleImage.src}
                      alt={activeVehicleImage.alt}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-wider block truncate">
                    {activeInspection.vehicle.registration_number}
                  </span>
                  <p className="text-xs text-sand mt-0.5 truncate">
                    {activeInspection.vehicle.make} {activeInspection.vehicle.model} •{' '}
                    <span className="capitalize">{activeInspection.vehicle.vehicle_category?.replace(/_/g, ' ')}</span>
                  </p>
                  <p className="text-[10px] text-sand/60 font-mono mt-0.5">
                    {activeVehicleImage?.isRealPhoto ? 'Real Fleet Photograph' : 'Fleet Category Reference'}
                  </p>
                </div>
              </div>

              {/* Obligation Status & Telemetry Metrics */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-graphite space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sand">Compliance Status:</span>
                  <span
                    className={`font-bold ${
                      activeInspection.urgency === 'CRITICAL'
                        ? 'text-racing'
                        : activeInspection.urgency === 'ATTENTION'
                        ? 'text-golden'
                        : activeInspection.urgency === 'INCOMPLETE'
                        ? 'text-sand'
                        : 'text-txt-muted'
                    }`}
                  >
                    {activeInspection.obligation}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sand">Assigned Driver:</span>
                  <span className="font-medium text-white truncate max-w-[160px]">
                    {activeInspection.vehicle.assigned_driver_name || 'Unassigned'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sand">Document Matrix:</span>
                  <span className="font-mono text-white">
                    {activeInspection.vehicle.expired_count} Expired / {activeInspection.vehicle.due_soon_count} Due Soon
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  to={`/vehicles/${activeInspection.vehicle.id}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-golden text-black text-xs font-bold text-center flex items-center justify-center gap-1.5 hover:bg-golden-light transition-colors"
                >
                  <span>Open Vehicle Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/renewals"
                  className="py-2 px-3 rounded-xl bg-graphite border border-graphite text-sand hover:text-white text-xs font-semibold text-center transition-colors"
                >
                  Renewals
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-2.5">
              <Info className="w-7 h-7 text-sand/60 mx-auto" />
              <p className="text-xs text-sand font-medium">
                Hover, tap, or navigate via keyboard to any radar marker to inspect vehicle documents and compliance deadlines.
              </p>
              <p className="text-[11px] text-sand/50 font-mono">
                {markers.length} Active Fleet Units Swept
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceRadar;
