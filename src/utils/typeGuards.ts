/**
 * Type Guards for Runtime Type Checking
 * 
 * This file contains utility functions for runtime type checking to ensure
 * data integrity and type safety throughout the application.
 */

/**
 * Checks if a value is a non-null object
 * @param value - The value to check
 * @returns True if the value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Checks if a value is a string
 * @param value - The value to check
 * @returns True if the value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Checks if a value is a number
 * @param value - The value to check
 * @returns True if the value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Checks if a value is a boolean
 * @param value - The value to check
 * @returns True if the value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Checks if a value is an array
 * @param value - The value to check
 * @returns True if the value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Checks if a value is a non-empty string
 * @param value - The value to check
 * @returns True if the value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

/**
 * Checks if a value is a positive number
 * @param value - The value to check
 * @returns True if the value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

/**
 * Checks if a value is a valid email address
 * @param value - The value to check
 * @returns True if the value is a valid email address
 */
export function isValidEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Checks if a value is a valid URL
 * @param value - The value to check
 * @returns True if the value is a valid URL
 */
export function isValidUrl(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a value is a valid date string
 * @param value - The value to check
 * @returns True if the value is a valid date string
 */
export function isValidDateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Checks if a value is a valid UUID
 * @param value - The value to check
 * @returns True if the value is a valid UUID
 */
export function isValidUUID(value: unknown): value is string {
  if (!isString(value)) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Checks if an object has a specific property
 * @param obj - The object to check
 * @param prop - The property name to check for
 * @returns True if the object has the property
 */
export function hasProperty<T extends Record<string, unknown>>(
  obj: T,
  prop: string
): obj is T & Record<typeof prop, unknown> {
  return prop in obj;
}

/**
 * Checks if an object has a specific property with a given type
 * @param obj - The object to check
 * @param prop - The property name to check for
 * @param typeGuard - The type guard function to check the property value
 * @returns True if the object has the property with the specified type
 */
export function hasPropertyOfType<T extends Record<string, unknown>, P>(
  obj: T,
  prop: string,
  typeGuard: (value: unknown) => value is P
): obj is T & Record<typeof prop, P> {
  return hasProperty(obj, prop) && typeGuard(obj[prop]);
}

/**
 * Checks if an object has all required properties
 * @param obj - The object to check
 * @param props - Array of required property names
 * @returns True if the object has all required properties
 */
export function hasRequiredProperties<T extends Record<string, unknown>>(
  obj: T,
  props: string[]
): obj is T & Record<typeof props[number], unknown> {
  return props.every(prop => hasProperty(obj, prop));
}

/**
 * Validates that an object conforms to a specific shape
 * @param obj - The object to validate
 * @param shape - Object describing the expected shape with type guards
 * @returns True if the object matches the expected shape
 */
export function validateObjectShape<T extends Record<string, unknown>>(
  obj: unknown,
  shape: Record<string, (value: unknown) => boolean>
): obj is T {
  if (!isObject(obj)) return false;
  
  return Object.entries(shape).every(([key, validator]) => {
    const value = obj[key];
    return validator(value);
  });
}

/**
 * Validates an array of objects against a shape
 * @param arr - The array to validate
 * @param shape - Object describing the expected shape with type guards
 * @returns True if all objects in the array match the expected shape
 */
export function validateArrayShape<T extends Record<string, unknown>>(
  arr: unknown,
  shape: Record<string, (value: unknown) => boolean>
): arr is T[] {
  if (!isArray(arr)) return false;
  
  return arr.every(item => validateObjectShape<T>(item, shape));
}

/**
 * Safely parses JSON with type validation
 * @param json - The JSON string to parse
 * @param validator - Optional validator function
 * @returns Parsed object or null if parsing fails or validation fails
 */
export function safeJsonParse<T>(
  json: string,
  validator?: (value: unknown) => value is T
): T | null {
  try {
    const parsed = JSON.parse(json);
    if (validator && !validator(parsed)) {
      return null;
    }
    return parsed as T;
  } catch {
    return null;
  }
}

/**
 * Creates a type guard for union types
 * @param validators - Array of type guard functions
 * @returns A type guard function that checks if a value matches any of the provided types
 */
export function createUnionTypeGuard<T extends readonly unknown[]>(
  ...validators: { [K in keyof T]: (value: unknown) => value is T[K] }
): (value: unknown) => value is T[number] {
  return (value: unknown): value is T[number] => {
    return validators.some(validator => validator(value));
  };
}

/**
 * Creates a type guard for optional properties
 * @param validator - The type guard function for the non-undefined value
 * @returns A type guard function that accepts undefined or the validated type
 */
export function createOptionalTypeGuard<T>(
  validator: (value: unknown) => value is T
): (value: unknown) => value is T | undefined {
  return (value: unknown): value is T | undefined => {
    return value === undefined || validator(value);
  };
}

/**
 * Creates a type guard for nullable properties
 * @param validator - The type guard function for the non-null value
 * @returns A type guard function that accepts null or the validated type
 */
export function createNullableTypeGuard<T>(
  validator: (value: unknown) => value is T
): (value: unknown) => value is T | null {
  return (value: unknown): value is T | null => {
    return value === null || validator(value);
  };
}

/**
 * Type guard for API responses
 * @param value - The value to check
 * @returns True if the value is a valid API response structure
 */
export function isApiResponse(value: unknown): value is {
  data: unknown;
  success: boolean;
  message?: string;
} {
  return validateObjectShape(value, {
    data: () => true, // data can be any type
    success: isBoolean,
    message: createOptionalTypeGuard(isString)
  });
}

/**
 * Type guard for paginated API responses
 * @param value - The value to check
 * @returns True if the value is a valid paginated API response structure
 */
export function isPaginatedApiResponse(value: unknown): value is {
  data: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  success: boolean;
  message?: string;
} {
  return validateObjectShape(value, {
    data: isArray,
    pagination: (val) => validateObjectShape(val, {
      page: isNumber,
      limit: isNumber,
      total: isNumber,
      totalPages: isNumber,
      hasMore: isBoolean
    }),
    success: isBoolean,
    message: createOptionalTypeGuard(isString)
  });
}

/**
 * Type guard for user objects
 * @param value - The value to check
 * @returns True if the value is a valid user object
 */
export function isUser(value: unknown): value is {
  id: string;
  email: string;
  name: string;
  role: string;
} {
  return validateObjectShape(value, {
    id: isNonEmptyString,
    email: isValidEmail,
    name: isNonEmptyString,
    role: isNonEmptyString
  });
}

/**
 * Type guard for error objects
 * @param value - The value to check
 * @returns True if the value is a valid error object
 */
export function isErrorObject(value: unknown): value is {
  message: string;
  code?: string;
  status?: number;
} {
  return validateObjectShape(value, {
    message: isNonEmptyString,
    code: createOptionalTypeGuard(isString),
    status: createOptionalTypeGuard(isNumber)
  });
}

/**
 * Runtime assertion function that throws an error if the condition is not met
 * @param condition - The condition to check
 * @param message - The error message to throw if the condition is false
 */
export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Runtime assertion function with type guard
 * @param value - The value to check
 * @param guard - The type guard function
 * @param message - The error message to throw if the guard fails
 */
export function assertType<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  message: string
): asserts value is T {
  if (!guard(value)) {
    throw new Error(`Type assertion failed: ${message}`);
  }
}

/**
 * Safely casts a value to a specific type with runtime validation
 * @param value - The value to cast
 * @param guard - The type guard function
 * @param fallback - The fallback value if validation fails
 * @returns The casted value or fallback
 */
export function safeCast<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  fallback: T
): T {
  return guard(value) ? value : fallback;
}

/**
 * Filters an array to only include items that pass a type guard
 * @param arr - The array to filter
 * @param guard - The type guard function
 * @returns A new array containing only items that pass the type guard
 */
export function filterByType<T>(
  arr: unknown[],
  guard: (value: unknown) => value is T
): T[] {
  return arr.filter(guard);
}

/**
 * Validates and sanitizes user input
 * @param input - The input to validate
 * @param maxLength - Maximum allowed length
 * @param allowedChars - Regex pattern for allowed characters
 * @returns Sanitized input or null if validation fails
 */
export function validateAndSanitizeInput(
  input: unknown,
  maxLength: number = 1000,
  allowedChars: RegExp = /^[a-zA-Z0-9\s\-_.,!?()]*$/
): string | null {
  if (!isString(input)) return null;
  
  const trimmed = input.trim();
  
  if (trimmed.length === 0 || trimmed.length > maxLength) {
    return null;
  }
  
  if (!allowedChars.test(trimmed)) {
    return null;
  }
  
  return trimmed;
}