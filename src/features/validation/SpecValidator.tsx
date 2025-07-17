import React from 'react';
import { ProductSpecification } from '../../shared/types';
import { Box, Typography, Stack, Paper, Chip } from '@mui/material';

export interface SpecValidatorProps {
  specifications: ProductSpecification[];
  category: string;
  validationResults?: any;
  onChange?: (specs: ProductSpecification[]) => void;
  className?: string;
}

export const SpecValidator: React.FC<SpecValidatorProps> = ({
  specifications,
  category: _category,
  validationResults: _validationResults,
  onChange: _onChange,
  className
}) => {
  return (
    <Box sx={{ className }}>
      <Typography variant="h6" sx={{ color: 'grey.900', mb: 2 }}>
        Product Specifications
      </Typography>
      
      <Stack spacing={2}>
        {specifications.map((spec, index) => (
          <Paper key={index} sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'grey.300' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'grey.900', fontWeight: 'medium' }}>
                  {spec.name}:
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.700' }}>
                  {spec.value}
                </Typography>
                {spec.tolerance && (
                  <Typography variant="body2" sx={{ color: 'grey.500', ml: 1 }}>
                    ±{spec.tolerance}
                  </Typography>
                )}
              </Box>
              {spec.critical && (
                <Chip
                  label="Critical"
                  color="error"
                  size="small"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Box>
          </Paper>
        ))}
      </Stack>
      
      {specifications.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" sx={{ color: 'grey.500' }}>
            No specifications defined
          </Typography>
        </Box>
      )}
    </Box>
  );
};