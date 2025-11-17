/**
 * Validation Module
 * Provides runtime validation with detailed error messages
 *
 * Note: This module uses TypeScript validation. For production, consider
 * installing Zod for enhanced schema validation:
 * npm install zod
 */

import type { Tool, AircraftData, Kit, PurchasePlanItem, SavedToolList, SavedComparison } from '../types';

// ============================================================================
// Validation Result Types
// ============================================================================

export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// Validation Rules
// ============================================================================

const ValidationRules = {
  // String validations
  required: (value: unknown, fieldName: string): ValidationError | null => {
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      return {
        field: fieldName,
        message: `${fieldName} is required`,
        code: 'REQUIRED',
      };
    }
    return null;
  },

  minLength: (value: string, min: number, fieldName: string): ValidationError | null => {
    if (value.length < min) {
      return {
        field: fieldName,
        message: `${fieldName} must be at least ${min} characters`,
        code: 'MIN_LENGTH',
      };
    }
    return null;
  },

  maxLength: (value: string, max: number, fieldName: string): ValidationError | null => {
    if (value.length > max) {
      return {
        field: fieldName,
        message: `${fieldName} must be at most ${max} characters`,
        code: 'MAX_LENGTH',
      };
    }
    return null;
  },

  pattern: (value: string, pattern: RegExp, fieldName: string, patternName: string): ValidationError | null => {
    if (!pattern.test(value)) {
      return {
        field: fieldName,
        message: `${fieldName} must be a valid ${patternName}`,
        code: 'INVALID_FORMAT',
      };
    }
    return null;
  },

  // Number validations
  min: (value: number, min: number, fieldName: string): ValidationError | null => {
    if (value < min) {
      return {
        field: fieldName,
        message: `${fieldName} must be at least ${min}`,
        code: 'MIN_VALUE',
      };
    }
    return null;
  },

  max: (value: number, max: number, fieldName: string): ValidationError | null => {
    if (value > max) {
      return {
        field: fieldName,
        message: `${fieldName} must be at most ${max}`,
        code: 'MAX_VALUE',
      };
    }
    return null;
  },

  // Type validations
  isString: (value: unknown, fieldName: string): ValidationError | null => {
    if (typeof value !== 'string') {
      return {
        field: fieldName,
        message: `${fieldName} must be a string`,
        code: 'INVALID_TYPE',
      };
    }
    return null;
  },

  isNumber: (value: unknown, fieldName: string): ValidationError | null => {
    if (typeof value !== 'number' || isNaN(value)) {
      return {
        field: fieldName,
        message: `${fieldName} must be a number`,
        code: 'INVALID_TYPE',
      };
    }
    return null;
  },

  isArray: (value: unknown, fieldName: string): ValidationError | null => {
    if (!Array.isArray(value)) {
      return {
        field: fieldName,
        message: `${fieldName} must be an array`,
        code: 'INVALID_TYPE',
      };
    }
    return null;
  },

  // Custom validations
  isValidPartNumber: (value: string, fieldName: string): ValidationError | null => {
    if (value.toLowerCase() === 'n/a') {
      return null; // N/A is valid
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9\-_\/\.]{1,}$/.test(value.trim())) {
      return {
        field: fieldName,
        message: `${fieldName} must contain at least 2 alphanumeric characters`,
        code: 'INVALID_PART_NUMBER',
      };
    }
    return null;
  },

  isValidDate: (value: string, fieldName: string): ValidationError | null => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return {
        field: fieldName,
        message: `${fieldName} must be a valid date`,
        code: 'INVALID_DATE',
      };
    }
    return null;
  },

  isValidCalibrationStatus: (value: string, fieldName: string): ValidationError | null => {
    const validStatuses = ['Current', 'Due Soon', 'Overdue', 'N/A'];
    if (!validStatuses.includes(value)) {
      return {
        field: fieldName,
        message: `${fieldName} must be one of: ${validStatuses.join(', ')}`,
        code: 'INVALID_ENUM',
      };
    }
    return null;
  },
};

// ============================================================================
// Tool Validation
// ============================================================================

