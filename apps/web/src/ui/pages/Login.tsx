import { useNavigate, Navigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
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
import { apiErrorMessage } from '../../lib/error';
import { brand } from '../../theme';

const loginSchema = z.object({
  email: z.string().email('Introduce un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
  useDocumentTitle('Iniciar sesión');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  const { values, errors, formError, setFormError, submitting, setField, handleSubmit } =
    useZodForm<LoginForm>(loginSchema, { email: '', password: '' });

  const state = location.state as { from?: { pathname?: string }; info?: string } | null;
  const from = state?.from?.pathname;
  const info = state?.info;

  if (user) {
    return <Navigate to={from ?? '/app'} replace />;
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login(data.email, data.password);
      navigate(from ?? '/app', { replace: true });
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Error al iniciar sesión'));
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
            Bienvenido
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Inicia sesión para continuar aprendiendo baile.
          </Typography>
          {info && (
            <Alert severity="info" role="status" sx={{ mb: 2 }}>
              {info}
            </Alert>
          )}
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
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              required
              value={values.password}
              onChange={(event) => setField('password', event.target.value)}
              fieldError={errors.password}
            />
            <FormError message={formError} />
            <SubmitButton
              fullWidth
              loading={submitting}
              loadingText="Entrando..."
              sx={{ mt: 3, py: 1.5, borderRadius: 8 }}
            >
              Entrar
            </SubmitButton>
            <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
              ¿No tienes cuenta?{' '}
              <Button component={Link} to="/register" size="small" sx={{ color: brand.accentText }}>
                Regístrate
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
