import Alert from '@mui/material/Alert';

interface FormErrorProps {
  message: string | null;
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;
  return (
    <Alert severity="error" role="alert" sx={{ mt: 1 }}>
      {message}
    </Alert>
  );
};
