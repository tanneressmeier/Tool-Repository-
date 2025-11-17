/**
 * useToasts Hook
 * Manages toast notifications with auto-dismiss
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ToastMessage } from '../types';

interface ToastOptions {
  duration?: number; // Duration in ms (0 = no auto-dismiss)
  id?: number;
}

interface UseToastsReturn {
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastMessage['type'], options?: ToastOptions) => number;
  removeToast: (id: number) => void;
  clearAll: () => void;
}

/**
 * Custom hook for managing toast notifications
 * @param defaultDuration - Default duration for toasts (default: 3000ms)
 * @returns Toast management functions and state
 */
export const useToasts = (defaultDuration: number = 3000): UseToastsReturn => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  /**
   * Add a new toast notification
   */
  const addToast = useCallback(
    (message: string, type: ToastMessage['type'], options?: ToastOptions): number => {
      const id = options?.id ?? Date.now() + Math.random();
      const duration = options?.duration ?? defaultDuration;

      const newToast: ToastMessage = {
        id,
        message,
        type,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss after duration (if duration > 0)
      if (duration > 0) {
        const timeout = setTimeout(() => {
          removeToast(id);
        }, duration);

        timeoutsRef.current.set(id, timeout);
      }

      return id;
    },
    [defaultDuration]
  );

  /**
   * Remove a specific toast
   */
  const removeToast = useCallback((id: number): void => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    // Clear timeout if exists
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  /**
   * Clear all toasts
   */
  const clearAll = useCallback((): void => {
    setToasts([]);

    // Clear all timeouts
    for (const timeout of timeoutsRef.current.values()) {
      clearTimeout(timeout);
    }
    timeoutsRef.current.clear();
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      for (const timeout of timeoutsRef.current.values()) {
        clearTimeout(timeout);
      }
      timeoutsRef.current.clear();
    };
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
  };
};

export default useToasts;
