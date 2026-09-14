import { useCallback, useState } from 'react';
import type { StatusSeverity } from '../ui/molecules/StatusSnackbar';

interface StatusSnackbarState {
  open: boolean;
  message: string;
  severity: StatusSeverity;
  onClose: () => void;
}

export function useStatusSnackbar() {
  const [state, setState] = useState<{ open: boolean; message: string; severity: StatusSeverity }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const show = useCallback((message: string, severity: StatusSeverity) => {
    setState({ open: true, message, severity });
  }, []);

  const showSuccess = useCallback((message: string) => show(message, 'success'), [show]);
  const showError = useCallback((message: string) => show(message, 'error'), [show]);
  const showInfo = useCallback((message: string) => show(message, 'info'), [show]);
  const onClose = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  const snackbar: StatusSnackbarState = { ...state, onClose };

  return { snackbar, showSuccess, showError, showInfo, show };
}
