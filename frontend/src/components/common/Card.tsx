import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  variant?: 'white' | 'ivory' | 'stone' | 'graphite' | 'dark';
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverable = false,
  variant = 'white',
  children,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  const variantStyles = {
    white: 'bg-white border-stone text-charcoal',
    ivory: 'bg-ivory border-stone text-charcoal',
    stone: 'bg-stone/40 border-stone text-charcoal',
    graphite: 'bg-graphite text-white border-graphite-light',
    dark: 'bg-black text-white border-graphite',
  }[variant];

  return (
    <motion.div
      whileHover={hoverable && !shouldReduceMotion ? { y: -2, transition: { duration: 0.15 } } : undefined}
      className={cn(
        'rounded-xl border shadow-card p-5 transition-shadow',
        variantStyles,
        hoverable && 'hover:shadow-elevated',
        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
};
