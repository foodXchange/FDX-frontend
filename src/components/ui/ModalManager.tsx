import React from 'react';
import { useUIStore } from '@/store/useUIStore';
import { Modal } from './Modal';

export const ModalManager: React.FC = () => {
  const modals = useUIStore((state) => state.modals);

  return (
    <>
      {modals.map((modal) => {
        const { component: Component, props, options, id } = modal;
        
        return (
          <Modal
            key={id}
            id={id}
            size={options?.size}
            closeOnEscape={options?.closeOnEscape}
            closeOnBackdrop={options?.closeOnBackdrop}
            showCloseButton={options?.showCloseButton}
          >
            <Component {...props} modalId={id} />
          </Modal>
        );
      })}
    </>
  );
};