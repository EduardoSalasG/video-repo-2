import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import type { ReactNode } from 'react';
import { Button } from '../atoms/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  pending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Eliminar',
  pending,
  onClose,
  onConfirm,
}: ConfirmDialogProps) => (
  <Dialog open={open} onClose={pending ? undefined : onClose} aria-labelledby="confirm-dialog-title">
    <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{description}</DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button variant="outlined" onClick={onClose} disabled={pending}>
        Cancelar
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={onConfirm}
        disabled={pending}
        startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
      >
        {pending ? 'Procesando...' : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);
