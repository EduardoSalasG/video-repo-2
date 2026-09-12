import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export type StatusSeverity = 'info' | 'success' | 'error';

interface StatusSnackbarProps {
  open: boolean;
  message: string;
  severity: StatusSeverity;
  onClose: () => void;
}

export const StatusSnackbar = ({ open, message, severity, onClose }: StatusSnackbarProps) => (
  <Snackbar
    open={open}
    autoHideDuration={severity === 'info' ? null : 6000}
    onClose={severity === 'info' ? undefined : onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    sx={{ bottom: { xs: 'calc(72px + env(safe-area-inset-bottom))', sm: 24 } }}
  >
    <Alert
      onClose={severity === 'info' ? undefined : onClose}
      severity={severity}
      variant="filled"
      sx={{ width: '100%' }}
    >
      {message}
    </Alert>
  </Snackbar>
);
