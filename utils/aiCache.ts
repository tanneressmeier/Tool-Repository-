/**
 * AI Response Caching System
 * Reduces redundant API calls and improves performance
 */

import { safeLocalStorageGet, safeLocalStorageSet } from './index';
import type { Tool, SourcingInfo, ComparisonResult } from '../types';

// ============================================================================
// Cache Entry Interface
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
  version: number; // For cache versioning/invalidation
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
}

// ============================================================================
// Base Cache Class
// ============================================================================

class AICache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly storageKey: string;
  private readonly defaultTTL: number; // Time to live in milliseconds
  private readonly maxSize: number; // Maximum number of entries
  private readonly version: number;
  private stats: CacheStats;

  constructor(
    storageKey: string,
    defaultTTL: number = 7 * 24 * 60 * 60 * 1000, // 7 days default
    maxSize: number = 100,
    version: number = 1
  ) {
    this.storageKey = `ai-cache-${storageKey}`;
    this.defaultTTL = defaultTTL;
    this.maxSize = maxSize;
    this.version = version;
    this.stats = { hits: 0, misses: 0, evictions: 0, totalSize: 0 };
    this.cache = new Map();

    // Load from localStorage on initialization
    this.loadFromStorage();

    // Clean expired entries
    this.cleanExpired();
  }

  /**
   * Generate cache key from object or string
   */
  private generateKey(keyData: string | object): string {
    if (typeof keyData === 'string') {
      return keyData.toLowerCase().trim();
    }
    // For objects, create a stable string representation
    return JSON.stringify(keyData, Object.keys(keyData).sort());
  }

  /**
   * Set a value in the cache
   */
  set(key: string | object, data: T, ttl?: number): void {
    const cacheKey = this.generateKey(key);
    const expiresAt = Date.now() + (ttl || this.defaultTTL);

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt,
      key: cacheKey,
      version: this.version,
    };

    // If cache is at max size, evict oldest entry
    if (this.cache.size >= this.maxSize && !this.cache.has(cacheKey)) {
      this.evictOldest();
    }

    this.cache.set(cacheKey, entry);
    this.stats.totalSize = this.cache.size;
    this.saveToStorage();
  }

  /**
   * Get a value from the cache
   */
  get(key: string | object): T | null {
    const cacheKey = this.generateKey(key);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(cacheKey);
      this.stats.misses++;
      this.saveToStorage();
      return null;
    }

    // Check version mismatch
    if (entry.version !== this.version) {
      this.cache.delete(cacheKey);
      this.stats.misses++;
      this.saveToStorage();
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string | object): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific entry
   */
  delete(key: string | object): boolean {
    const cacheKey = this.generateKey(key);
    const deleted = this.cache.delete(cacheKey);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0, totalSize: 0 };
    this.saveToStorage();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;
    return { ...this.stats, hitRate };
  }

  /**
   * Clean expired entries
   */
  private cleanExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.evictions += cleaned;
      this.stats.totalSize = this.cache.size;
      this.saveToStorage();
    }
  }

  /**
   * Evict oldest entry (LRU)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      const serialized = Array.from(this.cache.entries());
      safeLocalStorageSet(this.storageKey, serialized);
    } catch (error) {
      console.error('Failed to save cache to localStorage:', error);
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const serialized = safeLocalStorageGet<[string, CacheEntry<T>][]>(
        this.storageKey,
        []
      );

      if (Array.isArray(serialized)) {
        this.cache = new Map(serialized);

        // Clean expired and old version entries
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
          if (now > entry.expiresAt || entry.version !== this.version) {
            this.cache.delete(key);
          }
        }

        this.stats.totalSize = this.cache.size;
      }
    } catch (error) {
      console.error('Failed to load cache from localStorage:', error);
      this.cache = new Map();
    }
  }

  /**
   * Get all keys in cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// ============================================================================
// Specialized Cache Instances
// ============================================================================

/**
 * Cache for tool sourcing information
 * Key: Tool part number + manufacturer
 * TTL: 7 days (pricing can change)
 */
export class SourcingCache extends AICache<SourcingInfo> {
  constructor() {
    super('sourcing', 7 * 24 * 60 * 60 * 1000, 200, 1);
  }

  /**
   * Generate key from tool
   */
  getKey(tool: Tool): string {
    return `${tool.partNumber}-${tool.manufacturer}`.toLowerCase();
  }

  /**
   * Set sourcing info for a tool
   */
  setToolSourcing(tool: Tool, info: SourcingInfo, ttl?: number): void {
    this.set(this.getKey(tool), info, ttl);
  }

  /**
   * Get sourcing info for a tool
   */
  getToolSourcing(tool: Tool): SourcingInfo | null {
    return this.get(this.getKey(tool));
  }

