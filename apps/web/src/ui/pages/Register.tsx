import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';

const registerSchema = z
  .object({
    email: z.string().email('Introduce un email válido'),
    username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
    firstName: z.string().min(1, 'El nombre es obligatorio'),
    lastName: z.string().min(1, 'El apellido es obligatorio'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (field: keyof RegisterForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        username: fieldErrors.username?.[0],
        firstName: fieldErrors.firstName?.[0],
        lastName: fieldErrors.lastName?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await api.register({
        ...result.data,
        role: 'STUDENT',
      });
      await login(result.data.email, result.data.password);
      navigate('/app', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrarse';
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.45 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 6,
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.06)',
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontSize: { xs: '2rem', sm: '2.25rem' } }}
          >
            Crear cuenta
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Únete y empieza a aprender baile.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <FormField
              label="Email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange('email')}
              fieldError={errors.email}
            />
            <FormField
              label="Usuario"
              value={form.username}
              onChange={handleChange('username')}
              fieldError={errors.username}
            />
            <FormField
              label="Nombre"
              value={form.firstName}
              onChange={handleChange('firstName')}
              fieldError={errors.firstName}
            />
            <FormField
              label="Apellido"
              value={form.lastName}
              onChange={handleChange('lastName')}
              fieldError={errors.lastName}
            />
            <FormField
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange('password')}
              fieldError={errors.password}
            />
            <FormField
              label="Confirmar contraseña"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              fieldError={errors.confirmPassword}
            />
            {apiError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {apiError}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              sx={{ mt: 3, py: 1.5, borderRadius: 14 }}
            >
              {submitting ? 'Creando cuenta...' : 'Registrarme'}
            </Button>
            <Typography
              variant="body2"
              sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}
            >
              ¿Ya tienes cuenta?{' '}
              <Button component={Link} to="/login" size="small" sx={{ color: '#007aff' }}>
                Iniciar sesión
              </Button>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};
