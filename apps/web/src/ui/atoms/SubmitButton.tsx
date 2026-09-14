import CircularProgress from '@mui/material/CircularProgress';
import { Button, type ButtonProps } from './Button';

export interface SubmitButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const SubmitButton = ({ loading, loadingText, children, disabled, ...props }: SubmitButtonProps) => (
  <Button
    type="submit"
    variant="contained"
    disabled={disabled || loading}
    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
    {...props}
  >
    {loading ? (loadingText ?? 'Guardando...') : children}
  </Button>
);
