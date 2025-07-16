import { FC } from 'react';
import { Chip, ChipProps } from '@mui/material';

interface ExpertiseBadgeProps extends Omit<ChipProps, 'label'> {
  category: string;
  yearsExperience?: number;
  variant?: 'default' | 'outlined';
}

export const ExpertiseBadge: FC<ExpertiseBadgeProps> = ({
  category,
  yearsExperience,
  variant = 'default',
  ...chipProps
}) => {
  const label = yearsExperience 
    ? `${category} (${yearsExperience}+ yrs)`
    : category;

  return (
    <Chip
      label={label}
      variant={variant}
      size="small"
      sx={{
        borderRadius: '16px',
        fontWeight: 500,
        '&.MuiChip-filled': {
          backgroundColor: 'primary.light',
          color: 'primary.contrastText',
        },
      }}
      {...chipProps}
    />
  );
};