import { useCallback, useRef, useState, type ReactNode } from 'react';
import { ConfirmDialog } from '../ui/organisms/ConfirmDialog';

interface ConfirmOptions {
  title: string;
  description: ReactNode;
  confirmLabel?: string;
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  pending: boolean;
  error: string | null;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    pending: false,
    error: null,
    title: '',
    description: '',
  });
  const actionRef = useRef<(() => void | Promise<void>) | null>(null);

  const confirm = useCallback((options: ConfirmOptions, action: () => void | Promise<void>) => {
    actionRef.current = action;
    setState({ open: true, pending: false, error: null, ...options });
  }, []);

  const handleClose = useCallback(() => {
    setState((s) => ({ ...s, open: false, error: null }));
    actionRef.current = null;
  }, []);

  const handleConfirm = useCallback(async () => {
    const action = actionRef.current;
    if (!action) return;
    setState((s) => ({ ...s, pending: true, error: null }));
    try {
      await action();
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo completar la acción';
      setState((s) => ({ ...s, error: message }));
    } finally {
      setState((s) => ({ ...s, pending: false }));
    }
  }, [handleClose]);

  const dialog = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      description={state.description}
      confirmLabel={state.confirmLabel}
      pending={state.pending}
      error={state.error}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  );

  return { confirm, dialog };
}
