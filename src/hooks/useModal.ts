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
    <T extends Record<string, any>>(
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
}> = ({
  modalId,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
}) => {
  const closeModal = useUIStore((state) => state.closeModal);

  const handleConfirm = () => {
    onConfirm();
    closeModal(modalId);
  };

  const handleCancel = () => {
    onCancel?.();
    closeModal(modalId);
  };

  return null; // Simplified for now
};