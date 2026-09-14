import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { FormField } from '../molecules/FormField';
import { Footer } from '../molecules/Footer';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import { useAuth } from '../../hooks/useAuth';
import { brand } from '../../theme';

const loginSchema = z.object({
  email: z.string().email('Introduce un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/app', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

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
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <FormField
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              fieldError={errors.email}
            />
            <FormField
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fieldError={errors.password}
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
              sx={{ mt: 3, py: 1.5, borderRadius: 8 }}
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </Button>
            <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
              ¿No tienes cuenta?{' '}
              <Button component={Link} to="/register" size="small" sx={{ color: brand.accent }}>
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
