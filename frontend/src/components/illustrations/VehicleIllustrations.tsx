import React from 'react';

interface IllustrationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Image 1 Reference: Red Commercial Goods Lorry (Hero Feature)
 * Bold Red commercial transport cabin, aerodynamic chassis, sturdy cargo bed, dual chrome lamps.
 */
export const RedCommercialLorryHero: React.FC<IllustrationProps> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 540 280" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Atmospheric Road Shadow */}
    <ellipse cx="270" cy="255" rx="240" ry="14" fill="#000000" fillOpacity="0.85" />

    {/* Road Surface Lines */}
    <line x1="20" y1="250" x2="520" y2="250" stroke="#1F2226" strokeWidth="2.5" />
    <line x1="40" y1="250" x2="500" y2="250" stroke="#E6B23C" strokeWidth="2" strokeDasharray="12 8" strokeOpacity="0.6" />

    {/* Heavy Goods Cargo Container (Deep Graphite with Gold Trim) */}
    <rect x="35" y="65" width="280" height="155" rx="6" fill="#1F2226" stroke="#262A30" strokeWidth="2" />
    {/* Cargo Wall Corrugations */}
    <line x1="35" y1="95" x2="315" y2="95" stroke="#141618" strokeWidth="2" />
    <line x1="35" y1="125" x2="315" y2="125" stroke="#141618" strokeWidth="2" />
    <line x1="35" y1="155" x2="315" y2="155" stroke="#141618" strokeWidth="2" />
    <line x1="35" y1="185" x2="315" y2="185" stroke="#141618" strokeWidth="2" />

    {/* Gold Brand Plate on Cargo Container */}
    <rect x="55" y="80" width="240" height="120" rx="4" fill="#141618" stroke="#E6B23C" strokeWidth="1.5" strokeDasharray="6 4" strokeOpacity="0.7" />
    <text x="175" y="132" textAnchor="middle" fill="#E6B23C" fontSize="13" fontWeight="900" letterSpacing="2.5" fontFamily="Manrope, sans-serif">
      COMMERCIAL CARRIER
    </text>
    <text x="175" y="152" textAnchor="middle" fill="#C7B394" fontSize="9" fontWeight="700" letterSpacing="1.2" fontFamily="sans-serif">
      ALL INDIA PERMIT • GOODS & LOGISTICS
    </text>

    {/* Primary Red Cabin (Image 1 Reference — Racing Stripe Red #B41E2D) */}
    <path
      d="M315 90H405C425 90 445 106 454 128L472 172C477 185 480 200 480 220H315V90Z"
      fill="#B41E2D"
      stroke="#7D131E"
      strokeWidth="2.5"
    />

    {/* Cabin Sun Visor */}
    <path d="M400 84L450 96L400 100Z" fill="#000000" />

    {/* Windshield Glass */}
    <path
      d="M390 102H418C430 102 440 112 445 125L456 156H390V102Z"
      fill="#000000"
      stroke="#1F2226"
      strokeWidth="1.5"
    />
    {/* Windshield Reflection */}
    <path d="M400 106L448 150M410 106L452 144" stroke="#C7B394" strokeWidth="1.8" strokeOpacity="0.4" strokeLinecap="round" />

    {/* Driver Side Window */}
    <rect x="340" y="106" width="40" height="48" rx="3" fill="#000000" stroke="#1F2226" strokeWidth="1.5" />

    {/* Aerodynamic Front Chrome Grille */}
    <rect x="445" y="180" width="35" height="24" rx="2" fill="#000000" stroke="#E6B23C" strokeWidth="1.2" />
    <line x1="448" y1="188" x2="477" y2="188" stroke="#E6B23C" strokeWidth="1.2" />
    <line x1="448" y1="194" x2="477" y2="194" stroke="#E6B23C" strokeWidth="1.2" />

    {/* Dual High-Intensity Headlamps */}
    <rect x="466" y="196" width="14" height="16" rx="2" fill="#FDF7EB" stroke="#B8881E" strokeWidth="1.5" />
    <circle cx="473" cy="204" r="4.5" fill="#E6B23C" />
    <rect x="466" y="216" width="14" height="6" rx="1" fill="#B41E2D" />

    {/* Heavy Front Bumper */}
    <path d="M315 218H486V232H315V218Z" fill="#000000" stroke="#1F2226" strokeWidth="2" />

    {/* Sample Tamil Nadu Plate */}
    <rect x="418" y="220" width="56" height="10" rx="1.5" fill="#E6B23C" stroke="#000000" strokeWidth="1" />
    <text x="446" y="228" textAnchor="middle" fill="#000000" fontSize="7" fontWeight="900" fontFamily="sans-serif">
      TN 01 EX 9988
    </text>

    {/* Heavy Commercial Wheels & Hubs */}
    {/* Rear Dual Wheels */}
    <circle cx="105" cy="232" r="28" fill="#000000" stroke="#1F2226" strokeWidth="3" />
    <circle cx="105" cy="232" r="14" fill="#141618" stroke="#C7B394" strokeWidth="2" />
    <circle cx="105" cy="232" r="6" fill="#E6B23C" />

    <circle cx="180" cy="232" r="28" fill="#000000" stroke="#1F2226" strokeWidth="3" />
    <circle cx="180" cy="232" r="14" fill="#141618" stroke="#C7B394" strokeWidth="2" />
    <circle cx="180" cy="232" r="6" fill="#E6B23C" />

    {/* Front Steer Wheel */}
    <circle cx="390" cy="232" r="28" fill="#000000" stroke="#1F2226" strokeWidth="3" />
    <circle cx="390" cy="232" r="14" fill="#141618" stroke="#C7B394" strokeWidth="2" />
    <circle cx="390" cy="232" r="6" fill="#E6B23C" />
  </svg>
);

