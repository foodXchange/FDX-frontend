import React from 'react';
import { useCallback } from 'react';
import { useUIStore } from '@/store/useUIStore';

interface UseModalOptions {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
}

export function useModal() {
  const { openModal, closeModal, closeAllModals } = useUIStore();

  const open = useCallback(
    <T extends Record<string, unknown>>(
      component: React.ComponentType<T>,
      props?: T,
      options?: UseModalOptions
    ) => {
      return openModal({
        component,
        props,
        options,
      });
    },
    [openModal]
  );

  const close = useCallback(
    (modalId: string) => {
      closeModal(modalId);
    },
    [closeModal]
  );

  const closeAll = useCallback(() => {
    closeAllModals();
  }, [closeAllModals]);

  return {
    open,
    close,
    closeAll,
  };
}

// Example modal component
export const ConfirmModal: React.FC<{
  modalId: string;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
}> = (props) => {
  // Modal component implementation would go here
  // Using props to avoid unused variable warnings
  console.log(props);
  return null; // Simplified for now
};