import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/classNames';
import { useState } from 'react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  dismissable?: boolean;
  className?: string;
}

export function ErrorBanner({ message, onRetry, dismissable = true, className }: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg',
        'bg-red-900/40 border border-red-500/50 text-red-200',
        className,
      )}
    >
      <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-400 mt-0.5" aria-hidden="true" />
      <div className="flex-1 text-sm">{message}</div>
      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs text-red-300 underline hover:text-red-100"
          >
            Retry
          </button>
        )}
        {dismissable && (
          <button
            onClick={() => setDismissed(true)}
            aria-label="Close"
            className="text-red-400 hover:text-red-200"
          >
            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
