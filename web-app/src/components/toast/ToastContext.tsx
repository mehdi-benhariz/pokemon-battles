import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { IoClose, IoCheckmarkCircle, IoInformationCircle, IoWarning } from 'react-icons/io5';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastOptions {
  variant?: ToastVariant;
  /** Auto-dismiss in ms; `0` keeps the toast until dismissed */
  duration?: number;
}

interface ToastRecord {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  show: (message: string, options?: ToastOptions) => string;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const VARIANT_STYLES: Record<ToastVariant, { shell: string; Icon: typeof IoWarning }> = {
  error: {
    shell: 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100',
    Icon: IoWarning,
  },
  success: {
    shell: 'border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100',
    Icon: IoCheckmarkCircle,
  },
  info: {
    shell: 'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
    Icon: IoInformationCircle,
  },
};

const DEFAULT_DURATION = 6_000;

const ToastItem: FC<{ toast: ToastRecord; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const { shell, Icon } = VARIANT_STYLES[toast.variant];

  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.duration, toast.id]);

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border-2 px-4 py-3 shadow-lg shadow-black/10 transition-all duration-200 ${shell}`}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        aria-label="Dismiss notification"
      >
        <IoClose className="size-5" aria-hidden />
      </button>
    </div>
  );
};

const ToastViewport: FC<{ toasts: ToastRecord[]; onDismiss: (id: string) => void }> = ({
  toasts,
  onDismiss,
}) => {
  const titleId = useId();

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
      aria-labelledby={titleId}
    >
      <p id={titleId} className="sr-only">
        Notifications
      </p>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const show = useCallback((message: string, options?: ToastOptions) => {
    const id = `toast-${++nextId.current}`;
    const record: ToastRecord = {
      id,
      message,
      variant: options?.variant ?? 'info',
      duration: options?.duration ?? DEFAULT_DURATION,
    };
    setToasts(current => [...current.slice(-4), record]);
    return id;
  }, []);

  const success = useCallback(
    (message: string, duration = DEFAULT_DURATION) => show(message, { variant: 'success', duration }),
    [show]
  );
  const error = useCallback(
    (message: string, duration = DEFAULT_DURATION) => show(message, { variant: 'error', duration }),
    [show]
  );
  const info = useCallback(
    (message: string, duration = DEFAULT_DURATION) => show(message, { variant: 'info', duration }),
    [show]
  );

  const value = useMemo(
    () => ({ show, success, error, info, dismiss }),
    [show, success, error, info, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
