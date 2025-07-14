import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { rfqService } from '../../services/rfqService';
import { validationService } from '../../services/validationService';
import { SpecValidator } from '../validation/SpecValidator';
import { CreateRFQData } from '../../shared/types';

const rfqSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  deliveryLocation: z.string().min(1, 'Delivery location is required'),
  specifications: z.array(z.object({
    name: z.string().min(1, 'Specification name is required'),
    value: z.string().min(1, 'Specification value is required'),
    tolerance: z.string().optional(),
    critical: z.boolean().optional().default(false),
  })).min(1, 'At least one specification is required'),
  certifications: z.array(z.string()).optional(),
  additionalRequirements: z.string().optional(),
  budgetRange: z.object({
    min: z.number().min(0, 'Minimum budget must be positive'),
    max: z.number().min(0, 'Maximum budget must be positive'),
  }).optional(),
  submissionDeadline: z.string().min(1, 'Submission deadline is required'),
  evaluationCriteria: z.array(z.object({
    criterion: z.string().min(1, 'Criterion is required'),
    weight: z.number().min(1).max(100, 'Weight must be between 1-100'),
  })).min(1, 'At least one evaluation criterion is required'),
});

type RFQFormData = z.infer<typeof rfqSchema>;

const steps = [
  { id: 1, title: 'Basic Information', description: 'Title, description, and category' },
  { id: 2, title: 'Product Specifications', description: 'Detailed product requirements' },
  { id: 3, title: 'Requirements & Logistics', description: 'Quantity, delivery, and certifications' },
  { id: 4, title: 'Evaluation & Budget', description: 'Criteria and budget range' },
  { id: 5, title: 'Review & Publish', description: 'Final review and publishing' },
];

const categories = [
  'Fruits & Vegetables',
  'Grains & Cereals',
  'Dairy Products',
  'Meat & Poultry',
  'Seafood',
  'Processed Foods',
  'Beverages',
  'Spices & Seasonings',
  'Oils & Fats',
  'Bakery Products',
];

const units = ['kg', 'lbs', 'tons', 'pieces', 'boxes', 'pallets', 'containers'];

const commonCertifications = [
  'Organic',
  'Fair Trade',
  'HACCP',
  'ISO 22000',
  'BRC',
  'SQF',
  'IFS',
  'Halal',
  'Kosher',
  'Non-GMO',
  'Gluten-Free',
  'Vegan',
];