/**
 * Image 2 Reference: Yellow Indian Auto-Rickshaw (Urban Commercial Fleet)
 * Classic yellow canopy, black lower body panels, passenger opening, front single wheel.
 */
export const YellowAutoRickshawIllustration: React.FC<IllustrationProps> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ground Shadow */}
    <ellipse cx="160" cy="205" rx="140" ry="8" fill="#000000" fillOpacity="0.8" />
    <line x1="20" y1="202" x2="300" y2="202" stroke="#1F2226" strokeWidth="2" />
    <line x1="40" y1="202" x2="280" y2="202" stroke="#E6B23C" strokeWidth="1.5" strokeDasharray="8 6" strokeOpacity="0.5" />

    {/* Classic Yellow Canopy (Golden Hour #E6B23C) */}
    <path
      d="M50 95C50 78 70 64 96 62H188C214 64 236 76 248 95L258 112H44L50 95Z"
      fill="#E6B23C"
      stroke="#B8881E"
      strokeWidth="2.5"
    />
    <path d="M46 106H256" stroke="#B8881E" strokeWidth="1.5" />

    {/* Windshield */}
    <path d="M196 96H242L254 134H196V96Z" fill="#000000" stroke="#1F2226" strokeWidth="1.5" />
    <line x1="206" y1="102" x2="244" y2="130" stroke="#C7B394" strokeWidth="1.5" strokeOpacity="0.5" />

    {/* Lower Chassis (Deep Solid Black #000000) */}
    <path
      d="M44 112H145V178H56C49 178 44 173 44 166V112Z"
      fill="#000000"
      stroke="#1F2226"
      strokeWidth="2"
    />
    <path
      d="M194 134H262C270 134 274 140 277 148L284 178H194V134Z"
      fill="#000000"
      stroke="#1F2226"
      strokeWidth="2"
    />

    {/* Open Passenger Cabin Opening */}
    <path d="M145 112H194V178H145V112Z" fill="#141618" stroke="#1F2226" strokeWidth="1.5" />
    <line x1="168" y1="112" x2="168" y2="178" stroke="#E6B23C" strokeWidth="2" />

    {/* Front Headlamp & Fender */}
    <circle cx="282" cy="158" r="6" fill="#FDF7EB" stroke="#E6B23C" strokeWidth="1.5" />
    <path d="M266 170C266 158 286 158 296 170V186H266V170Z" fill="#000000" stroke="#1F2226" strokeWidth="1.2" />

    {/* Sample Plate */}
    <rect x="58" y="148" width="34" height="8" rx="1.5" fill="#E6B23C" stroke="#000000" strokeWidth="1" />
    <text x="75" y="154" textAnchor="middle" fill="#000000" fontSize="5.5" fontWeight="900" fontFamily="sans-serif">
      TN 02 AR 3311
    </text>

    {/* Rear Wheel */}
    <circle cx="86" cy="182" r="20" fill="#000000" stroke="#1F2226" strokeWidth="2.5" />
    <circle cx="86" cy="182" r="10" fill="#141618" stroke="#C7B394" strokeWidth="1.5" />
    <circle cx="86" cy="182" r="4" fill="#E6B23C" />

    {/* Front Wheel */}
    <circle cx="276" cy="186" r="16" fill="#000000" stroke="#1F2226" strokeWidth="2.5" />
    <circle cx="276" cy="186" r="8" fill="#141618" stroke="#C7B394" strokeWidth="1.5" />
    <circle cx="276" cy="186" r="3" fill="#E6B23C" />
  </svg>
);

