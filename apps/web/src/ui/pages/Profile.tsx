import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LogoutIcon from '@mui/icons-material/Logout';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { useAuth } from '../../hooks/useAuth';
import { useParamLabels } from '../../hooks/useParamLabels';
import { api } from '../../lib/api';
import { ApiError } from '../../lib/error';
import { brand } from '../../theme';
import type { User } from '../../types';

const DataRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 2,
      py: 1.5,
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Box sx={{ textAlign: 'right', minWidth: 0 }}>{children}</Box>
  </Box>
);

export const Profile = () => {
  const { user, logout } = useAuth();
  const { getLabel } = useParamLabels();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api
      .getUser(user.id)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

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
      setError(err instanceof ApiError ? (err.message ?? 'Error al cambiar la contraseña') : 'Error al cambiar la contraseña');
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

  const fullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : '';
  const initials = (profile ? `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}` : user.email[0]).toUpperCase();
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('es', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const passwordAdornment = (
    <InputAdornment position="end">
      <IconButton
        size="small"
        edge="end"
        aria-label={showPasswords ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
        aria-pressed={showPasswords}
        onClick={() => setShowPasswords((v) => !v)}
      >
        {showPasswords ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Perfil
      </Typography>

      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            aria-hidden
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(110, 77, 255, 0.14)',
              border: `1px solid ${brand.hairlineStrong}`,
              color: brand.accentHover,
              fontFamily: brand.display,
              fontSize: '1.35rem',
              letterSpacing: '0.02em',
            }}
          >
            {initials}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
              {profileLoading ? <Skeleton width={160} /> : fullName || user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
              {profileLoading ? <Skeleton width={200} /> : user.email}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {profileLoading ? (
          <Box sx={{ pt: 1 }}>
            <Skeleton />
            <Skeleton />
            <Skeleton width="60%" />
          </Box>
        ) : (
          <Box>
            {profile?.username && (
              <DataRow label="Nombre de usuario">
                <Typography variant="body2">@{profile.username}</Typography>
              </DataRow>
            )}
            <DataRow label="Rol">
              <Chip size="small" label={getLabel('role', user.role)} />
            </DataRow>
            {memberSince && (
              <DataRow label="Miembro desde">
                <Typography variant="body2">{memberSince}</Typography>
              </DataRow>
            )}
          </Box>
        )}
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cambiar contraseña
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Mínimo 8 caracteres.
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
          type={showPasswords ? 'text' : 'password'}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          slotProps={{ input: { endAdornment: passwordAdornment } }}
        />
        <Input
          label="Nueva contraseña"
          type={showPasswords ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          slotProps={{ input: { endAdornment: passwordAdornment } }}
        />
        <Input
          label="Confirmar nueva contraseña"
          type={showPasswords ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          slotProps={{ input: { endAdornment: passwordAdornment } }}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !currentPassword || !newPassword || !confirmPassword}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? 'Guardando…' : 'Guardar contraseña'}
        </Button>
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
            <Typography variant="h6">Sesión</Typography>
            <Typography variant="body2" color="text.secondary">
              Cierra tu sesión en este dispositivo.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon fontSize="small" />}
            onClick={handleLogout}
            sx={{ flexShrink: 0 }}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
