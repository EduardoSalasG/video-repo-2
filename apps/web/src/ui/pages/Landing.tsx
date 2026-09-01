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
          Aprende danza paso a paso
        </Typography>
        <Typography
          variant="h5"
          component="p"
          sx={{ mb: 4, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}
        >
          Clases grabadas, recursos descargables y seguimiento de progreso.
        </Typography>
        <Button
          component={Link}
          to="/app"
          variant="contained"
          color="secondary"
          size="large"
          aria-label="Comenzar ahora"
        >
          Comenzar
        </Button>
        <Button
          component={Link}
          to="/login"
          variant="outlined"
          color="inherit"
          size="large"
          sx={{ ml: 2 }}
        >
          Login
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
            Visualiza el contenido las veces que necesites, desde cualquier
            dispositivo.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="h6" component="h2" gutterBottom>
            Progreso personalizado
          </Typography>
          <Typography color="text.secondary">
            Sigue tu avance por módulos y secciones, nunca pierdas el ritmo.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="h6" component="h2" gutterBottom>
            Profesores expertos
          </Typography>
          <Typography color="text.secondary">
            Clases grabadas por profesionales del baile y la pedagogía.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  </Box>
);