/**
 * Tempo Traveller (Tourist & Staff Mobility)
 */
export const TempoTravellerIllustration: React.FC<IllustrationProps> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 360 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <line x1="20" y1="185" x2="340" y2="185" stroke="#1F2226" strokeWidth="2" />
    <line x1="40" y1="185" x2="320" y2="185" stroke="#E6B23C" strokeWidth="1.5" strokeDasharray="8 6" strokeOpacity="0.5" />

    {/* Van Body */}
    <path
      d="M45 78H240C260 78 285 92 295 112L312 142C314 148 315 156 315 162H45C42 162 40 160 40 157V83C40 80 42 78 45 78Z"
      fill="#F7F6F0"
      stroke="#C7B394"
      strokeWidth="2"
    />
    {/* Roof Luggage Rack */}
    <path d="M55 70H235V76H55V70Z" fill="#000000" stroke="#1F2226" strokeWidth="1" />
    <line x1="85" y1="70" x2="85" y2="76" stroke="#E6B23C" strokeWidth="1.5" />
    <line x1="130" y1="70" x2="130" y2="76" stroke="#E6B23C" strokeWidth="1.5" />
    <line x1="175" y1="70" x2="175" y2="76" stroke="#E6B23C" strokeWidth="1.5" />

    {/* Gold Accent Stripe */}
    <path d="M40 134H312V140H40V134Z" fill="#E6B23C" />

    {/* Windows */}
    <rect x="52" y="88" width="36" height="34" rx="3" fill="#000000" stroke="#1F2226" strokeWidth="1.2" />
    <rect x="94" y="88" width="42" height="34" rx="3" fill="#000000" stroke="#1F2226" strokeWidth="1.2" />
    <rect x="142" y="88" width="42" height="34" rx="3" fill="#000000" stroke="#1F2226" strokeWidth="1.2" />
    <rect x="190" y="88" width="42" height="34" rx="3" fill="#000000" stroke="#1F2226" strokeWidth="1.2" />
    <path d="M238 88H260C270 88 280 96 286 106L298 126H238V88Z" fill="#000000" stroke="#1F2226" strokeWidth="1.2" />

    {/* Headlamp & Sample Plate */}
    <circle cx="310" cy="145" r="4" fill="#FDF7EB" stroke="#B8881E" strokeWidth="1" />
    <rect x="278" y="154" width="32" height="7" rx="1" fill="#E6B23C" stroke="#000000" strokeWidth="0.8" />
    <text x="294" y="160" textAnchor="middle" fill="#000000" fontSize="4.5" fontWeight="800" fontFamily="sans-serif">
      TN 07 TT 4567
    </text>

    {/* Wheels */}
    <circle cx="95" cy="165" r="18" fill="#000000" stroke="#1F2226" strokeWidth="2" />
    <circle cx="95" cy="165" r="9" fill="#141618" stroke="#C7B394" strokeWidth="1.2" />
    <circle cx="95" cy="165" r="3.5" fill="#E6B23C" />

    <circle cx="260" cy="165" r="18" fill="#000000" stroke="#1F2226" strokeWidth="2" />
    <circle cx="260" cy="165" r="9" fill="#141618" stroke="#C7B394" strokeWidth="1.2" />
    <circle cx="260" cy="165" r="3.5" fill="#E6B23C" />
  </svg>
);

/**
 * Tourist Taxi / Commercial SUV
 */
