import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'dark',
  showSubtitle = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const textColor = variant === 'light' ? 'text-white' : 'text-graphite';
  const subtitleColor = variant === 'light' ? 'text-sand' : 'text-txt-secondary';

  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`relative flex items-center justify-center rounded-xl bg-graphite border border-graphite-light ${iconSizes[size]} shadow-subtle shrink-0 overflow-hidden`}>
        <svg viewBox="0 0 32 32" fill="none" className="w-5/6 h-5/6" xmlns="http://www.w3.org/2000/svg">
          {/* Road perspective motif */}
          <path d="M12 28L15 17M20 28L17 17" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" />
          
          {/* Concentric radar range rings in Golden Hour / Sand */}
          <circle cx="16" cy="14" r="11" stroke="#E6B23C" strokeWidth="1.2" strokeOpacity="0.3" />
          <circle cx="16" cy="14" r="6.5" stroke="#E6B23C" strokeWidth="1.2" strokeOpacity="0.6" />
          <circle cx="16" cy="14" r="2.5" fill="#E6B23C" />

          {/* Rotating radar beam */}
          <motion.g
            animate={shouldReduceMotion ? undefined : { rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            style={{ originX: '16px', originY: '14px' }}
          >
            <line x1="16" y1="14" x2="25" y2="7" stroke="#E6B23C" strokeWidth="1.6" strokeLinecap="round" />
            <polygon points="16,14 25,7 23,4" fill="#E6B23C" fillOpacity="0.25" />
          </motion.g>
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-extrabold tracking-tight ${textSizes[size]} ${textColor} leading-none font-heading`}>
          SPARK <span className="text-golden">RADAR</span>
        </span>
        {showSubtitle && size !== 'sm' && (
          <span className={`text-[10px] font-medium tracking-wider uppercase mt-1 ${subtitleColor} leading-none`}>
            Fleet Compliance SaaS
          </span>
        )}
      </div>
    </div>
  );
};
