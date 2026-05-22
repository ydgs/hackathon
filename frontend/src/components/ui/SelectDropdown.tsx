import React from 'react';
import { cn } from '../../lib/classNames';
import { inputClasses } from './FormField';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectDropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
}

export function SelectDropdown({
  options,
  placeholder,
  error,
  className,
  ...props
}: SelectDropdownProps) {
  return (
    <select
      className={cn(inputClasses(error), 'cursor-pointer', className)}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
