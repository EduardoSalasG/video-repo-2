import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import LockResetIcon from '@mui/icons-material/LockReset';
import LogoutIcon from '@mui/icons-material/Logout';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { version } from '../../../package.json';

export const Settings = () => {
  useDocumentTitle('Configuración');
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Configuración
      </Typography>

      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography variant="h6" component="h2">Contraseña</Typography>
            <Typography variant="body2" color="text.secondary">
              Actualiza tu contraseña de acceso.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            to="/app/settings/password"
            startIcon={<LockResetIcon fontSize="small" />}
            sx={{ flexShrink: 0 }}
          >
            Cambiar contraseña
          </Button>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography variant="h6" component="h2">Sesión</Typography>
            <Typography variant="body2" color="text.secondary">
              Cierra tu sesión en este dispositivo.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon fontSize="small" />}
            onClick={handleLogout}
            disabled={loggingOut}
            sx={{ flexShrink: 0 }}
          >
            {loggingOut ? 'Cerrando…' : 'Cerrar sesión'}
          </Button>
        </Box>
      </Paper>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', textAlign: 'center', mt: 4 }}
      >
        v{version}
      </Typography>
    </Box>
  );
};
