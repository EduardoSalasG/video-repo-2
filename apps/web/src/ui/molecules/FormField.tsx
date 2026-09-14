import { Input } from '../atoms/Input';
import type { TextFieldProps } from '@mui/material/TextField';
import type { ReactNode } from 'react';

type FormFieldProps = TextFieldProps & {
  fieldError?: string;
  children?: ReactNode;
};

export const FormField = ({ fieldError, children, ...props }: FormFieldProps) => (
  <Input
    {...props}
    error={!!fieldError}
    helperText={fieldError ?? props.helperText}
  >
    {children}
  </Input>
);
