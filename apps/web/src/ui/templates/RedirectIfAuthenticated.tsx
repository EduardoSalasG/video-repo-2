import { Navigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const RedirectIfAuthenticated = ({ children }: { children?: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};
