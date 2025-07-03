// File: src/components/forms/index.js

import React, { forwardRef } from 'react';
import { useController } from 'react-hook-form';
import { cn, AutoIcon } from '../../lib/design-system';

// ===== FORM FIELD WRAPPER =====
export const FormField = ({ 
  children, 
  label, 
  error, 
  hint, 
  required = false,
  className 
}) => (
  <div className={cn('space-y-2', className)}>
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    {children}
    {error && (
      <p className="text-xs text-red-600 flex items-center">
        <AutoIcon name="error" className="w-3 h-3 mr-1" />
        {error}
      </p>
    )}
    {hint && !error && (
      <p className="text-xs text-gray-500">{hint}</p>
    )}
  </div>
);

// ===== CONTROLLED INPUT =====
export const ControlledInput = ({ 
  name, 
  control, 
  label, 
  hint, 
  required = false,
  icon,
  type = 'text',
  placeholder,
  className,
  ...props 
}) => {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control,
    defaultValue: ''
  });

  return (
    <FormField 
      label={label} 
      error={error?.message} 
      hint={hint} 
      required={required}
      className={className}
    >
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <AutoIcon name={icon} className="w-5 h-5 text-gray-400" />
          </div>
        )}
        
        <input
          {...field}
          type={type}
          placeholder={placeholder}
          className={cn(
            'block w-full rounded-lg border shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:bg-gray-50 disabled:text-gray-500',
            icon ? 'pl-10' : 'pl-3',
            'pr-3 py-2.5',
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          )}
          {...props}
        />
      </div>
    </FormField>
  );
};

// ===== CONTROLLED TEXTAREA =====
export const ControlledTextarea = ({ 
  name, 
  control, 
  label, 
  hint, 
  required = false,
  rows = 4,
  placeholder,
  className,
  ...props 
}) => {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control,
    defaultValue: ''
  });

  return (
    <FormField 
      label={label} 
      error={error?.message} 
      hint={hint} 
      required={required}
      className={className}
    >
      <textarea
        {...field}
        rows={rows}
        placeholder={placeholder}
        className={cn(
          'block w-full rounded-lg border shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:bg-gray-50 disabled:text-gray-500',
          'px-3 py-2.5 resize-none',
          error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
        )}
        {...props}
      />
    </FormField>
  );
};

// ===== CONTROLLED SELECT =====
export const ControlledSelect = ({ 
  name, 
  control, 
  label, 
  hint, 
  required = false,
  options = [],
  placeholder = 'Select an option...',
  className,
  ...props 
}) => {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control,
    defaultValue: ''
  });

  return (
    <FormField 
      label={label} 
      error={error?.message} 
      hint={hint} 
      required={required}
      className={className}
    >
      <div className="relative">
        <select
          {...field}
          className={cn(
            'block w-full rounded-lg border shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:bg-gray-50 disabled:text-gray-500',
            'px-3 py-2.5 pr-10',
            'appearance-none bg-white',
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          )}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <AutoIcon name="ChevronDownIcon" className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </FormField>
  );
};

// ===== CONTROLLED CHECKBOX =====
export const ControlledCheckbox = ({ 
  name, 
  control, 
  label, 
  description,
  className,
  ...props 
}) => {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control,
    defaultValue: false
  });

  return (
    <div className={cn('relative flex items-start', className)}>
      <div className="flex items-center h-5">
        <input
          {...field}
          type="checkbox"
          checked={field.value}
          className={cn(
            'h-4 w-4 rounded border-gray-300 text-blue-600',
            'focus:ring-blue-500 focus:ring-offset-0',
            error && 'border-red-300'
          )}
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <label className="font-medium text-gray-700">
          {label}
        </label>
        {description && (
          <p className="text-gray-500">{description}</p>
        )}
        {error && (
          <p className="text-red-600 flex items-center mt-1">
            <AutoIcon name="error" className="w-3 h-3 mr-1" />
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
};

// ===== RADIO GROUP =====
export const ControlledRadioGroup = ({ 
  name, 
  control, 
  label, 
  options = [],
  required = false,
  className,
  ...props 
}) => {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control,
    defaultValue: ''
  });

  return (
    <FormField 
      label={label} 
      error={error?.message} 
      required={required}
      className={className}
    >
      <div className="space-y-3">
        {options.map(option => (
          <div key={option.value} className="flex items-center">
            <input
              {...field}
              type="radio"
              value={option.value}
              checked={field.value === option.value}
              className={cn(
                'h-4 w-4 border-gray-300 text-blue-600',
                'focus:ring-blue-500 focus:ring-offset-0',
                error && 'border-red-300'
              )}
              {...props}
            />
            <label className="ml-3 text-sm font-medium text-gray-700">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </FormField>
  );
};

// ===== FILE UPLOAD =====
export const ControlledFileUpload = ({ 
  name, 
  control, 
  label, 
  hint,
  required = false,
  accept,
  multiple = false,
  maxSize = 5000000, // 5MB
  className,
  ...props 
}) => {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control,
    defaultValue: null
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        // Handle error - file too large
        return false;
      }
      return true;
    });

    field.onChange(multiple ? validFiles : validFiles[0] || null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <FormField 
      label={label} 
      error={error?.message} 
      hint={hint} 
      required={required}
      className={className}
    >
      <div className={cn(
        'border-2 border-dashed rounded-lg p-6 text-center',
        error ? 'border-red-300' : 'border-gray-300',
        'hover:border-gray-400 transition-colors'
      )}>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          id={`file-upload-${name}`}
          {...props}
        />
        
        <label 
          htmlFor={`file-upload-${name}`}
          className="cursor-pointer"
        >
          <AutoIcon name="upload" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Max size: {formatFileSize(maxSize)}
          </p>
        </label>

        {/* Display selected files */}
        {field.value && (
          <div className="mt-4 space-y-2">
            {(Array.isArray(field.value) ? field.value : [field.value]).map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormField>
  );
};

// ===== DATE PICKER =====
export const ControlledDatePicker = ({ 
  name, 
  control, 
  label, 
  hint, 
  required = false,
  min,
  max,
  className,
  ...props 
}) => {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control,
    defaultValue: ''
  });

  return (
    <FormField 
      label={label} 
      error={error?.message} 
      hint={hint} 
      required={required}
      className={className}
    >
      <div className="relative">
        <input
          {...field}
          type="date"
          min={min}
          max={max}
          className={cn(
            'block w-full rounded-lg border shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:bg-gray-50 disabled:text-gray-500',
            'px-3 py-2.5',
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          )}
          {...props}
        />
      </div>
    </FormField>
  );
};

// ===== FORM VALIDATION SCHEMAS =====
// File: src/lib/validation-schemas.js
import { z } from 'zod';

export const RFQSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().min(1, 'Quantity must be greater than 0'),
  budget: z.number().optional(),
  deadline: z.string().min(1, 'Deadline is required'),
  priority: z.enum(['low', 'medium', 'high']),
  requirements: z.object({
    organic: z.boolean(),
    glutenFree: z.boolean(),
    kosher: z.boolean(),
    halal: z.boolean()
  }),
  deliveryLocation: z.string().min(1, 'Delivery location is required'),
  contactEmail: z.string().email('Invalid email address')
});

export const SupplierSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  certifications: z.array(z.string()),
  specialties: z.array(z.string()),
  website: z.string().url().optional()
});

export const OrderSchema = z.object({
  rfqId: z.string().min(1, 'RFQ ID is required'),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  quantity: z.number().min(1, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  totalAmount: z.number().min(0, 'Total amount must be positive'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  specialInstructions: z.string().optional()
});