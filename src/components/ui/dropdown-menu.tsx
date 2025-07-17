import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem, Typography, Divider, MenuProps } from '@mui/material';

interface DropdownMenuProps {
  children: React.ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === DropdownMenuTrigger) {
            return React.cloneElement(child as React.ReactElement<{ onClick?: (event: React.MouseEvent<HTMLElement>) => void }>, {
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                setAnchorEl(event.currentTarget);
              },
            });
          }
          if (child.type === DropdownMenuContent) {
            return React.cloneElement(child as React.ReactElement<{ anchorEl?: null | HTMLElement; open?: boolean; onClose?: () => void }>, {
              anchorEl,
              open: isOpen,
              onClose: handleClose,
            });
          }
        }
        return child;
      })}
    </>
  );
};

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  asChild = false,
  onClick,
}) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        onClick?.(e);
        (children.props as any).onClick?.(e);
      },
    });
  }

  return (
    <Button 
      onClick={onClick}
      sx={{ 
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 'auto',
        p: 1
      }}
    >
      {children}
    </Button>
  );
};

interface DropdownMenuContentProps extends Partial<MenuProps> {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
  anchorEl?: null | HTMLElement;
  open?: boolean;
  onClose?: () => void;
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  align = 'start',
  anchorEl,
  open = false,
  onClose,
  ...menuProps
}) => {
  const transformOrigin = {
    start: { vertical: 'top', horizontal: 'left' },
    center: { vertical: 'top', horizontal: 'center' },
    end: { vertical: 'top', horizontal: 'right' },
  };

  const anchorOrigin = {
    start: { vertical: 'bottom', horizontal: 'left' },
    center: { vertical: 'bottom', horizontal: 'center' },
    end: { vertical: 'bottom', horizontal: 'right' },
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      transformOrigin={transformOrigin[align] as { vertical: 'top'; horizontal: 'left' | 'center' | 'right' }}
      anchorOrigin={anchorOrigin[align] as { vertical: 'bottom'; horizontal: 'left' | 'center' | 'right' }}
      sx={{
        '& .MuiPaper-root': {
          minWidth: 128,
          mt: 0.5,
          borderRadius: 2,
          boxShadow: 2,
        }
      }}
      {...menuProps}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === DropdownMenuItem) {
          return React.cloneElement(child as React.ReactElement<{ onClick?: () => void; onSelect?: () => void }>, {
            onClick: () => {
              (child.props as any).onClick?.();
              (child.props as any).onSelect?.();
              onClose?.();
            },
          });
        }
        return child;
      })}
    </Menu>
  );
};

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  onSelect?: () => void;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  disabled = false,
  onClick,
}) => {
  return (
    <MenuItem
      disabled={disabled}
      onClick={onClick}
      sx={{
        fontSize: '0.875rem',
        px: 2,
        py: 1,
        borderRadius: 1,
        mx: 0.5,
        '&:hover': {
          bgcolor: 'action.hover',
        },
        '&.Mui-disabled': {
          opacity: 0.5,
        }
      }}
    >
      {children}
    </MenuItem>
  );
};

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({
  children,
}) => {
  return (
    <Box sx={{ px: 2, py: 1.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
        {children}
      </Typography>
    </Box>
  );
};

export const DropdownMenuSeparator: React.FC<{ className?: string }> = () => {
  return <Divider sx={{ my: 0.5, mx: -1 }} />;
};