export const TouristTaxiIllustration: React.FC<IllustrationProps> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <line x1="20" y1="165" x2="320" y2="165" stroke="#1F2226" strokeWidth="2" />
    <line x1="40" y1="165" x2="300" y2="165" stroke="#E6B23C" strokeWidth="1.5" strokeDasharray="8 6" strokeOpacity="0.5" />

    {/* Car Profile */}
    <path
      d="M38 108C38 100 44 94 52 92L110 84C135 84 150 68 178 68H230C255 68 272 82 284 102L306 122C312 128 314 135 314 142V148H38V108Z"
      fill="#F7F6F0"
      stroke="#C7B394"
      strokeWidth="2"
    />
    <path d="M152 66H235" stroke="#E6B23C" strokeWidth="2.5" strokeLinecap="round" />

    {/* Windows */}
    <path d="M118 86L158 72H210V105H118V86Z" fill="#000000" stroke="#1F2226" strokeWidth="1.2" />
    <path d="M216 72H236C248 72 260 80 268 94L278 105H216V72Z" fill="#000000" stroke="#1F2226" strokeWidth="1.2" />
    <path d="M75 92H112V105H75V92Z" fill="#000000" stroke="#1F2226" strokeWidth="1.2" />

    {/* Accent */}
    <path d="M38 126H310V130H38V126Z" fill="#E6B23C" />
    <path d="M298 120L312 126V136H298V120Z" fill="#FDF7EB" stroke="#B8881E" strokeWidth="1.2" />

    {/* Plate */}
    <rect x="272" y="136" width="30" height="6.5" rx="1" fill="#E6B23C" stroke="#000000" strokeWidth="0.8" />
    <text x="287" y="141" textAnchor="middle" fill="#000000" fontSize="4.2" fontWeight="800" fontFamily="sans-serif">
      TN 10 TC 8819
    </text>

    {/* Wheels */}
    <circle cx="82" cy="150" r="17" fill="#000000" stroke="#1F2226" strokeWidth="2" />
    <circle cx="82" cy="150" r="8" fill="#141618" stroke="#C7B394" strokeWidth="1.2" />
    <circle cx="82" cy="150" r="3" fill="#E6B23C" />

    <circle cx="254" cy="150" r="17" fill="#000000" stroke="#1F2226" strokeWidth="2" />
    <circle cx="254" cy="150" r="8" fill="#141618" stroke="#C7B394" strokeWidth="1.2" />
    <circle cx="254" cy="150" r="3" fill="#E6B23C" />
  </svg>
);

/**
 * 32-Seater Tourist Luxury Bus / Coach
 */
export const TouristBusIllustration: React.FC<IllustrationProps> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 380 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <line x1="20" y1="184" x2="360" y2="184" stroke="#1F2226" strokeWidth="2" />
    <line x1="40" y1="184" x2="340" y2="184" stroke="#E6B23C" strokeWidth="1.5" strokeDasharray="8 6" strokeOpacity="0.5" />

    {/* Bus Body */}
    <path
      d="M30 68H310C326 68 344 80 350 98L358 132C360 142 360 152 360 162H30C26 162 24 160 24 156V74C24 70 26 68 30 68Z"
      fill="#000000"
      stroke="#1F2226"
      strokeWidth="2"
    />
    <rect x="110" y="58" width="140" height="10" rx="3" fill="#000000" stroke="#E6B23C" strokeWidth="1.2" />
    <text x="180" y="66" textAnchor="middle" fill="#E6B23C" fontSize="6.5" fontWeight="800" letterSpacing="1" fontFamily="sans-serif">
      AITP TOURIST COACH • AC
    </text>

    {/* Gold Swirl */}
    <path d="M24 135C80 135 140 148 240 148C290 148 330 138 358 138V146C330 146 290 156 240 156C140 156 80 143 24 143V135Z" fill="#E6B23C" />

    {/* Glass Windows */}
    <rect x="36" y="80" width="42" height="42" rx="3" fill="#141618" stroke="#1F2226" strokeWidth="1" />
    <rect x="84" y="80" width="46" height="42" rx="3" fill="#141618" stroke="#1F2226" strokeWidth="1" />
    <rect x="136" y="80" width="46" height="42" rx="3" fill="#141618" stroke="#1F2226" strokeWidth="1" />
    <rect x="188" y="80" width="46" height="42" rx="3" fill="#141618" stroke="#1F2226" strokeWidth="1" />
    <rect x="240" y="80" width="46" height="42" rx="3" fill="#141618" stroke="#1F2226" strokeWidth="1" />
    <path d="M292 80H322C334 80 342 88 348 100L354 122H292V80Z" fill="#141618" stroke="#1F2226" strokeWidth="1.2" />

    {/* Plate */}
    <rect x="318" y="156" width="34" height="7" rx="1" fill="#E6B23C" stroke="#000000" strokeWidth="0.8" />
    <text x="335" y="162" textAnchor="middle" fill="#000000" fontSize="4.8" fontWeight="800" fontFamily="sans-serif">
      TN 43 TB 1010
    </text>

    {/* Wheels */}
    <circle cx="85" cy="166" r="20" fill="#000000" stroke="#1F2226" strokeWidth="2" />
    <circle cx="85" cy="166" r="10" fill="#141618" stroke="#C7B394" strokeWidth="1.5" />
    <circle cx="85" cy="166" r="4" fill="#E6B23C" />

    <circle cx="285" cy="166" r="20" fill="#000000" stroke="#1F2226" strokeWidth="2" />
    <circle cx="285" cy="166" r="10" fill="#141618" stroke="#C7B394" strokeWidth="1.5" />
    <circle cx="285" cy="166" r="4" fill="#E6B23C" />
  </svg>
);