export const CreateRFQ: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specValidationResults, setSpecValidationResults] = useState<any>(null);
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    trigger,
  } = useForm({
    resolver: zodResolver(rfqSchema),
    mode: 'onChange',
    defaultValues: {
      specifications: [{ name: '', value: '', tolerance: '', critical: false }],
      certifications: [],
      evaluationCriteria: [{ criterion: 'Price', weight: 40 }],
    },
  });

  const watchedSpecs = watch('specifications');
  const watchedCategory = watch('category');

  useEffect(() => {
    if (watchedSpecs && watchedCategory) {
      validateSpecifications();
    }
  }, [watchedSpecs, watchedCategory]);

  const validateSpecifications = async () => {
    try {
      const specs = getValues('specifications');
      const category = getValues('category');
      
      if (specs.length > 0 && category) {
        const result = await validationService.validateProductSpecs({
          category,
          specifications: specs,
        });
        setSpecValidationResults(result);
        setValidationErrors(result.errors || []);
      }
    } catch (error) {
      console.error('Spec validation error:', error);
    }
  };

  const nextStep = async () => {
    const isStepValid = await trigger();
    if (isStepValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: RFQFormData) => {
    setIsSubmitting(true);
    try {
      // Final validation check
      if (validationErrors.length > 0) {
        throw new Error('Please fix validation errors before submitting');
      }

      const rfqData: CreateRFQData = {
        ...data,
      };

      const result = await rfqService.createRFQ(rfqData);
      navigate(`/rfq/${result.id}`);
    } catch (error) {
      console.error('RFQ creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSpecification = () => {
    const current = getValues('specifications');
    setValue('specifications', [...current, { name: '', value: '', tolerance: '', critical: false }]);
  };

  const removeSpecification = (index: number) => {
    const current = getValues('specifications');
    setValue('specifications', current.filter((_, i) => i !== index));
  };

  const addEvaluationCriterion = () => {
    const current = getValues('evaluationCriteria');
    setValue('evaluationCriteria', [...current, { criterion: '', weight: 10 }]);
  };

  const removeEvaluationCriterion = (index: number) => {
    const current = getValues('evaluationCriteria');
    setValue('evaluationCriteria', current.filter((_, i) => i !== index));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RFQ Title *
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Premium Organic Apples for Retail Chain"
                  />
                )}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Detailed description of your requirements..."
                  />
                )}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Product Specifications</h3>
              <button
                type="button"
                onClick={addSpecification}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Specification
              </button>
            </div>

            <div className="space-y-4">
              {watchedSpecs.map((_, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      Specification {index + 1}
                    </h4>
                    {watchedSpecs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <Controller
                        name={`specifications.${index}.name`}
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="e.g., Color, Size, Weight"
                          />
                        )}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Value *
                      </label>
                      <Controller
                        name={`specifications.${index}.value`}
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="e.g., Red, 5cm, 150g"
                          />
                        )}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tolerance
                      </label>
                      <Controller
                        name={`specifications.${index}.tolerance`}
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="e.g., ±5%, ±1cm"
                          />
                        )}
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <Controller
                        name={`specifications.${index}.critical`}
                        control={control}
                        render={({ field }) => (
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Critical</span>
                          </label>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Validation Results */}
            {specValidationResults && (
              <SpecValidator
                specifications={watchedSpecs}
                category={watchedCategory}
                validationResults={specValidationResults}
              />
            )}

            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                  <h4 className="text-sm font-medium text-red-800">Validation Errors</h4>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min="1"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  )}
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select unit</option>
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  )}
                />
                {errors.unit && (
                  <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Date *
                </label>
                <Controller
                  name="deliveryDate"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  )}
                />
                {errors.deliveryDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.deliveryDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Deadline *
                </label>
                <Controller
                  name="submissionDeadline"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="datetime-local"
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  )}
                />
                {errors.submissionDeadline && (
                  <p className="mt-1 text-sm text-red-600">{errors.submissionDeadline.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Location *
              </label>
              <Controller
                name="deliveryLocation"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Full delivery address"
                  />
                )}
              />
              {errors.deliveryLocation && (
                <p className="mt-1 text-sm text-red-600">{errors.deliveryLocation.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Certifications
              </label>
              <Controller
                name="certifications"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    {commonCertifications.map(cert => (
                      <label key={cert} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={field.value?.includes(cert) || false}
                          onChange={(e) => {
                            const current = field.value || [];
                            if (e.target.checked) {
                              field.onChange([...current, cert]);
                            } else {
                              field.onChange(current.filter(c => c !== cert));
                            }
                          }}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{cert}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Requirements
              </label>
              <Controller
                name="additionalRequirements"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Any additional requirements or special instructions..."
                  />
                )}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Range (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Budget
                  </label>
                  <Controller
                    name="budgetRange.min"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Budget
                  </label>
                  <Controller
                    name="budgetRange.max"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Evaluation Criteria</h3>
                <button
                  type="button"
                  onClick={addEvaluationCriterion}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Criterion
                </button>
              </div>

              <div className="space-y-4">
                {watch('evaluationCriteria')?.map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Controller
                        name={`evaluationCriteria.${index}.criterion`}
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="e.g., Price, Quality, Delivery Time"
                          />
                        )}
                      />
                    </div>
                    <div className="w-32">
                      <Controller
                        name={`evaluationCriteria.${index}.weight`}
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center">
                            <input
                              {...field}
                              type="number"
                              min="1"
                              max="100"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            <span className="ml-2 text-sm text-gray-500">%</span>
                          </div>
                        )}
                      />
                    </div>
                    {watch('evaluationCriteria')?.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEvaluationCriterion(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  <p className="text-sm text-yellow-700">
                    Total weight: {watch('evaluationCriteria')?.reduce((sum, c) => sum + (c.weight || 0), 0) || 0}%
                    {watch('evaluationCriteria')?.reduce((sum, c) => sum + (c.weight || 0), 0) !== 100 && (
                      <span className="ml-2 text-yellow-600">(Should equal 100%)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-lg font-medium text-green-800">Ready to Publish</h3>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Review all information below and click "Publish RFQ" to make it available to suppliers.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">RFQ Summary</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-700">Basic Information</h5>
                  <p className="text-sm text-gray-600">
                    <strong>Title:</strong> {watch('title')}<br />
                    <strong>Category:</strong> {watch('category')}<br />
                    <strong>Description:</strong> {watch('description')}
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700">Quantity & Delivery</h5>
                  <p className="text-sm text-gray-600">
                    <strong>Quantity:</strong> {watch('quantity')} {watch('unit')}<br />
                    <strong>Delivery Date:</strong> {watch('deliveryDate')}<br />
                    <strong>Delivery Location:</strong> {watch('deliveryLocation')}
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700">Specifications</h5>
                  <div className="text-sm text-gray-600">
                    {watch('specifications')?.map((spec, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span><strong>{spec.name}:</strong> {spec.value}</span>
                        {spec.tolerance && <span>(±{spec.tolerance})</span>}
                        {spec.critical && <span className="text-red-600">(Critical)</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {(watch('certifications') || []).length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700">Required Certifications</h5>
                    <p className="text-sm text-gray-600">
                      {(watch('certifications') || []).join(', ')}
                    </p>
                  </div>
                )}

                <div>
                  <h5 className="font-medium text-gray-700">Evaluation Criteria</h5>
                  <div className="text-sm text-gray-600">
                    {watch('evaluationCriteria')?.map((criterion, index) => (
                      <div key={index}>
                        {criterion.criterion}: {criterion.weight}%
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                  <h4 className="text-sm font-medium text-red-800">Please fix these issues:</h4>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New RFQ</h1>
        <p className="text-gray-600">
          Create a comprehensive request for quotation with detailed specifications
        </p>
      </div>

      {/* <ProgressTracker steps={steps} currentStep={currentStep} /> */}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Previous
          </button>

          <div className="flex space-x-3">
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || validationErrors.length > 0}
                className="inline-flex items-center px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Publishing...' : 'Publish RFQ'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};