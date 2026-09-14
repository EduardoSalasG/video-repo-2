import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

interface RequireAuthProps {
  requirePermission?: string;
  children?: ReactNode;
}

export const RequireAuth = ({ requirePermission, children }: RequireAuthProps) => {
  const { user, loading, hasPerm } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requirePermission && !hasPerm(requirePermission)) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};
