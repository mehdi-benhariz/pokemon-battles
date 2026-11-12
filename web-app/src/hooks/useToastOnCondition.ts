import { useEffect, useRef } from 'react';
import { useToast } from '../components/toast/ToastContext';

/**
 * Fires a toast once when `active` becomes true; resets when `active` goes false.
 */
export function useToastOnCondition(
  active: boolean,
  message: string,
  variant: 'error' | 'info' | 'success' = 'error'
) {
  const toast = useToast();
  const fired = useRef(false);

  useEffect(() => {
    if (active && !fired.current) {
      toast[variant](message);
      fired.current = true;
    }
    if (!active) {
      fired.current = false;
    }
  }, [active, message, toast, variant]);
}
