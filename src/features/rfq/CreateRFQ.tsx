import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Add as PlusIcon,  } from '@mui/icons-material';
import { Container, Typography, Button, Card, CardContent, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Box, Stack, Alert, Checkbox, FormControlLabel, FormGroup, Stepper, Step, StepLabel, IconButton, Chip } from '@mui/material';
import { rfqService } from '../../services/rfqService';
import { validationService } from '../../services/validationService';
import { SpecValidator } from '../validation/SpecValidator';
import { CreateRFQData } from '../../shared/types';
import { ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';

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
          <Stack spacing={3}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="RFQ Title *"
                  placeholder="e.g., Premium Organic Apples for Retail Chain"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  variant="outlined"
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description *"
                  placeholder="Detailed description of your requirements..."
                  multiline
                  rows={4}
                  fullWidth
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  variant="outlined"
                />
              )}
            />

            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.category}>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    {...field}
                    label="Category *"
                  >
                    <MenuItem value="">Select a category</MenuItem>
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      {errors.category.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: 'grey.900' }}>
                Product Specifications
              </Typography>
              <Button
                onClick={addSpecification}
                variant="outlined"
                startIcon={<PlusIcon />}
                size="small"
              >
                Add Specification
              </Button>
            </Box>

            <Stack spacing={2}>
              {watchedSpecs.map((_, index) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ color: 'grey.900' }}>
                        Specification {index + 1}
                      </Typography>
                      {watchedSpecs.length > 1 && (
                        <IconButton
                          onClick={() => removeSpecification(index)}
                          color="error"
                          size="small"
                        >
                          <TrashIcon />
                        </IconButton>
                      )}
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name={`specifications.${index}.name`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Name *"
                              placeholder="e.g., Color, Size, Weight"
                              fullWidth
                              variant="outlined"
                              size="small"
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Controller
                          name={`specifications.${index}.value`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Value *"
                              placeholder="e.g., Red, 5cm, 150g"
                              fullWidth
                              variant="outlined"
                              size="small"
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Controller
                          name={`specifications.${index}.tolerance`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Tolerance"
                              placeholder="e.g., ±5%, ±1cm"
                              fullWidth
                              variant="outlined"
                              size="small"
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Controller
                          name={`specifications.${index}.critical`}
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={field.value}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  inputRef={field.ref}
                                />
                              }
                              label="Critical"
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            {/* Validation Results */}
            {specValidationResults && (
              <SpecValidator
                specifications={watchedSpecs}
                category={watchedCategory}
                validationResults={specValidationResults}
              />
            )}

            {validationErrors.length > 0 && (
              <Alert severity="error" icon={<ExclamationTriangleIcon />}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Validation Errors
                </Typography>
                <Stack spacing={0.5}>
                  {validationErrors.map((error, index) => (
                    <Typography key={index} variant="caption">
                      • {error}
                    </Typography>
                  ))}
                </Stack>
              </Alert>
            )}
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Quantity *"
                      type="number"
                      InputProps={{ inputProps: { min: 1 } }}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      fullWidth
                      error={!!errors.quantity}
                      helperText={errors.quantity?.message}
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.unit}>
                      <InputLabel>Unit *</InputLabel>
                      <Select
                        {...field}
                        label="Unit *"
                      >
                        <MenuItem value="">Select unit</MenuItem>
                        {units.map(unit => (
                          <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                        ))}
                      </Select>
                      {errors.unit && (
                        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                          {errors.unit.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="deliveryDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Delivery Date *"
                      type="date"
                      InputProps={{ inputProps: { min: new Date().toISOString().split('T')[0] } }}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      error={!!errors.deliveryDate}
                      helperText={errors.deliveryDate?.message}
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="submissionDeadline"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Submission Deadline *"
                      type="datetime-local"
                      InputProps={{ inputProps: { min: new Date().toISOString().slice(0, 16) } }}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      error={!!errors.submissionDeadline}
                      helperText={errors.submissionDeadline?.message}
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Controller
              name="deliveryLocation"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Delivery Location *"
                  placeholder="Full delivery address"
                  fullWidth
                  error={!!errors.deliveryLocation}
                  helperText={errors.deliveryLocation?.message}
                  variant="outlined"
                />
              )}
            />

            <Box>
              <Typography variant="subtitle1" sx={{ color: 'grey.700', mb: 2 }}>
                Required Certifications
              </Typography>
              <Controller
                name="certifications"
                control={control}
                render={({ field }) => (
                  <FormGroup>
                    <Grid container spacing={1}>
                      {commonCertifications.map(cert => (
                        <Grid item xs={12} sm={6} md={4} key={cert}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.value?.includes(cert) || false}
                                onChange={(e) => {
                                  const current = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...current, cert]);
                                  } else {
                                    field.onChange(current.filter(c => c !== cert));
                                  }
                                }}
                              />
                            }
                            label={cert}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </FormGroup>
                )}
              />
            </Box>

            <Controller
              name="additionalRequirements"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Additional Requirements"
                  placeholder="Any additional requirements or special instructions..."
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                />
              )}
            />
          </Stack>
        );

      case 4:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ color: 'grey.900', mb: 2 }}>
                Budget Range (Optional)
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="budgetRange.min"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Minimum Budget"
                        type="number"
                        InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        placeholder="0.00"
                        fullWidth
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="budgetRange.max"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Maximum Budget"
                        type="number"
                        InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        placeholder="0.00"
                        fullWidth
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'grey.900' }}>
                  Evaluation Criteria
                </Typography>
                <Button
                  onClick={addEvaluationCriterion}
                  variant="outlined"
                  startIcon={<PlusIcon />}
                  size="small"
                >
                  Add Criterion
                </Button>
              </Box>

              <Stack spacing={2}>
                {watch('evaluationCriteria')?.map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Controller
                      name={`evaluationCriteria.${index}.criterion`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          placeholder="e.g., Price, Quality, Delivery Time"
                          variant="outlined"
                          size="small"
                          sx={{ flex: 1 }}
                        />
                      )}
                    />
                    <Controller
                      name={`evaluationCriteria.${index}.weight`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          InputProps={{ 
                            inputProps: { min: 1, max: 100 },
                            endAdornment: <Typography variant="caption">%</Typography>
                          }}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          variant="outlined"
                          size="small"
                          sx={{ width: 120 }}
                        />
                      )}
                    />
                    {watch('evaluationCriteria')?.length > 1 && (
                      <IconButton
                        onClick={() => removeEvaluationCriterion(index)}
                        color="error"
                        size="small"
                      >
                        <TrashIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Stack>

              <Alert 
                severity={watch('evaluationCriteria')?.reduce((sum, c) => sum + (c.weight || 0), 0) === 100 ? "success" : "warning"}
                icon={<ExclamationTriangleIcon />}
                sx={{ mt: 2 }}
              >
                <Typography variant="body2">
                  Total weight: {watch('evaluationCriteria')?.reduce((sum, c) => sum + (c.weight || 0), 0) || 0}%
                  {watch('evaluationCriteria')?.reduce((sum, c) => sum + (c.weight || 0), 0) !== 100 && (
                    <Typography component="span" color="warning.main" sx={{ ml: 1 }}>
                      (Should equal 100%)
                    </Typography>
                  )}
                </Typography>
              </Alert>
            </Box>
          </Stack>
        );

      case 5:
        return (
          <Stack spacing={3}>
            <Alert severity="success" icon={<CheckCircleIcon />}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Ready to Publish
              </Typography>
              <Typography variant="body2">
                Review all information below and click "Publish RFQ" to make it available to suppliers.
              </Typography>
            </Alert>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'grey.900', mb: 3 }}>
                  RFQ Summary
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: 'grey.700', mb: 1 }}>
                      Basic Information
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600' }}>
                      <strong>Title:</strong> {watch('title')}<br />
                      <strong>Category:</strong> {watch('category')}<br />
                      <strong>Description:</strong> {watch('description')}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" sx={{ color: 'grey.700', mb: 1 }}>
                      Quantity & Delivery
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600' }}>
                      <strong>Quantity:</strong> {watch('quantity')} {watch('unit')}<br />
                      <strong>Delivery Date:</strong> {watch('deliveryDate')}<br />
                      <strong>Delivery Location:</strong> {watch('deliveryLocation')}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" sx={{ color: 'grey.700', mb: 1 }}>
                      Specifications
                    </Typography>
                    <Stack spacing={1}>
                      {watch('specifications')?.map((spec, index) => (
                        <Typography key={index} variant="body2" sx={{ color: 'grey.600' }}>
                          <strong>{spec.name}:</strong> {spec.value}
                          {spec.tolerance && <span> (±{spec.tolerance})</span>}
                          {spec.critical && <Chip label="Critical" color="error" size="small" sx={{ ml: 1 }} />}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>

                  {(watch('certifications') || []).length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: 'grey.700', mb: 1 }}>
                        Required Certifications
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'grey.600' }}>
                        {(watch('certifications') || []).join(', ')}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="subtitle1" sx={{ color: 'grey.700', mb: 1 }}>
                      Evaluation Criteria
                    </Typography>
                    <Stack spacing={1}>
                      {watch('evaluationCriteria')?.map((criterion, index) => (
                        <Typography key={index} variant="body2" sx={{ color: 'grey.600' }}>
                          {criterion.criterion}: {criterion.weight}%
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {validationErrors.length > 0 && (
              <Alert severity="error" icon={<ExclamationTriangleIcon />}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Please fix these issues:
                </Typography>
                <Stack spacing={0.5}>
                  {validationErrors.map((error, index) => (
                    <Typography key={index} variant="caption">
                      • {error}
                    </Typography>
                  ))}
                </Stack>
              </Alert>
            )}
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: 'grey.900', fontWeight: 'bold', mb: 1 }}>
          Create New RFQ
        </Typography>
        <Typography variant="body1" sx={{ color: 'grey.600' }}>
          Create a comprehensive request for quotation with detailed specifications
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Stepper activeStep={currentStep - 1} alternativeLabel>
          {steps.map((step) => (
            <Step key={step.id}>
              <StepLabel>
                <Typography variant="caption">{step.title}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
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
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outlined"
            startIcon={<ChevronLeftIcon />}
          >
            Previous
          </Button>

          <Box>
            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                variant="contained"
                endIcon={<ChevronRightIcon />}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || validationErrors.length > 0}
                variant="contained"
                color="success"
                size="large"
              >
                {isSubmitting ? 'Publishing...' : 'Publish RFQ'}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};