import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { useAuth } from '../../hooks/useAuth';

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  if (!user) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Perfil
        </Typography>
        <Typography color="text.secondary">No has iniciado sesión.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Perfil
      </Typography>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          {user.email}
        </Typography>
        <Typography color="text.secondary" paragraph>
          Rol: {user.role}
        </Typography>
        <Button variant="contained" onClick={handleLogout} fullWidth>
          Cerrar sesión
        </Button>
      </Paper>
    </Box>
  );
};
