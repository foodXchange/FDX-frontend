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

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={handleCancel}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            confirmVariant === 'danger'
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
          }`}
          onClick={handleConfirm}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
};