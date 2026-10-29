import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dark-outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, icon, children, disabled, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-golden focus:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-golden text-graphite-dark font-semibold hover:bg-golden-hover shadow-subtle',
      secondary: 'bg-graphite text-white hover:bg-graphite-light shadow-subtle',
      outline: 'border border-stone bg-white text-charcoal hover:bg-ivory hover:border-sand',
      ghost: 'text-charcoal hover:bg-stone/50',
      danger: 'bg-racing text-white hover:bg-racing-hover shadow-subtle',
      'dark-outline': 'border border-black/40 bg-graphite/60 text-white hover:bg-graphite hover:border-golden/60',
    };

    const sizes = {
      sm: 'px-2.5 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={shouldReduceMotion || disabled || isLoading ? undefined : { scale: 0.98 }}
        whileHover={shouldReduceMotion || disabled || isLoading ? undefined : { y: -1 }}
        transition={{ duration: 0.12 }}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...(props as any)}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
