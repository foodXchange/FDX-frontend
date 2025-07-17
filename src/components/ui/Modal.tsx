import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUIStore } from '@/store/useUIStore';
import { Box, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ModalProps {
  id: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  id,
  children,
  size = 'md',
  closeOnEscape = true,
  closeOnBackdrop = true,
  showCloseButton = true,
}) => {
  const closeModal = useUIStore((state) => state.closeModal);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus trap
    const modalElement = modalRef.current;
    if (!modalElement) return;

    const focusableElements = modalElement.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstFocusableElement = focusableElements[0] as HTMLElement;
    const lastFocusableElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    firstFocusableElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        closeModal(id);
        return;
      }

      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement?.focus();
          e.preventDefault();
        }
      }
    };

    modalElement.addEventListener('keydown', handleKeyDown);
    return () => modalElement.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEscape, id, closeModal]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      closeModal(id);
    }
  };

  const sizeStyles = {
    sm: { maxWidth: '24rem' },
    md: { maxWidth: '28rem' },
    lg: { maxWidth: '32rem' },
    xl: { maxWidth: '36rem' },
    full: { maxWidth: '100%', mx: 2 },
  };

  return createPortal(
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        overflowY: 'auto'
      }}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: { xs: 'flex-end', sm: 'center' }, 
        justifyContent: 'center', 
        minHeight: '100vh', 
        p: { xs: 2, sm: 0 },
        pb: { xs: 10, sm: 0 },
        textAlign: 'center'
      }}>
        {/* Background overlay */}
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0, 0, 0, 0.75)',
            transition: 'opacity 0.15s'
          }}
          aria-hidden="true"
          onClick={handleBackdropClick}
        />

        {/* This element is to trick the browser into centering the modal contents. */}
        <Box
          component="span"
          sx={{
            display: { xs: 'none', sm: 'inline-block' },
            verticalAlign: 'middle',
            height: '100vh'
          }}
          aria-hidden="true"
        >
          &#8203;
        </Box>

        {/* Modal panel */}
        <Box
          ref={modalRef}
          sx={{
            display: 'inline-block',
            verticalAlign: { xs: 'bottom', sm: 'middle' },
            bgcolor: 'white',
            borderRadius: 2,
            textAlign: 'left',
            overflow: 'hidden',
            boxShadow: 24,
            transform: 'translateZ(0)',
            transition: 'all 0.15s',
            my: { sm: 4 },
            width: '100%',
            position: 'relative',
            ...sizeStyles[size]
          }}
        >
          {showCloseButton && (
            <IconButton
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: 'grey.500',
                '&:hover': { color: 'grey.600' },
                '&:focus': {
                  outline: 'none',
                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
                }
              }}
              onClick={() => closeModal(id)}
              aria-label="Close"
            >
              <CloseIcon />
            </IconButton>
          )}

          {children}
        </Box>
      </Box>
    </Box>,
    document.body
  );
};