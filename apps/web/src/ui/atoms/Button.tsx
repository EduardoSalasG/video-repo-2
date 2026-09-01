import MuiButton from '@mui/material/Button';
import type { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import { Link } from 'react-router-dom';

export interface ButtonProps extends MuiButtonProps {
  to?: string;
}

export const Button = ({ to, ...props }: ButtonProps) => {
  if (to) {
    return <MuiButton component={Link} to={to} {...props} />;
  }
  return <MuiButton {...props} />;
};
