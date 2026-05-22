import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/classNames';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, htmlFor, error, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-gray-200"
      >
        {label}
        {required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <p
          id={`${htmlFor}-error`}
          className="flex items-center gap-1 text-xs text-red-400 mt-0.5"
          role="alert"
        >
          <ExclamationCircleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

// Reusable input class generator
export function inputClasses(hasError?: boolean): string {
  return cn(
    'w-full rounded-input px-3 py-2 text-sm text-white',
    'bg-brand-700 border',
    'focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-1 focus:ring-offset-brand-900',
    'placeholder:text-gray-500',
    hasError
      ? 'border-red-500 focus:ring-red-400'
      : 'border-brand-600 focus:border-brand-300',
  );
}
