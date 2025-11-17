/**
 * Utility Functions Module
 * Centralized utilities for the Tool Inventory Checker application
 */

import type { Tool } from '../types';

// ============================================================================
// Date & Time Utilities
// ============================================================================

/**
 * Format a date string or Date object to localized string
 * @param date - ISO string, Date object, or timestamp
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date | number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string => {
  try {
    return new Date(date).toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Invalid date format:', date);
    return 'Invalid Date';
  }
};

/**
 * Format a date to relative time (e.g., "2 days ago", "in 5 hours")
 * @param date - ISO string or Date object
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = Date.now();
  const targetTime = new Date(date).getTime();
  const diffMs = targetTime - now;
  const diffDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));

  if (diffMs > 0) {
    // Future
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 30) return `In ${Math.floor(diffDays / 7)} weeks`;
    return formatDate(date);
  } else {
    // Past
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(date);
  }
};

/**
 * Calculate calibration status from due days
 * @param dueDays - Days until calibration due (negative if overdue)
 * @returns Status string
 */
export const getCalibrationStatus = (dueDays?: number): string => {
  if (dueDays === undefined || dueDays === null) return 'N/A';
  if (dueDays < 0) return 'Overdue';
  if (dueDays < 30) return 'Due Soon';
  return 'Current';
};

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate a unique ID with optional prefix
 * @param prefix - Prefix for the ID (e.g., 'tool', 'ac', 'kit')
 * @returns Unique ID string
 */
export const generateId = (prefix: string = 'id'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Generate a UUID v4
 * @returns UUID string
 */
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Normalize part number (trim, uppercase, standardize separators)
 * @param partNumber - Raw part number
 * @returns Normalized part number
 */
export const normalizePartNumber = (partNumber: string): string => {
  return partNumber
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[_]+/g, '-');
};

/**
 * Normalize manufacturer name (trim, title case, handle common variations)
 * @param manufacturer - Raw manufacturer name
 * @returns Normalized manufacturer name
 */
export const normalizeManufacturer = (manufacturer: string): string => {
  const aliases: Record<string, string> = {
    'snap-on': 'Snap-on',
    'snapon': 'Snap-on',
    'cdi': 'CDI Torque Products',
    'cdi torque': 'CDI Torque Products',
    'tronair': 'Tronair',
    'n/a': 'N/A',
    'unknown': 'N/A',
  };

  const lower = manufacturer.trim().toLowerCase();
  return aliases[lower] || toTitleCase(manufacturer.trim());
};

/**
 * Convert string to Title Case
 * @param str - Input string
 * @returns Title cased string
 */
export const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
};

/**
 * Truncate string to max length with ellipsis
 * @param str - Input string
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
};

/**
 * Extract initials from a name (e.g., "John Doe" → "JD")
 * @param name - Full name
 * @returns Initials
 */
