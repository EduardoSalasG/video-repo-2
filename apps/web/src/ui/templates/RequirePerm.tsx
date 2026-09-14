import Paper from '@mui/material/Paper';
import { useAuth } from '../../hooks/useAuth';
import { Typography } from '../atoms/Typography';
import type { ReactNode } from 'react';

interface RequirePermProps {
  permission: string;
  children: ReactNode;
}

export const RequirePerm = ({ permission, children }: RequirePermProps) => {
  const { hasPerm } = useAuth();
  if (!hasPerm(permission)) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography color="text.secondary">
          No tienes permiso para ver esta sección. Contacta a un administrador si crees que es un error.
        </Typography>
      </Paper>
    );
  }
  return <>{children}</>;
};