export function validateTool(tool: unknown): ValidationResult<Tool> {
  const errors: ValidationError[] = [];

  if (typeof tool !== 'object' || tool === null) {
    return {
      success: false,
      errors: [{ field: 'tool', message: 'Tool must be an object', code: 'INVALID_TYPE' }],
    };
  }

  const t = tool as Partial<Tool>;

  // Required fields
  const requiredError = ValidationRules.required(t.name, 'name');
  if (requiredError) errors.push(requiredError);

  const manufacturerError = ValidationRules.required(t.manufacturer, 'manufacturer');
  if (manufacturerError) errors.push(manufacturerError);

  const partNumberError = ValidationRules.required(t.partNumber, 'partNumber');
  if (partNumberError) errors.push(partNumberError);

  const serialNumberError = ValidationRules.required(t.serialNumber, 'serialNumber');
  if (serialNumberError) errors.push(serialNumberError);

  // String validations
  if (t.name && typeof t.name === 'string') {
    const minLengthError = ValidationRules.minLength(t.name, 2, 'name');
    if (minLengthError) errors.push(minLengthError);

    const maxLengthError = ValidationRules.maxLength(t.name, 200, 'name');
    if (maxLengthError) errors.push(maxLengthError);
  }

  if (t.manufacturer && typeof t.manufacturer === 'string') {
    const minLengthError = ValidationRules.minLength(t.manufacturer, 1, 'manufacturer');
    if (minLengthError) errors.push(minLengthError);
  }

  if (t.partNumber && typeof t.partNumber === 'string') {
    const partNumberValidError = ValidationRules.isValidPartNumber(t.partNumber, 'partNumber');
    if (partNumberValidError) errors.push(partNumberValidError);
  }

  // Optional validations
  if (t.calibrationStatus) {
    const statusError = ValidationRules.isValidCalibrationStatus(t.calibrationStatus, 'calibrationStatus');
    if (statusError) errors.push(statusError);
  }

  if (t.calibrationDueDays !== undefined) {
    const typeError = ValidationRules.isNumber(t.calibrationDueDays, 'calibrationDueDays');
    if (typeError) errors.push(typeError);
  }

  if (t.category && typeof t.category === 'string') {
    const maxLengthError = ValidationRules.maxLength(t.category, 100, 'category');
    if (maxLengthError) errors.push(maxLengthError);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: t as Tool };
}

// ============================================================================
// Aircraft Data Validation
// ============================================================================

export function validateAircraftData(aircraft: unknown): ValidationResult<AircraftData> {
  const errors: ValidationError[] = [];

  if (typeof aircraft !== 'object' || aircraft === null) {
    return {
      success: false,
      errors: [{ field: 'aircraft', message: 'Aircraft must be an object', code: 'INVALID_TYPE' }],
    };
  }

  const a = aircraft as Partial<AircraftData>;

  // Required fields
  const idError = ValidationRules.required(a.id, 'id');
  if (idError) errors.push(idError);

  const nameError = ValidationRules.required(a.name, 'name');
  if (nameError) errors.push(nameError);

  const createdAtError = ValidationRules.required(a.createdAt, 'createdAt');
  if (createdAtError) errors.push(createdAtError);

  // String validations
  if (a.name && typeof a.name === 'string') {
    const minLengthError = ValidationRules.minLength(a.name, 2, 'name');
    if (minLengthError) errors.push(minLengthError);

    const maxLengthError = ValidationRules.maxLength(a.name, 100, 'name');
    if (maxLengthError) errors.push(maxLengthError);
  }

  // Date validation
  if (a.createdAt && typeof a.createdAt === 'string') {
    const dateError = ValidationRules.isValidDate(a.createdAt, 'createdAt');
    if (dateError) errors.push(dateError);
  }

  // Array validations
  if (a.toolLists !== undefined) {
    const arrayError = ValidationRules.isArray(a.toolLists, 'toolLists');
    if (arrayError) errors.push(arrayError);
  }

  if (a.comparisons !== undefined) {
    const arrayError = ValidationRules.isArray(a.comparisons, 'comparisons');
    if (arrayError) errors.push(arrayError);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: a as AircraftData };
}

// ============================================================================
// Kit Validation
// ============================================================================