export const getInitials = (name: string): string => {
  return name
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// ============================================================================
// Data Validation
// ============================================================================

/**
 * Check if a string is a valid part number
 * @param partNumber - Part number to validate
 * @returns True if valid
 */
export const isValidPartNumber = (partNumber: string): boolean => {
  if (!partNumber || partNumber.trim() === '') return false;
  if (partNumber.toLowerCase() === 'n/a') return false;
  // Part numbers should be at least 2 characters and contain alphanumeric
  return /^[A-Za-z0-9][A-Za-z0-9\-_\/\.]{1,}$/.test(partNumber.trim());
};

/**
 * Check if a tool object has required fields
 * @param tool - Tool object to validate
 * @returns True if valid
 */
export const isValidTool = (tool: Partial<Tool>): boolean => {
  return !!(
    tool.name &&
    tool.name.trim() !== '' &&
    tool.manufacturer &&
    tool.manufacturer.trim() !== '' &&
    tool.partNumber &&
    isValidPartNumber(tool.partNumber)
  );
};

// ============================================================================
// Number Utilities
// ============================================================================

/**
 * Format number as currency (USD)
 * @param amount - Amount to format
 * @param includeCents - Whether to include cents
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number | string,
  includeCents: boolean = true
): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: includeCents ? 2 : 0,
    maximumFractionDigits: includeCents ? 2 : 0,
  }).format(num);
};

/**
 * Parse currency string to number
 * @param currencyStr - Currency string (e.g., "$1,234.56")
 * @returns Numeric value
 */
export const parseCurrency = (currencyStr: string): number => {
  const cleaned = currencyStr.replace(/[^0-9.-]+/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Format number with thousands separators
 * @param num - Number to format
 * @returns Formatted string
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// ============================================================================
// Array & Collection Utilities
// ============================================================================

/**
 * Sort array of tools by name (case-insensitive)
 * @param tools - Array of tools
 * @returns Sorted array (does not mutate original)
 */
export const sortToolsByName = (tools: Tool[]): Tool[] => {
  return [...tools].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
};

/**
 * Group tools by category
 * @param tools - Array of tools
 * @returns Map of category -> tools
 */
export const groupToolsByCategory = (
  tools: Tool[]
): Map<string, Tool[]> => {
  const grouped = new Map<string, Tool[]>();

  for (const tool of tools) {
    const category = tool.category || 'Uncategorized';
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(tool);
  }

  return grouped;
};

/**
 * Remove duplicates from array based on a key function
 * @param array - Input array
 * @param keyFn - Function to extract unique key from each item
 * @returns Deduplicated array
 */
export const uniqueBy = <T>(
  array: T[],
  keyFn: (item: T) => string | number
): T[] => {
  const seen = new Set<string | number>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Chunk array into smaller arrays of specified size
 * @param array - Input array
 * @param size - Chunk size
 * @returns Array of chunks
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// ============================================================================
// Function Utilities
// ============================================================================

/**
 * Debounce a function
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle a function
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let lastRun = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun >= limit) {
      fn(...args);
      lastRun = now;
    }
  };
};

/**
 * Create a delayed promise
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry an async function with exponential backoff
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in ms (doubles each retry)
 * @returns Result of function or throws last error
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delayMs = baseDelay * Math.pow(2, attempt);
        console.warn(
          `Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`
        );
        await delay(delayMs);
      }
    }
  }

  throw lastError;
};

// ============================================================================
// Storage Utilities
// ============================================================================

/**
 * Safely parse JSON from localStorage
 * @param key - localStorage key
 * @param defaultValue - Default value if parse fails
 * @returns Parsed value or default
 */
export const safeLocalStorageGet = <T>(
  key: string,
  defaultValue: T
): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Failed to parse localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Safely set JSON in localStorage with error handling
 * @param key - localStorage key
 * @param value - Value to store
 * @returns True if successful
 */
export const safeLocalStorageSet = (key: string, value: unknown): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
    } else {
      console.error(`Failed to set localStorage key "${key}":`, error);
    }
    return false;
  }
};

/**
 * Get approximate localStorage usage in bytes
 * @returns Object with used and total bytes (approximate)
 */
export const getStorageUsage = (): { used: number; limit: number } => {
  let used = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length;
    }
  }

  // Most browsers have 5-10MB limit, we'll assume 5MB
  const limit = 5 * 1024 * 1024;

  return { used, limit };
};

// ============================================================================
// Search & Filter Utilities
// ============================================================================

/**
 * Fuzzy search - check if search term matches text
 * @param text - Text to search in
 * @param searchTerm - Search term
 * @returns True if matches
 */
export const fuzzyMatch = (text: string, searchTerm: string): boolean => {
  const normalizedText = text.toLowerCase();
  const normalizedSearch = searchTerm.toLowerCase();

  // Exact match
  if (normalizedText.includes(normalizedSearch)) return true;

  // Fuzzy match: all characters in search appear in order in text
  let searchIndex = 0;
  for (let i = 0; i < normalizedText.length && searchIndex < normalizedSearch.length; i++) {
    if (normalizedText[i] === normalizedSearch[searchIndex]) {
      searchIndex++;
    }
  }

  return searchIndex === normalizedSearch.length;
};

