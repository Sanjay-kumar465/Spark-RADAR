import React from 'react';
import { cn } from '../../utils/cn';
import type { AttentionStatus } from '../../types';
import { ShieldAlert, AlertTriangle, CheckCircle2, Clock, FileWarning } from 'lucide-react';

interface AttentionBadgeProps {
  status: AttentionStatus | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const AttentionBadge: React.FC<AttentionBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const norm = status.toUpperCase();

  const config = {
    CRITICAL: {
      bg: 'bg-racing-light text-racing-dark border border-racing/30',
      icon: ShieldAlert,
      label: 'Critical Attention',
    },
    ATTENTION: {
      bg: 'bg-golden-light text-golden-dark border border-golden/40',
      icon: AlertTriangle,
      label: 'Renewal Due Soon',
    },
    INCOMPLETE: {
      bg: 'bg-stone text-charcoal border border-black/30',
      icon: FileWarning,
      label: 'Docs Incomplete',
    },
    COMPLIANT: {
      bg: 'bg-sand-light text-graphite border border-sand/60',
      icon: CheckCircle2,
      label: 'Fully Compliant',
    },
  }[norm] || {
    bg: 'bg-stone text-txt-secondary border-stone',
    icon: Clock,
    label: status,
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs font-medium gap-1.5';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium select-none',
        config.bg,
        sizeClasses,
        className
      )}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />}
      <span>{config.label}</span>
    </span>
  );
};

interface DocumentStatusBadgeProps {
  status: 'ACTIVE' | 'DUE_SOON' | 'EXPIRED' | 'MISSING' | 'NO_EXPIRY' | string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
  className,
}) => {
  const norm = status.toUpperCase();

  const config = {
    ACTIVE: {
      bg: 'bg-sand-light text-graphite border border-sand/60',
      defaultLabel: 'Valid',
    },
    DUE_SOON: {
      bg: 'bg-golden-light text-golden-dark border border-golden/40',
      defaultLabel: 'Expiring Soon',
    },
    EXPIRED: {
      bg: 'bg-racing-light text-racing-dark border border-racing/30',
      defaultLabel: 'Expired',
    },
    MISSING: {
      bg: 'bg-stone text-charcoal border border-black/30',
      defaultLabel: 'Missing',
    },
    NO_EXPIRY: {
      bg: 'bg-stone text-txt-secondary border-black/20',
      defaultLabel: 'No Expiry',
    },
  }[norm] || {
    bg: 'bg-stone text-txt-secondary border-stone',
    defaultLabel: status,
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-medium select-none',
        config.bg,
        sizeClasses,
        className
      )}
    >
      {label || config.defaultLabel}
    </span>
  );
};

export const StatusPill = DocumentStatusBadge;