export function validateKit(kit: unknown): ValidationResult<Kit> {
  const errors: ValidationError[] = [];

  if (typeof kit !== 'object' || kit === null) {
    return {
      success: false,
      errors: [{ field: 'kit', message: 'Kit must be an object', code: 'INVALID_TYPE' }],
    };
  }

  const k = kit as Partial<Kit>;

  // Required fields
  const idError = ValidationRules.required(k.id, 'id');
  if (idError) errors.push(idError);

  const nameError = ValidationRules.required(k.name, 'name');
  if (nameError) errors.push(nameError);

  const toolsError = ValidationRules.required(k.tools, 'tools');
  if (toolsError) errors.push(toolsError);

  const createdAtError = ValidationRules.required(k.createdAt, 'createdAt');
  if (createdAtError) errors.push(createdAtError);

  // String validations
  if (k.name && typeof k.name === 'string') {
    const minLengthError = ValidationRules.minLength(k.name, 2, 'name');
    if (minLengthError) errors.push(minLengthError);

    const maxLengthError = ValidationRules.maxLength(k.name, 100, 'name');
    if (maxLengthError) errors.push(maxLengthError);
  }

  // Array validation
  if (k.tools !== undefined) {
    const arrayError = ValidationRules.isArray(k.tools, 'tools');
    if (arrayError) errors.push(arrayError);

    // Validate each tool
    if (Array.isArray(k.tools)) {
      k.tools.forEach((tool, index) => {
        const toolValidation = validateTool(tool);
        if (!toolValidation.success && toolValidation.errors) {
          toolValidation.errors.forEach((err) => {
            errors.push({
              ...err,
              field: `tools[${index}].${err.field}`,
            });
          });
        }
      });
    }
  }

  // Date validation
  if (k.createdAt && typeof k.createdAt === 'string') {
    const dateError = ValidationRules.isValidDate(k.createdAt, 'createdAt');
    if (dateError) errors.push(dateError);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: k as Kit };
}

// ============================================================================
// Purchase Plan Item Validation
// ============================================================================

export function validatePurchasePlanItem(item: unknown): ValidationResult<PurchasePlanItem> {
  const errors: ValidationError[] = [];

  if (typeof item !== 'object' || item === null) {
    return {
      success: false,
      errors: [{ field: 'item', message: 'Purchase plan item must be an object', code: 'INVALID_TYPE' }],
    };
  }

  const p = item as Partial<PurchasePlanItem>;

  // Required fields
  const requiredFields = ['id', 'aircraft', 'name', 'partNumber', 'manufacturer', 'stage', 'status'];
  requiredFields.forEach((field) => {
    const error = ValidationRules.required((p as any)[field], field);
    if (error) errors.push(error);
  });

  // String validations
  if (p.name && typeof p.name === 'string') {
    const minLengthError = ValidationRules.minLength(p.name, 2, 'name');
    if (minLengthError) errors.push(minLengthError);
  }

  if (p.partNumber && typeof p.partNumber === 'string') {
    const partNumberError = ValidationRules.isValidPartNumber(p.partNumber, 'partNumber');
    if (partNumberError) errors.push(partNumberError);
  }

  // Quantity and price validations (if provided as numbers)
  if (p.quantity && typeof p.quantity === 'string') {
    const qty = parseFloat(p.quantity);
    if (!isNaN(qty)) {
      const minError = ValidationRules.min(qty, 0, 'quantity');
      if (minError) errors.push(minError);
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: p as PurchasePlanItem };
}

// ============================================================================
// Batch Validation
// ============================================================================

export function validateTools(tools: unknown[]): ValidationResult<Tool[]> {
  const errors: ValidationError[] = [];
  const validTools: Tool[] = [];

  if (!Array.isArray(tools)) {
    return {
      success: false,
      errors: [{ field: 'tools', message: 'Tools must be an array', code: 'INVALID_TYPE' }],
    };
  }

  tools.forEach((tool, index) => {
    const validation = validateTool(tool);
    if (validation.success && validation.data) {
      validTools.push(validation.data);
    } else if (validation.errors) {
      validation.errors.forEach((err) => {
        errors.push({
          ...err,
          field: `tools[${index}].${err.field}`,
        });
      });
    }
  });

  if (errors.length > 0) {
    return { success: false, errors, data: validTools };
  }

  return { success: true, data: validTools };
}

// ============================================================================
// User-friendly Error Formatting
// ============================================================================

export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';

  if (errors.length === 1) {
    return errors[0].message;
  }

  return `Multiple validation errors:\n${errors.map((e) => `• ${e.message}`).join('\n')}`;
}

export function getFirstError(errors: ValidationError[]): string {
  return errors.length > 0 ? errors[0].message : '';
}

// ============================================================================
// Safe Parse (Try to parse and validate)
// ============================================================================

export function safeParseTool(data: unknown): Tool | null {
  const validation = validateTool(data);
  return validation.success && validation.data ? validation.data : null;
}

export function safeParseTools(data: unknown[]): Tool[] {
  if (!Array.isArray(data)) return [];
  return data.map(safeParseTool).filter((tool): tool is Tool => tool !== null);
}

// ============================================================================
// Exports
// ============================================================================

export default {
  validateTool,
  validateAircraftData,
  validateKit,
  validatePurchasePlanItem,
  validateTools,
  formatValidationErrors,
  getFirstError,
  safeParseTool,
  safeParseTools,
};
