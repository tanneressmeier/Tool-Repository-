/**
 * useDataPersistence Hook
 * Manages debounced auto-save to localStorage
 */

import { useEffect, useRef } from 'react';

interface UseDataPersistenceOptions<T> {
  data: T;
  saveFunction: (data: T) => Promise<void>;
  onError?: (error: Error) => void;
  debounceMs?: number;
  enabled?: boolean; // Can disable persistence temporarily
}

/**
 * Custom hook for debounced data persistence
 * @param options - Configuration options
 */
export const useDataPersistence = <T>({
  data,
  saveFunction,
  onError,
  debounceMs = 1000,
  enabled = true,
}: UseDataPersistenceOptions<T>): void => {
  const isInitialMount = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Skip if disabled
    if (!enabled) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(async () => {
      try {
        await saveFunction(data);
      } catch (error) {
        console.error('Failed to save data:', error);
        if (onError && error instanceof Error) {
          onError(error);
        }
      }
    }, debounceMs);

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveFunction, onError, debounceMs, enabled]);
};

/**
 * Hook for immediate (non-debounced) save
 * Useful for critical operations that should save immediately
 */
export const useImmediateSave = <T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  onError?: (error: Error) => void,
  enabled: boolean = true
): void => {
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!enabled) return;

    saveFunction(data).catch((error) => {
      console.error('Failed to save data:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    });
  }, [data, saveFunction, onError, enabled]);
};

export default useDataPersistence;
