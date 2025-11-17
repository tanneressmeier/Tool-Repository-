/**
 * useOptimizedCallbacks Hook
 * Provides memoized callbacks and performance optimizations
 */

import { useCallback, useMemo, useRef, useEffect } from 'react';

// ============================================================================
// Debounced Callback
// ============================================================================

/**
 * Create a debounced callback that delays execution until after a period of inactivity
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

// ============================================================================
// Throttled Callback
// ============================================================================

/**
 * Create a throttled callback that executes at most once per time period
 * @param callback - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const lastRun = useRef(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= limit) {
        callbackRef.current(...args);
        lastRun.current = now;
      }
    },
    [limit]
  );
}

// ============================================================================
// Async Callback with Loading State
// ============================================================================

interface AsyncCallbackOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface AsyncCallbackReturn<T extends (...args: any[]) => Promise<any>> {
  execute: (...args: Parameters<T>) => Promise<ReturnType<T> | undefined>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Wrap an async callback with loading and error states
 * @param callback - Async function to wrap
 * @param options - Success/error callbacks
 * @returns Object with execute function, loading state, and error
 */
export function useAsyncCallback<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  options: AsyncCallbackOptions = {}
): AsyncCallbackReturn<T> {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const callbackRef = useRef(callback);
  const mountedRef = useRef(true);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await callbackRef.current(...args);

        if (mountedRef.current) {
          setIsLoading(false);
          if (options.onSuccess) options.onSuccess();
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        if (mountedRef.current) {
          setError(error);
          setIsLoading(false);
          if (options.onError) options.onError(error);
        }

        throw error;
      }
    },
    [options]
  );

  return useMemo(
    () => ({
      execute,
      isLoading,
      error,
    }),
    [execute, isLoading, error]
  );
}

// ============================================================================
// Memoized Search/Filter
// ============================================================================

/**
 * Create memoized search function for arrays
 * @param items - Array to search
 * @param searchFn - Search function
 * @param searchTerm - Search term
 * @returns Filtered items
 */
export function useMemoizedSearch<T>(
  items: T[],
  searchFn: (item: T, term: string) => boolean,
  searchTerm: string
): T[] {
  return useMemo(() => {
    if (!searchTerm.trim()) return items;
    return items.filter((item) => searchFn(item, searchTerm));
  }, [items, searchFn, searchTerm]);
}

// ============================================================================
// Stable Callback Reference
// ============================================================================

/**
 * Create a stable callback reference that never changes identity
 * Useful for deps arrays when you want the latest callback but stable reference
 * @param callback - Callback to stabilize
 * @returns Stable callback reference
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef<T>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
}

// ============================================================================
// Optimized Event Handler
// ============================================================================

interface EventHandlerOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

/**
 * Create an optimized event handler with common event operations
 * @param handler - Event handler function
 * @param options - Event options
 * @returns Memoized event handler
 */
export function useEventHandler<T extends React.SyntheticEvent>(
  handler: (event: T) => void,
  options: EventHandlerOptions = {}
): (event: T) => void {
  const { preventDefault = false, stopPropagation = false } = options;

  return useCallback(
    (event: T) => {
      if (preventDefault) event.preventDefault();
      if (stopPropagation) event.stopPropagation();
      handler(event);
    },
    [handler, preventDefault, stopPropagation]
  );
}

// ============================================================================
// Batch State Updates
// ============================================================================

/**
 * Batch multiple state updates together for better performance
 * @param callback - Function containing state updates
 */
export function useBatchedUpdates(): (callback: () => void) => void {
  return useCallback((callback: () => void) => {
    // In React 18+, updates are automatically batched
    // This is a placeholder for explicit batching if needed
    callback();
  }, []);
}

// ============================================================================
// Memoized Handler Factory
// ============================================================================

/**
 * Create a memoized handler factory for list items
 * Prevents recreating handlers for every item in a list
 * @param handler - Handler function that takes an ID
 * @returns Memoized handler factory
 */
export function useHandlerFactory<T = string>(
  handler: (id: T) => void
): (id: T) => () => void {
  const handlerRef = useRef(handler);
  const handlersCache = useRef(new Map<T, () => void>());

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  return useCallback((id: T) => {
    if (!handlersCache.current.has(id)) {
      handlersCache.current.set(id, () => handlerRef.current(id));
    }
    return handlersCache.current.get(id)!;
  }, []);
}

// ============================================================================
// React import for useState
// ============================================================================
import React from 'react';

// ============================================================================
// Exports
// ============================================================================

export default {
  useDebouncedCallback,
  useThrottledCallback,
  useAsyncCallback,
  useMemoizedSearch,
  useStableCallback,
  useEventHandler,
  useBatchedUpdates,
  useHandlerFactory,
};
