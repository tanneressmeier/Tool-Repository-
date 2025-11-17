/**
 * Optimistic UI Updates Module
 * Provides instant UI feedback while async operations complete
 */

import { useState, useCallback, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

interface OptimisticUpdate<T> {
  id: string;
  type: 'add' | 'update' | 'delete';
  data: T;
  timestamp: number;
}

interface OptimisticOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, rollbackData: T) => void;
  timeout?: number; // Auto-rollback after timeout (ms)
}

// ============================================================================
// useOptimisticUpdate Hook
// ============================================================================

/**
 * Hook for managing optimistic UI updates
 * Updates UI immediately, then confirms or rolls back based on async operation
 */
export function useOptimisticUpdate<T>(initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData);
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, OptimisticUpdate<T>>>(new Map());
  const rollbackTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Add item optimistically
   */
  const addOptimistic = useCallback(
    async (
      item: T,
      asyncOperation: () => Promise<T>,
      options: OptimisticOptions<T> = {}
    ): Promise<boolean> => {
      const updateId = `add-${Date.now()}-${Math.random()}`;
      const update: OptimisticUpdate<T> = {
        id: updateId,
        type: 'add',
        data: item,
        timestamp: Date.now(),
      };

      // Optimistic update - add immediately
      setData((prev) => [...prev, item]);
      setPendingUpdates((prev) => new Map(prev).set(updateId, update));

      // Set auto-rollback timeout if specified
      if (options.timeout) {
        const timeout = setTimeout(() => {
          rollback(updateId);
        }, options.timeout);
        rollbackTimeouts.current.set(updateId, timeout);
      }

      try {
        // Perform async operation
        const result = await asyncOperation();

        // Clear timeout
        const timeout = rollbackTimeouts.current.get(updateId);
        if (timeout) {
          clearTimeout(timeout);
          rollbackTimeouts.current.delete(updateId);
        }

        // Confirm update
        setPendingUpdates((prev) => {
          const next = new Map(prev);
          next.delete(updateId);
          return next;
        });

        // Update with server data (may have additional fields)
        setData((prev) =>
          prev.map((existingItem) => (existingItem === item ? result : existingItem))
        );

        if (options.onSuccess) options.onSuccess(result);
        return true;
      } catch (error) {
        // Rollback on error
        rollback(updateId);

        if (options.onError && error instanceof Error) {
          options.onError(error, item);
        }
        return false;
      }
    },
    []
  );

  /**
   * Update item optimistically
   */
  const updateOptimistic = useCallback(
    async (
      updatedItem: T,
      findFn: (item: T) => boolean,
      asyncOperation: () => Promise<T>,
      options: OptimisticOptions<T> = {}
    ): Promise<boolean> => {
      const updateId = `update-${Date.now()}-${Math.random()}`;

      // Save original for rollback
      const originalItem = data.find(findFn);
      if (!originalItem) {
        console.error('Item not found for optimistic update');
        return false;
      }

      const update: OptimisticUpdate<T> = {
        id: updateId,
        type: 'update',
        data: originalItem,
        timestamp: Date.now(),
      };

      // Optimistic update - update immediately
      setData((prev) => prev.map((item) => (findFn(item) ? updatedItem : item)));
      setPendingUpdates((prev) => new Map(prev).set(updateId, update));

      if (options.timeout) {
        const timeout = setTimeout(() => {
          rollback(updateId);
        }, options.timeout);
        rollbackTimeouts.current.set(updateId, timeout);
      }

      try {
        const result = await asyncOperation();

        const timeout = rollbackTimeouts.current.get(updateId);
        if (timeout) {
          clearTimeout(timeout);
          rollbackTimeouts.current.delete(updateId);
        }

        setPendingUpdates((prev) => {
          const next = new Map(prev);
          next.delete(updateId);
          return next;
        });

        // Update with server data
        setData((prev) => prev.map((item) => (findFn(item) ? result : item)));

        if (options.onSuccess) options.onSuccess(result);
        return true;
      } catch (error) {
        rollback(updateId);

        if (options.onError && error instanceof Error) {
          options.onError(error, originalItem);
        }
        return false;
      }
    },
    [data]
  );

  /**
   * Delete item optimistically
   */
  const deleteOptimistic = useCallback(
    async (
      findFn: (item: T) => boolean,
      asyncOperation: () => Promise<void>,
      options: OptimisticOptions<T> = {}
    ): Promise<boolean> => {
      const updateId = `delete-${Date.now()}-${Math.random()}`;

      // Save original for rollback
      const itemToDelete = data.find(findFn);
      if (!itemToDelete) {
        console.error('Item not found for optimistic delete');
        return false;
      }

      const update: OptimisticUpdate<T> = {
        id: updateId,
        type: 'delete',
        data: itemToDelete,
        timestamp: Date.now(),
      };

      // Optimistic update - delete immediately
      setData((prev) => prev.filter((item) => !findFn(item)));
      setPendingUpdates((prev) => new Map(prev).set(updateId, update));

      if (options.timeout) {
        const timeout = setTimeout(() => {
          rollback(updateId);
        }, options.timeout);
        rollbackTimeouts.current.set(updateId, timeout);
      }

      try {
        await asyncOperation();

        const timeout = rollbackTimeouts.current.get(updateId);
        if (timeout) {
          clearTimeout(timeout);
          rollbackTimeouts.current.delete(updateId);
        }

        setPendingUpdates((prev) => {
          const next = new Map(prev);
          next.delete(updateId);
          return next;
        });

        if (options.onSuccess) options.onSuccess(itemToDelete);
        return true;
      } catch (error) {
        rollback(updateId);

        if (options.onError && error instanceof Error) {
          options.onError(error, itemToDelete);
        }
        return false;
      }
    },
    [data]
  );

  /**
   * Rollback a pending update
   */
  const rollback = useCallback((updateId: string) => {
    const update = pendingUpdates.get(updateId);
    if (!update) return;

    switch (update.type) {
      case 'add':
        // Remove the optimistically added item
        setData((prev) => prev.filter((item) => item !== update.data));
        break;

      case 'update':
        // Restore the original item
        setData((prev) =>
          prev.map((item) => {
            // Find and replace with original
            // This is a simplification - in real use, you'd need a better way to identify items
            return item === prev[prev.indexOf(item)] ? update.data : item;
          })
        );
        break;

      case 'delete':
        // Restore the deleted item
        setData((prev) => [...prev, update.data]);
        break;
    }

    setPendingUpdates((prev) => {
      const next = new Map(prev);
      next.delete(updateId);
      return next;
    });

    const timeout = rollbackTimeouts.current.get(updateId);
    if (timeout) {
      clearTimeout(timeout);
      rollbackTimeouts.current.delete(updateId);
    }
  }, [pendingUpdates]);

  /**
   * Check if there are pending updates
   */
  const hasPendingUpdates = useCallback((): boolean => {
    return pendingUpdates.size > 0;
  }, [pendingUpdates]);

  /**
   * Get count of pending updates
   */
  const getPendingCount = useCallback((): number => {
    return pendingUpdates.size;
  }, [pendingUpdates]);

  return {
    data,
    setData,
    addOptimistic,
    updateOptimistic,
    deleteOptimistic,
    rollback,
    hasPendingUpdates,
    getPendingCount,
    pendingUpdates,
  };
}