/**
 * Image 3 Reference: Animated Winding SVG Road
 * Responsive, curved road path with golden lane dividers and milestone anchor coordinates.
 */
export const WindingRoadSVG: React.FC<{
  roadRef?: React.RefObject<SVGPathElement | null>;
  markerRef?: React.RefObject<SVGGElement | null>;
  className?: string;
}> = ({ roadRef, markerRef, className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Background Glow Overlay */}
    <path
      d="M 50,50 Q 400,120 400,300 T 750,550"
      stroke="#E6B23C"
      strokeWidth="48"
      strokeOpacity="0.08"
      strokeLinecap="round"
      fill="none"
    />

    {/* Dark Asphalt Road Bed (Pure Black #000000 with Graphite Outline) */}
    <path
      d="M 50,50 Q 400,120 400,300 T 750,550"
      stroke="#000000"
      strokeWidth="40"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M 50,50 Q 400,120 400,300 T 750,550"
      stroke="#1F2226"
      strokeWidth="42"
      strokeLinecap="round"
      strokeDasharray="6 6"
      strokeOpacity="0.6"
      fill="none"
    />

    {/* Base Centerline Track (Subtle Dashed) */}
    <path
      d="M 50,50 Q 400,120 400,300 T 750,550"
      stroke="#C7B394"
      strokeWidth="2"
      strokeDasharray="10 8"
      strokeOpacity="0.3"
      strokeLinecap="round"
      fill="none"
    />

    {/* Golden Illuminated Progress Beam (Drawn via GSAP DrawSVGPlugin / Scroll scrub) */}
    <path
      ref={roadRef as any}
      id="winding-road-path"
      d="M 50,50 Q 400,120 400,300 T 750,550"
      stroke="#E6B23C"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
      filter="drop-shadow(0 0 8px rgba(230, 178, 60, 0.7))"
    />

    {/* Milestone 1 Node: Add Vehicle (50, 50) */}
    <g id="road-node-1" className="road-node" transform="translate(50, 50)">
      <circle r="16" fill="#000000" stroke="#E6B23C" strokeWidth="2.5" />
      <circle className="node-pulse" r="6" fill="#E6B23C" />
      <text x="24" y="5" fill="#FFFFFF" fontSize="12" fontWeight="800" fontFamily="Manrope, sans-serif">
        01. Add Vehicle
      </text>
    </g>

    {/* Milestone 2 Node: Upload Documents (280, 180) */}
    <g id="road-node-2" className="road-node" transform="translate(280, 180)">
      <circle r="16" fill="#000000" stroke="#E6B23C" strokeWidth="2.5" />
      <circle className="node-pulse" r="6" fill="#E6B23C" />
      <text x="24" y="5" fill="#FFFFFF" fontSize="12" fontWeight="800" fontFamily="Manrope, sans-serif">
        02. Record Documents
      </text>
    </g>

    {/* Milestone 3 Node: Expiry Engine (400, 300) */}
    <g id="road-node-3" className="road-node" transform="translate(400, 300)">
      <circle r="16" fill="#000000" stroke="#E6B23C" strokeWidth="2.5" />
      <circle className="node-pulse" r="6" fill="#E6B23C" />
      <text x="-160" y="5" fill="#FFFFFF" fontSize="12" fontWeight="800" fontFamily="Manrope, sans-serif">
        03. Track Expiries
      </text>
    </g>

    {/* Milestone 4 Node: Complete & Evidence (750, 550) */}
    <g id="road-node-4" className="road-node" transform="translate(750, 550)">
      <circle r="16" fill="#000000" stroke="#E6B23C" strokeWidth="2.5" />
      <circle className="node-pulse" r="6" fill="#E6B23C" />
      <text x="-190" y="5" fill="#FFFFFF" fontSize="12" fontWeight="800" fontFamily="Manrope, sans-serif">
        04. Preserve Evidence
      </text>
    </g>

    {/* Moving Vehicle / Route Marker (Animated along path via GSAP MotionPath) */}
    <g ref={markerRef as any} id="road-vehicle-marker">
      <circle r="14" fill="#E6B23C" filter="drop-shadow(0 0 10px rgba(230, 178, 60, 0.9))" />
      <circle r="8" fill="#000000" />
      <circle r="3.5" fill="#B41E2D" />
      {/* Direction indicator triangle */}
      <polygon points="12,0 4,-5 4,5" fill="#E6B23C" />
    </g>
  </svg>
);
