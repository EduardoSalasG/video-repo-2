import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

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
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Iniciar sesión
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
            sx={{ mt: 2 }}
          >
            Entrar
          </Button>
          <Typography variant="body2" sx={{ mt: 2 }}>
            ¿No tienes cuenta?{' '}
            <Button component={Link} to="/app" size="small">
              Explorar cursos
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};
