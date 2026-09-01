import { Input } from '../atoms/Input';
import { Typography } from '../atoms/Typography';
import Box from '@mui/material/Box';
import type { TextFieldProps } from '@mui/material/TextField';
import type { ReactNode } from 'react';

type FormFieldProps = TextFieldProps & {
  fieldError?: string;
  children?: ReactNode;
};

export const FormField = ({ fieldError, children, ...props }: FormFieldProps) => (
  <Box>
    <Input {...props}>{children}</Input>
    {fieldError && (
      <Typography variant="caption" color="error" role="alert">
        {fieldError}
      </Typography>
    )}
  </Box>
);
