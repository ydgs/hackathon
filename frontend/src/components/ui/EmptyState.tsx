import React from 'react';
import { cn } from '../../lib/classNames';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  heading: string;
  body?: string;
  ctaLabel?: string;
  onCta?: () => void;
  className?: string;
}

export function EmptyState({ icon, heading, body, ctaLabel, onCta, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 px-6 text-center',
        className,
      )}
    >
      {icon && (
        <div className="text-gray-500 w-12 h-12">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-white">{heading}</h3>
      {body && <p className="text-sm text-gray-400 max-w-sm">{body}</p>}
      {ctaLabel && onCta && (
        <Button variant="primary" size="md" onClick={onCta}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
