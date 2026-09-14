import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Link } from 'react-router-dom';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { brand } from '../../theme';

export const NotFound = () => {
  useDocumentTitle('Página no encontrada');
  const { user } = useAuth();

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '70dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
      }}
    >
      <Typography
        component="p"
        sx={{
          fontFamily: brand.display,
          fontStyle: 'italic',
          fontSize: { xs: '4rem', sm: '6rem' },
          lineHeight: 1,
          color: brand.accentText,
        }}
        aria-hidden="true"
      >
        404
      </Typography>
      <Typography variant="h4" component="h1" gutterBottom>
        Página no encontrada
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 360 }}>
        La ruta que buscas no existe o fue movida. Revisa la dirección o vuelve a un
        lugar conocido.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {user && (
          <Button component={Link} to="/app" variant="contained" sx={{ borderRadius: 8 }}>
            Ir a mi biblioteca
          </Button>
        )}
        <Button component={Link} to="/" variant="outlined" sx={{ borderRadius: 8 }}>
          Ir al inicio
        </Button>
      </Box>
    </Container>
  );
};
