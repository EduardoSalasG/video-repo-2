import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Link } from 'react-router-dom';

export const Landing = () => (
  <Box>
    <Box
      sx={{
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        py: { xs: 6, sm: 10 },
      }}
    >
      <Container>
        <Typography
          variant="h2"
          component="h1"
          sx={{ fontSize: { xs: '2rem', sm: '3.5rem' } }}
          gutterBottom
        >
          Tu biblioteca de baile
        </Typography>
        <Typography
          variant="h5"
          component="p"
          sx={{ mb: 4, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}
        >
          Pasos, secuencias y coreografías en video, organizados por estilo y
          dificultad.
        </Typography>
        <Button
          component={Link}
          to="/app"
          variant="contained"
          size="large"
          aria-label="Explorar la biblioteca"
          sx={{
            backgroundColor: '#ffffff',
            color: '#111111',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
          }}
        >
          Explorar
        </Button>
        <Button
          component={Link}
          to="/login"
          variant="outlined"
          size="large"
          sx={{
            ml: 2,
            color: '#ffffff',
            borderColor: 'rgba(255,255,255,0.5)',
            '&:hover': {
              borderColor: '#ffffff',
              backgroundColor: 'rgba(255,255,255,0.08)',
            },
          }}
        >
          Iniciar sesión
        </Button>
      </Container>
    </Box>

    <Container sx={{ py: { xs: 4, sm: 8 } }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="h6" component="h2" gutterBottom>
            Acceso ilimitado
          </Typography>
          <Typography color="text.secondary">
            Mira el contenido las veces que quieras, desde cualquier
            dispositivo.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="h6" component="h2" gutterBottom>
            Organizado por estilo
          </Typography>
          <Typography color="text.secondary">
            Encuentra rápidamente pasos y coreografías por estilo, dificultad o
            tag.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="h6" component="h2" gutterBottom>
            Contenido profesional
          </Typography>
          <Typography color="text.secondary">
            Videos producidos por bailarines con experiencia en escena.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  </Box>
);
