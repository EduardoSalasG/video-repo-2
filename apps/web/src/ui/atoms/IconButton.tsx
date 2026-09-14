import MuiIconButton from '@mui/material/IconButton';
import type { IconButtonProps as MuiIconButtonProps } from '@mui/material/IconButton';

export interface IconButtonProps extends MuiIconButtonProps {
  'aria-label': string;
}

export const IconButton = (props: IconButtonProps) => <MuiIconButton {...props} />;
