import TextField from '@mui/material/TextField';
import type { TextFieldProps } from '@mui/material/TextField';
import type { ReactNode } from 'react';

type InputProps = TextFieldProps & {
  children?: ReactNode;
};

export const Input = ({ children, ...props }: InputProps) => (
  <TextField fullWidth variant="outlined" size="small" margin="normal" {...props}>
    {children}
  </TextField>
);