  /**
   * Check if tool has cached sourcing
   */
  hasToolSourcing(tool: Tool): boolean {
    return this.has(this.getKey(tool));
  }
}

/**
 * Cache for tool predictions from job descriptions
 * Key: Job description (normalized)
 * TTL: 30 days (predictions are stable)
 */
export class PredictionCache extends AICache<Tool[]> {
  constructor() {
    super('predictions', 30 * 24 * 60 * 60 * 1000, 50, 1);
  }

  /**
   * Normalize job description for cache key
   */
  private normalizeJobDescription(description: string): string {
    return description
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .slice(0, 500); // Limit key length
  }

  /**
   * Set prediction result
   */
  setPrediction(jobDescription: string, tools: Tool[], ttl?: number): void {
    const key = this.normalizeJobDescription(jobDescription);
    this.set(key, tools, ttl);
  }

  /**
   * Get prediction result
   */
  getPrediction(jobDescription: string): Tool[] | null {
    const key = this.normalizeJobDescription(jobDescription);
    return this.get(key);
  }
}

/**
 * Cache for comparison results
 * Key: Hash of needed tools + master inventory state
 * TTL: 1 hour (inventories change frequently)
 */
export class ComparisonCache extends AICache<ComparisonResult> {
  constructor() {
    super('comparisons', 60 * 60 * 1000, 30, 1);
  }

  /**
   * Generate key from tools lists
   */
  getKey(neededTools: Tool[], masterInventory: Tool[]): string {
    const neededKey = neededTools
      .map((t) => t.partNumber)
      .sort()
      .join(',');
    const masterKey = masterInventory.length.toString();
    return `${neededKey}-${masterKey}`;
  }

  /**
   * Set comparison result
   */
  setComparison(
    neededTools: Tool[],
    masterInventory: Tool[],
    result: ComparisonResult,
    ttl?: number
  ): void {
    const key = this.getKey(neededTools, masterInventory);
    this.set(key, result, ttl);
  }

  /**
   * Get comparison result
   */
  getComparison(
    neededTools: Tool[],
    masterInventory: Tool[]
  ): ComparisonResult | null {
    const key = this.getKey(neededTools, masterInventory);
    return this.get(key);
  }
}

/**
 * Cache for CSV parsing results
 * Key: Hash of CSV content (first 1000 chars)
 * TTL: 24 hours
 */
export class CSVParseCache extends AICache<Tool[]> {
  constructor() {
    super('csv-parse', 24 * 60 * 60 * 1000, 20, 1);
  }

  /**
   * Generate hash from CSV content
   */
  private hashContent(content: string): string {
    // Simple hash of first 1000 chars + length
    const sample = content.slice(0, 1000);
    const length = content.length;

    let hash = 0;
    for (let i = 0; i < sample.length; i++) {
      const char = sample.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `${hash}-${length}`;
  }

  /**
   * Set CSV parse result
   */
  setParseResult(csvContent: string, tools: Tool[], ttl?: number): void {
    const key = this.hashContent(csvContent);
    this.set(key, tools, ttl);
  }

  /**
   * Get CSV parse result
   */
  getParseResult(csvContent: string): Tool[] | null {
    const key = this.hashContent(csvContent);
    return this.get(key);
  }
}

// ============================================================================
// Global Cache Manager
// ============================================================================

export class CacheManager {
  private static instances: Map<string, AICache<any>> = new Map();

  /**
   * Get or create a cache instance
   */
  static getCache<T>(
    name: string,
    ttl?: number,
    maxSize?: number,
    version?: number
  ): AICache<T> {
    if (!this.instances.has(name)) {
      this.instances.set(name, new AICache<T>(name, ttl, maxSize, version));
    }
    return this.instances.get(name)!;
  }

  /**
   * Clear all caches
   */
  static clearAll(): void {
    for (const cache of this.instances.values()) {
      cache.clear();
    }
  }

  /**
   * Get combined statistics for all caches
   */
  static getAllStats(): Record<string, CacheStats & { hitRate: number }> {
    const stats: Record<string, CacheStats & { hitRate: number }> = {};

    for (const [name, cache] of this.instances.entries()) {
      stats[name] = cache.getStats();
    }

    return stats;
  }

  /**
   * Clean expired entries from all caches
   */
  static cleanAll(): void {
    for (const cache of this.instances.values()) {
      cache['cleanExpired'](); // Call private method via bracket notation
    }
  }
}

// ============================================================================
// Singleton Cache Instances (Ready to use)
// ============================================================================

export const sourcingCache = new SourcingCache();
export const predictionCache = new PredictionCache();
export const comparisonCache = new ComparisonCache();
export const csvParseCache = new CSVParseCache();

// ============================================================================
// Exports
// ============================================================================

export default {
  AICache,
  CacheManager,
  sourcingCache,
  predictionCache,
  comparisonCache,
  csvParseCache,
};
