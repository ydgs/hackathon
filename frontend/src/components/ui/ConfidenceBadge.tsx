import { cn } from '../../lib/classNames';
import type { AiConfidence } from '../../types';

const CONFIDENCE_STYLES: Record<AiConfidence, string> = {
  High:   'bg-green-700/60 text-green-200 border-green-600',
  Medium: 'bg-amber-700/60 text-amber-200 border-amber-600',
  Low:    'bg-red-700/60 text-red-200 border-red-600',
};

interface ConfidenceBadgeProps {
  confidence: AiConfidence;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        CONFIDENCE_STYLES[confidence],
        className,
      )}
    >
      Confidence: {confidence}
    </span>
  );
}
