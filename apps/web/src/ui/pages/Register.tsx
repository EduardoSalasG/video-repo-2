import { useNavigate, Navigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { FormField } from '../molecules/FormField';
import { FormError } from '../molecules/FormError';
import { Footer } from '../molecules/Footer';
import { Button } from '../atoms/Button';
import { SubmitButton } from '../atoms/SubmitButton';
import { Typography } from '../atoms/Typography';
import { useAuth } from '../../hooks/useAuth';
import { useZodForm } from '../../hooks/useZodForm';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { api } from '../../lib/api';
import { apiErrorMessage } from '../../lib/error';
import { brand } from '../../theme';

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

const initialValues: RegisterForm = {
  email: '',
  username: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
};

export const Register = () => {
  useDocumentTitle('Crear cuenta');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  const { values, errors, formError, setFormError, submitting, setField, handleSubmit } =
    useZodForm<RegisterForm>(registerSchema, initialValues);

  if (user) {
    return <Navigate to="/app" replace />;
  }

  const onSubmit = handleSubmit(async (data) => {
    const { confirmPassword: _confirm, ...registerData } = data;
    try {
      await api.register({ ...registerData, role: 'STUDENT' });
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Error al registrarse'));
      return;
    }
    try {
      await login(registerData.email, registerData.password);
      navigate('/app', { replace: true });
    } catch {
      navigate('/login', {
        replace: true,
        state: {
          info: 'Cuenta creada. Inicia sesión para continuar.',
          from: (location.state as { from?: { pathname?: string } } | null)?.from,
        },
      });
    }
  });

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(110, 77, 255, 0.18), transparent 65%), ${brand.bg}`,
      }}
    >
      <Container maxWidth="sm" sx={{ py: 8, minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <motion.div style={{ flex: 1 }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.45 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 6,
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
          <Box component="form" onSubmit={onSubmit} noValidate>
            <FormField
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={(event) => setField('email', event.target.value)}
              fieldError={errors.email}
            />
            <FormField
              label="Usuario"
              autoComplete="username"
              required
              value={values.username}
              onChange={(event) => setField('username', event.target.value)}
              fieldError={errors.username}
            />
            <FormField
              label="Nombre"
              autoComplete="given-name"
              required
              value={values.firstName}
              onChange={(event) => setField('firstName', event.target.value)}
              fieldError={errors.firstName}
            />
            <FormField
              label="Apellido"
              autoComplete="family-name"
              required
              value={values.lastName}
              onChange={(event) => setField('lastName', event.target.value)}
              fieldError={errors.lastName}
            />
            <FormField
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              required
              value={values.password}
              onChange={(event) => setField('password', event.target.value)}
              fieldError={errors.password}
            />
            <FormField
              label="Confirmar contraseña"
              type="password"
              autoComplete="new-password"
              required
              value={values.confirmPassword}
              onChange={(event) => setField('confirmPassword', event.target.value)}
              fieldError={errors.confirmPassword}
            />
            <FormError message={formError} />
            <SubmitButton
              fullWidth
              loading={submitting}
              loadingText="Creando cuenta..."
              sx={{ mt: 3, py: 1.5, borderRadius: 8 }}
            >
              Registrarme
            </SubmitButton>
            <Typography
              variant="body2"
              sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}
            >
              ¿Ya tienes cuenta?{' '}
              <Button component={Link} to="/login" size="small" sx={{ color: brand.accentText }}>
                Iniciar sesión
              </Button>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
      <Footer />
      </Container>
    </Box>
  );
};
