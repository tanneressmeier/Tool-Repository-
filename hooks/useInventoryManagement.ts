/**
 * useInventoryManagement Hook
 * Manages master inventory CRUD operations with validation
 */

import { useState, useCallback, useMemo } from 'react';
import type { Tool } from '../types';
import { validateTool, formatValidationErrors } from '../utils/validation';
import { generateId, normalizePartNumber, normalizeManufacturer } from '../utils';

interface UseInventoryManagementOptions {
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

interface UseInventoryManagementReturn {
  // State
  inventory: Tool[];
  isLoading: boolean;

  // Operations
  addTool: (tool: Omit<Tool, 'toolId' | 'serialNumber'> & { serialNumber?: string }) => boolean;
  updateTool: (tool: Tool) => boolean;
  deleteTool: (toolId: string) => boolean;
  deleteTools: (toolIds: string[]) => boolean;
  setInventory: (inventory: Tool[]) => void;

  // Queries
  findToolByPartNumber: (partNumber: string) => Tool | undefined;
  findToolsByCategory: (category: string) => Tool[];
  findToolsByManufacturer: (manufacturer: string) => Tool[];
  getToolCount: () => number;
  getCategoryCount: () => Map<string, number>;

  // Validation
  validateAndNormalizeTool: (tool: Partial<Tool>) => { valid: boolean; tool?: Tool; errors?: string };
}

/**
 * Custom hook for managing master inventory with validation and normalization
 */
export const useInventoryManagement = (
  initialInventory: Tool[] = [],
  options: UseInventoryManagementOptions = {}
): UseInventoryManagementReturn => {
  const { onError, onSuccess } = options;

  const [inventory, setInventory] = useState<Tool[]>(initialInventory);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Validate and normalize a tool
   */
  const validateAndNormalizeTool = useCallback(
    (tool: Partial<Tool>): { valid: boolean; tool?: Tool; errors?: string } => {
      // Normalize data
      const normalized = {
        ...tool,
        partNumber: tool.partNumber ? normalizePartNumber(tool.partNumber) : '',
        manufacturer: tool.manufacturer ? normalizeManufacturer(tool.manufacturer) : '',
        name: tool.name?.trim() || '',
        serialNumber: tool.serialNumber || 'N/A',
      };

      // Validate
      const validation = validateTool(normalized);

      if (!validation.success) {
        const errorMessage = formatValidationErrors(validation.errors || []);
        return { valid: false, errors: errorMessage };
      }

      return { valid: true, tool: validation.data };
    },
    []
  );

  /**
   * Add a new tool to inventory
   */
  const addTool = useCallback(
    (newTool: Omit<Tool, 'toolId' | 'serialNumber'> & { serialNumber?: string }): boolean => {
      const toolToAdd = {
        ...newTool,
        toolId: generateId('tool'),
        serialNumber: newTool.serialNumber || 'N/A',
      };

      const { valid, tool, errors } = validateAndNormalizeTool(toolToAdd);

      if (!valid || !tool) {
        if (onError) onError(errors || 'Invalid tool data');
        return false;
      }

      // Check for duplicate serial number (if not N/A)
      if (tool.serialNumber !== 'N/A') {
        const duplicate = inventory.find((t) => t.serialNumber === tool.serialNumber);
        if (duplicate) {
          if (onError) onError(`Tool with serial number ${tool.serialNumber} already exists`);
          return false;
        }
      }

      setInventory((prev) => [...prev, tool]);

      if (onSuccess) onSuccess(`Tool "${tool.name}" added successfully`);
      return true;
    },
    [inventory, validateAndNormalizeTool, onError, onSuccess]
  );

  /**
   * Update an existing tool
   */
  const updateTool = useCallback(
    (updatedTool: Tool): boolean => {
      const { valid, tool, errors } = validateAndNormalizeTool(updatedTool);

      if (!valid || !tool) {
        if (onError) onError(errors || 'Invalid tool data');
        return false;
      }

      const exists = inventory.find((t) => t.toolId === tool.toolId);
      if (!exists) {
        if (onError) onError('Tool not found');
        return false;
      }

      // Check for duplicate serial number (excluding self)
      if (tool.serialNumber !== 'N/A') {
        const duplicate = inventory.find(
          (t) => t.serialNumber === tool.serialNumber && t.toolId !== tool.toolId
        );
        if (duplicate) {
          if (onError) onError(`Another tool with serial number ${tool.serialNumber} already exists`);
          return false;
        }
      }

      setInventory((prev) => prev.map((t) => (t.toolId === tool.toolId ? tool : t)));

      if (onSuccess) onSuccess(`Tool "${tool.name}" updated successfully`);
      return true;
    },
    [inventory, validateAndNormalizeTool, onError, onSuccess]
  );

  /**
   * Delete a single tool
   */
  const deleteTool = useCallback(
    (toolId: string): boolean => {
      const tool = inventory.find((t) => t.toolId === toolId);
      if (!tool) {
        if (onError) onError('Tool not found');
        return false;
      }

      setInventory((prev) => prev.filter((t) => t.toolId !== toolId));

      if (onSuccess) onSuccess(`Tool "${tool.name}" deleted`);
      return true;
    },
    [inventory, onError, onSuccess]
  );

  /**
   * Delete multiple tools
   */
  const deleteTools = useCallback(
    (toolIds: string[]): boolean => {
      if (toolIds.length === 0) {
        if (onError) onError('No tools selected for deletion');
        return false;
      }

      const count = toolIds.length;
      setInventory((prev) => prev.filter((t) => !toolIds.includes(t.toolId || '')));

      if (onSuccess) onSuccess(`${count} tool(s) deleted`);
      return true;
    },
    [onError, onSuccess]
  );

  /**
   * Find tool by part number
   */
  const findToolByPartNumber = useCallback(
    (partNumber: string): Tool | undefined => {
      const normalized = normalizePartNumber(partNumber);
      return inventory.find((t) => normalizePartNumber(t.partNumber) === normalized);
    },
    [inventory]
  );

  /**
   * Find tools by category
   */
  const findToolsByCategory = useCallback(
    (category: string): Tool[] => {
      return inventory.filter((t) => t.category?.toLowerCase() === category.toLowerCase());
    },
    [inventory]
  );

  /**
   * Find tools by manufacturer
   */
  const findToolsByManufacturer = useCallback(
    (manufacturer: string): Tool[] => {
      const normalized = normalizeManufacturer(manufacturer);
      return inventory.filter((t) => normalizeManufacturer(t.manufacturer) === normalized);
    },
    [inventory]
  );

  /**
   * Get total tool count
   */
  const getToolCount = useCallback((): number => {
    return inventory.length;
  }, [inventory]);

  /**
   * Get category counts
   */
  const getCategoryCount = useCallback((): Map<string, number> => {
    const counts = new Map<string, number>();
    inventory.forEach((tool) => {
      const category = tool.category || 'Uncategorized';
      counts.set(category, (counts.get(category) || 0) + 1);
    });
    return counts;
  }, [inventory]);

  // Memoized values
  const memoizedReturn = useMemo(
    () => ({
      inventory,
      isLoading,
      addTool,
      updateTool,
      deleteTool,
      deleteTools,
      setInventory,
      findToolByPartNumber,
      findToolsByCategory,
      findToolsByManufacturer,
      getToolCount,
      getCategoryCount,
      validateAndNormalizeTool,
    }),
    [
      inventory,
      isLoading,
      addTool,
      updateTool,
      deleteTool,
      deleteTools,
      findToolByPartNumber,
      findToolsByCategory,
      findToolsByManufacturer,
      getToolCount,
      getCategoryCount,
      validateAndNormalizeTool,
    ]
  );

  return memoizedReturn;
};

export default useInventoryManagement;