/**
 * Filter tools by search term across multiple fields
 * @param tools - Array of tools
 * @param searchTerm - Search term
 * @returns Filtered tools
 */
export const searchTools = (tools: Tool[], searchTerm: string): Tool[] => {
  if (!searchTerm.trim()) return tools;

  const term = searchTerm.trim().toLowerCase();

  return tools.filter((tool) => {
    return (
      fuzzyMatch(tool.name, term) ||
      fuzzyMatch(tool.manufacturer, term) ||
      fuzzyMatch(tool.partNumber, term) ||
      (tool.serialNumber && fuzzyMatch(tool.serialNumber, term)) ||
      (tool.category && fuzzyMatch(tool.category, term)) ||
      (tool.location && fuzzyMatch(tool.location, term))
    );
  });
};

// ============================================================================
// CSV Utilities
// ============================================================================

/**
 * Convert array of tools to CSV string
 * @param tools - Array of tools
 * @returns CSV string
 */
export const toolsToCSV = (tools: Tool[]): string => {
  const headers = [
    'Part Number',
    'Name',
    'Manufacturer',
    'Serial Number',
    'Category',
    'Calibration Status',
    'Calibration Due Days',
    'Location',
  ];

  const rows = tools.map((tool) => [
    tool.partNumber,
    tool.name,
    tool.manufacturer,
    tool.serialNumber,
    tool.category || '',
    tool.calibrationStatus || '',
    tool.calibrationDueDays?.toString() || '',
    tool.location || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

/**
 * Download data as CSV file
 * @param data - CSV string
 * @param filename - Filename (without extension)
 */
export const downloadCSV = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ============================================================================
// Error Utilities
// ============================================================================

/**
 * Extract user-friendly error message from Error object
 * @param error - Error or unknown
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('API_KEY')) {
      return 'Please configure your Gemini API key';
    }
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return 'API rate limit exceeded. Please wait a moment and try again.';
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error. Please check your internet connection.';
    }
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unknown error occurred';
};

/**
 * Check if error is a rate limit error
 * @param error - Error object
 * @returns True if rate limit error
 */
export const isRateLimitError = (error: unknown): boolean => {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('rate limit') ||
    message.includes('429') ||
    message.includes('resource_exhausted') ||
    message.includes('quota')
  );
};

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for Tool objects
 * @param obj - Object to check
 * @returns True if object is a Tool
 */
export const isTool = (obj: any): obj is Tool => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.name === 'string' &&
    typeof obj.manufacturer === 'string' &&
    typeof obj.partNumber === 'string' &&
    typeof obj.serialNumber === 'string'
  );
};

// ============================================================================
// Exports
// ============================================================================

export default {
  // Date & Time
  formatDate,
  formatRelativeTime,
  getCalibrationStatus,

  // ID Generation
  generateId,
  generateUUID,

  // String
  normalizePartNumber,
  normalizeManufacturer,
  toTitleCase,
  truncate,
  getInitials,

  // Validation
  isValidPartNumber,
  isValidTool,

  // Number
  formatCurrency,
  parseCurrency,
  formatNumber,

  // Array & Collections
  sortToolsByName,
  groupToolsByCategory,
  uniqueBy,
  chunk,

  // Functions
  debounce,
  throttle,
  delay,
  retryWithBackoff,

  // Storage
  safeLocalStorageGet,
  safeLocalStorageSet,
  getStorageUsage,

  // Search & Filter
  fuzzyMatch,
  searchTools,

  // CSV
  toolsToCSV,
  downloadCSV,

  // Error
  getErrorMessage,
  isRateLimitError,

  // Type Guards
  isTool,
};
