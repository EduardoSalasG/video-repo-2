import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import { ApiError } from '../../lib/error';

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      setError('La contraseña nueva debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      if (!user) return;
      await api.changePassword(user.id, currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message ?? 'Error al cambiar la contraseña');
      } else {
        setError('Error al cambiar la contraseña');
      }
    } finally {
      setLoading(false);
    }
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
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
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

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cambiar contraseña
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Contraseña actualizada correctamente
          </Alert>
        )}
        <Input
          label="Contraseña actual"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          label="Nueva contraseña"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          label="Confirmar nueva contraseña"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !currentPassword || !newPassword || !confirmPassword}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? 'Guardando...' : 'Guardar contraseña'}
        </Button>
      </Paper>
    </Box>
  );
};