// ============================================================================
// Standalone Optimistic Update Helper
// ============================================================================

/**
 * Simple optimistic update helper for one-off operations
 */
export async function performOptimisticUpdate<T, R>(
  currentData: T,
  optimisticData: T,
  updateUI: (data: T) => void,
  asyncOperation: () => Promise<R>,
  onSuccess?: (result: R) => void,
  onError?: (error: Error) => void
): Promise<boolean> {
  // Update UI immediately
  updateUI(optimisticData);

  try {
    // Perform async operation
    const result = await asyncOperation();

    // Success callback
    if (onSuccess) onSuccess(result);
    return true;
  } catch (error) {
    // Rollback on error
    updateUI(currentData);

    // Error callback
    if (onError && error instanceof Error) {
      onError(error);
    }
    return false;
  }
}

// ============================================================================
// Optimistic List Operations
// ============================================================================

export class OptimisticList<T> {
  private data: T[];
  private pendingOperations: Set<string> = new Set();

  constructor(initialData: T[]) {
    this.data = initialData;
  }

  /**
   * Get current data
   */
  getData(): T[] {
    return [...this.data];
  }

  /**
   * Add item optimistically
   */
  async add(
    item: T,
    asyncFn: () => Promise<T>,
    onUpdate: (data: T[]) => void
  ): Promise<boolean> {
    const operationId = `add-${Date.now()}`;
    this.pendingOperations.add(operationId);

    // Add optimistically
    this.data = [...this.data, item];
    onUpdate(this.data);

    try {
      const result = await asyncFn();
      // Replace optimistic item with real result
      this.data = this.data.map((i) => (i === item ? result : i));
      onUpdate(this.data);
      return true;
    } catch (error) {
      // Rollback
      this.data = this.data.filter((i) => i !== item);
      onUpdate(this.data);
      return false;
    } finally {
      this.pendingOperations.delete(operationId);
    }
  }

  /**
   * Update item optimistically
   */
  async update(
    predicate: (item: T) => boolean,
    updatedItem: T,
    asyncFn: () => Promise<T>,
    onUpdate: (data: T[]) => void
  ): Promise<boolean> {
    const operationId = `update-${Date.now()}`;
    this.pendingOperations.add(operationId);

    // Save original for rollback
    const originalItem = this.data.find(predicate);
    if (!originalItem) return false;

    // Update optimistically
    this.data = this.data.map((item) => (predicate(item) ? updatedItem : item));
    onUpdate(this.data);

    try {
      const result = await asyncFn();
      // Update with real result
      this.data = this.data.map((item) => (predicate(item) ? result : item));
      onUpdate(this.data);
      return true;
    } catch (error) {
      // Rollback
      this.data = this.data.map((item) => (predicate(item) ? originalItem : item));
      onUpdate(this.data);
      return false;
    } finally {
      this.pendingOperations.delete(operationId);
    }
  }

  /**
   * Delete item optimistically
   */
  async delete(
    predicate: (item: T) => boolean,
    asyncFn: () => Promise<void>,
    onUpdate: (data: T[]) => void
  ): Promise<boolean> {
    const operationId = `delete-${Date.now()}`;
    this.pendingOperations.add(operationId);

    // Save original for rollback
    const itemToDelete = this.data.find(predicate);
    if (!itemToDelete) return false;

    // Delete optimistically
    this.data = this.data.filter((item) => !predicate(item));
    onUpdate(this.data);

    try {
      await asyncFn();
      return true;
    } catch (error) {
      // Rollback
      this.data = [...this.data, itemToDelete];
      onUpdate(this.data);
      return false;
    } finally {
      this.pendingOperations.delete(operationId);
    }
  }

  /**
   * Check if there are pending operations
   */
  hasPendingOperations(): boolean {
    return this.pendingOperations.size > 0;
  }
}

// ============================================================================
// Exports
// ============================================================================

export default {
  useOptimisticUpdate,
  performOptimisticUpdate,
  OptimisticList,
};
