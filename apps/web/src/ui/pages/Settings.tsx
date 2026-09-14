import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LogoutIcon from '@mui/icons-material/Logout';
import { z } from 'zod';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { SubmitButton } from '../atoms/SubmitButton';
import { IconButton } from '../atoms/IconButton';
import { FormField } from '../molecules/FormField';
import { FormError } from '../molecules/FormError';
import { StatusSnackbar } from '../molecules/StatusSnackbar';
import { useAuth } from '../../hooks/useAuth';
import { useZodForm } from '../../hooks/useZodForm';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useStatusSnackbar } from '../../hooks/useStatusSnackbar';
import { api } from '../../lib/api';
import { apiErrorMessage } from '../../lib/error';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Introduce tu contraseña actual'),
    newPassword: z.string().min(8, 'La contraseña nueva debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña nueva'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas nuevas no coinciden',
    path: ['confirmPassword'],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export const Settings = () => {
  useDocumentTitle('Configuración');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const snackbar = useStatusSnackbar();
  const [showPasswords, setShowPasswords] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { values, errors, formError, setFormError, submitting, setField, reset, handleSubmit } =
    useZodForm<PasswordForm>(passwordSchema, {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

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

  const onSubmit = handleSubmit(async (data) => {
    if (!user) return;
    try {
      await api.changePassword(user.id, data.currentPassword, data.newPassword);
      reset();
      snackbar.showSuccess('Contraseña actualizada correctamente');
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Error al cambiar la contraseña'));
    }
  });

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
        <Typography variant="h6" component="h2" gutterBottom>
          Cambiar contraseña
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Mínimo 8 caracteres.
        </Typography>
        <Box component="form" onSubmit={onSubmit} noValidate>
          <FormField
            label="Contraseña actual"
            type={showPasswords ? 'text' : 'password'}
            required
            value={values.currentPassword}
            onChange={(e) => setField('currentPassword', e.target.value)}
            fieldError={errors.currentPassword}
            autoComplete="current-password"
            slotProps={{ input: { endAdornment: passwordAdornment } }}
          />
          <FormField
            label="Nueva contraseña"
            type={showPasswords ? 'text' : 'password'}
            required
            value={values.newPassword}
            onChange={(e) => setField('newPassword', e.target.value)}
            fieldError={errors.newPassword}
            autoComplete="new-password"
            slotProps={{ input: { endAdornment: passwordAdornment } }}
          />
          <FormField
            label="Confirmar nueva contraseña"
            type={showPasswords ? 'text' : 'password'}
            required
            value={values.confirmPassword}
            onChange={(e) => setField('confirmPassword', e.target.value)}
            fieldError={errors.confirmPassword}
            autoComplete="new-password"
            slotProps={{ input: { endAdornment: passwordAdornment } }}
          />
          <FormError message={formError} />
          <SubmitButton
            fullWidth
            loading={submitting}
            loadingText="Guardando…"
            sx={{ mt: 2 }}
          >
            Guardar contraseña
          </SubmitButton>
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
      <StatusSnackbar {...snackbar.snackbar} />
    </Box>
  );
};
