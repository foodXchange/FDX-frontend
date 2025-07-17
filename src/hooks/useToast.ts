import { useCallback } from 'react';
import { useSnackbar, VariantType } from 'notistack';

export function useToast() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const showToast = useCallback(
    (message: string, variant: VariantType = 'default', persist = false) => {
      return enqueueSnackbar(message, {
        variant,
        autoHideDuration: persist ? null : variant === 'error' ? 5000 : 3000,
        preventDuplicate: true,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      });
    },
    [enqueueSnackbar]
  );

  const hideToast = useCallback(
    (key?: string | number) => {
      closeSnackbar(key);
    },
    [closeSnackbar]
  );

  return {
    showToast,
    hideToast,
    showSuccess: (message: string) => showToast(message, 'success'),
    showError: (message: string) => showToast(message, 'error'),
    showWarning: (message: string) => showToast(message, 'warning'),
    showInfo: (message: string) => showToast(message, 'info'),
  };
}