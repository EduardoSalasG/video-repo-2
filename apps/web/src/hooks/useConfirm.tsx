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
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({ open: false, pending: false, title: '', description: '' });
  const actionRef = useRef<(() => void | Promise<void>) | null>(null);

  const confirm = useCallback((options: ConfirmOptions, action: () => void | Promise<void>) => {
    actionRef.current = action;
    setState({ open: true, pending: false, ...options });
  }, []);

  const handleClose = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
    actionRef.current = null;
  }, []);

  const handleConfirm = useCallback(async () => {
    const action = actionRef.current;
    if (!action) return;
    setState((s) => ({ ...s, pending: true }));
    try {
      await action();
      handleClose();
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
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  );

  return { confirm, dialog };
}
