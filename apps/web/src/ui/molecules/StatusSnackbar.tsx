import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import type { AlertColor } from '@mui/material/Alert';

export type StatusSeverity = AlertColor;

interface StatusSnackbarProps {
  open: boolean;
  message: string;
  severity?: StatusSeverity;
  onClose: () => void;
}

const AUTO_HIDE_MS: Record<StatusSeverity, number | undefined> = {
  success: 6000,
  info: undefined,
  warning: 8000,
  error: 8000,
};

export const StatusSnackbar = ({ open, message, severity = 'info', onClose }: StatusSnackbarProps) => (
  <Snackbar
    open={open}
    autoHideDuration={AUTO_HIDE_MS[severity] ?? null}
    onClose={(_event, reason) => {
      if (reason === 'clickaway') return;
      onClose();
    }}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
  >
    <Alert
      severity={severity}
      variant="filled"
      onClose={onClose}
      closeText="Cerrar"
      sx={{ width: '100%', alignItems: 'center' }}
      role={severity === 'info' ? 'status' : 'alert'}
      aria-live={severity === 'info' ? 'polite' : 'assertive'}
    >
      {message}
    </Alert>
  </Snackbar>
);
