import { forwardRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', shadow = 'md', children, ...props }, ref) => {
    const variantStyles = {
      default: {
        bgcolor: 'white',
        border: 1,
        borderColor: 'grey.200'
      },
      glass: {
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(4px)',
        border: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)'
      },
      gradient: {
        background: 'linear-gradient(to bottom right, #eff6ff, #ffedd5)',
        border: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)'
      },
      outlined: {
        bgcolor: 'white',
        border: 2,
        borderColor: 'grey.200'
      },
    };

    const paddingMap = {
      none: 0,
      sm: 1.5,
      md: 2,
      lg: 3,
      xl: 4,
    };

    const shadowMap = {
      none: 0,
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4,
    };

    return (
      <Paper
        ref={ref}
        elevation={shadowMap[shadow]}
        sx={{
          borderRadius: 3,
          p: paddingMap[padding],
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: 6
          },
          ...variantStyles[variant]
        }}
        {...props}
      >
        {children}
      </Paper>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components
const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        pb: 2
      }}
      {...props}
    >
      {children}
    </Box>
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ children, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="h6"
      component="h3"
      sx={{
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '-0.025em',
        color: 'text.primary'
      }}
      {...props}
    >
      {children}
    </Typography>
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ children, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="body2"
      sx={{
        fontSize: '0.875rem',
        color: 'text.secondary'
      }}
      {...props}
    >
      {children}
    </Typography>
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <Box ref={ref} sx={{ pt: 0 }} {...props}>
      {children}
    </Box>
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        alignItems: 'center',
        pt: 2
      }}
      {...props}
    >
      {children}
    </Box>
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };