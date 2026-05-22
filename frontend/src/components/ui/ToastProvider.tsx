import React, { createContext, useCallback, useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/classNames';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

export interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      const timeout = type === 'success' ? 4000 : 6000;
      setTimeout(() => dismiss(id), timeout);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="assertive"
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto flex items-start gap-3 p-4 rounded-toast shadow-xl',
        'bg-brand-800 border-l-4',
        isSuccess && 'border-green-500',
        isError && 'border-red-500',
        !isSuccess && !isError && 'border-brand-400',
      )}
    >
      {isSuccess && <CheckCircleIcon className="h-5 w-5 text-green-400 shrink-0 mt-0.5" aria-hidden="true" />}
      {isError && <ExclamationCircleIcon className="h-5 w-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />}
      {!isSuccess && !isError && <ExclamationCircleIcon className="h-5 w-5 text-brand-300 shrink-0 mt-0.5" aria-hidden="true" />}
      <p className="flex-1 text-sm text-white">{toast.message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-gray-400 hover:text-white shrink-0"
      >
        <XMarkIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
