import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, SxProps, Theme } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  sx?: SxProps<Theme>;
  interactive?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 300,
  sx,
  interactive = false,
}) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const spacing = 8;

      let top = 0;
      let left = 0;

      switch (placement) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - spacing;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + spacing;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - spacing;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + spacing;
          break;
      }

      // Ensure tooltip stays within viewport
      const padding = 16;
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

      setPosition({ top, left });
    }
  }, [isVisible, placement]);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (!interactive) {
      setIsVisible(false);
    }
  };

  const handleTooltipMouseEnter = () => {
    if (interactive) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  const handleTooltipMouseLeave = () => {
    if (interactive) {
      setIsVisible(false);
    }
  };

  const getArrowStyles = () => {
    const arrowSize = 6;
    const styles: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };

    switch (placement) {
      case 'top':
        return {
          ...styles,
          bottom: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px 0`,
          borderColor: 'white transparent transparent',
        };
      case 'bottom':
        return {
          ...styles,
          top: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `0 ${arrowSize}px ${arrowSize}px`,
          borderColor: 'transparent transparent white',
        };
      case 'left':
        return {
          ...styles,
          right: -arrowSize,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
          borderColor: 'transparent transparent transparent white',
        };
      case 'right':
        return {
          ...styles,
          left: -arrowSize,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
          borderColor: 'transparent white transparent transparent',
        };
    }
  };

  return (
    <>
      <Box
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{ display: 'inline-block' }}
      >
        {children}
      </Box>

      <AnimatePresence>
        {isVisible && (
          <Box
            component={motion.div}
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            sx={{
              position: 'fixed',
              zIndex: 'tooltip',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: theme.shadows[8],
              px: 1.5,
              py: 1,
              fontSize: '0.875rem',
              color: 'text.primary',
              pointerEvents: interactive ? 'auto' : 'none',
              ...sx,
            }}
            style={{ top: position.top, left: position.left }}
          >
            {content}
            <div style={getArrowStyles()} />
          </Box>
        )}
      </AnimatePresence>
    </>
  );
};

// Help Icon with Tooltip
export const HelpTooltip: React.FC<{
  content: string;
  sx?: SxProps<Theme>;
}> = ({ content, sx }) => {
  
  return (
    <Tooltip content={content} placement="top">
      <Box
        component="button"
        type="button"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 16,
          height: 16,
          borderRadius: '50%',
          bgcolor: 'grey.200',
          color: 'text.secondary',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          '&:hover': {
            bgcolor: 'grey.300',
          },
          ...sx,
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          ?
        </Box>
      </Box>
    </Tooltip>
  );
};

// Info Tooltip Component
export const InfoTooltip: React.FC<{
  title?: string;
  content: React.ReactNode;
  learnMoreUrl?: string;
  sx?: SxProps<Theme>;
}> = ({ title, content, learnMoreUrl, sx }) => {
  
  return (
    <Tooltip
      interactive={!!learnMoreUrl}
      content={(
        <Box sx={{ maxWidth: 300 }}>
          {title && (
            <Box sx={{ fontWeight: 600, mb: 0.5 }}>
              {title}
            </Box>
          )}
          <Box sx={{ color: 'text.secondary' }}>
            {content}
          </Box>
          {learnMoreUrl && (
            <Box
              component="a"
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-block',
                mt: 1,
                color: 'primary.main',
                fontSize: '0.75rem',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Learn more →
            </Box>
          )}
        </Box>
      )}
      placement="top"
    >
      <Box
        component="svg"
        sx={{
          width: 16,
          height: 16,
          color: 'text.disabled',
          cursor: 'help',
          '&:hover': {
            color: 'text.secondary',
          },
          ...sx,
        }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </Box>
    </Tooltip>
  );
};