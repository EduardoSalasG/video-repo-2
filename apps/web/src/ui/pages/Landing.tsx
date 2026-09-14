import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import MuiLink from '@mui/material/Link';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import '@fontsource-variable/bodoni-moda';
import '@fontsource-variable/bodoni-moda/wght-italic.css';

const StageCanvas = lazy(() =>
  import('../organisms/StageCanvas').then((m) => ({ default: m.StageCanvas }))
);

const BG = '#0b0908';
const IVORY = '#f4eee4';
const IVORY_DIM = '#b3a898';
const AMBER = '#e2a84e';
const HAIRLINE = 'rgba(244, 238, 228, 0.09)';
const DISPLAY = '"Bodoni Moda Variable", "Bodoni Moda", Didot, "Times New Roman", serif';

const MARQUEE_ITEMS = [
  'Mambo On2',
  'Casino',
  'Bachata Sensual',
  'Bachata Moderna',
  'Pasos',
  'Secuencias',
  'Coreografías',
];

const STEPS = [
  {
    n: '1',
    title: 'Crea tu cuenta',
    body: 'Regístrate en un minuto. Tu biblioteca empieza vacía y crece con cada curso que se te habilita.',
  },
  {
    n: '2',
    title: 'Recibe acceso',
    body: 'Un instructor o administrador te abre los cursos. El acceso es por alumno y por curso: nada se comparte de más.',
  },
  {
    n: '3',
    title: 'Entrena a tu ritmo',
    body: 'Módulos, secciones y videos en orden. Repite cada paso las veces que necesites, desde cualquier dispositivo.',
  },
];

const METADATA_ROWS: Array<[string, string]> = [
  ['Estilo', 'Bachata Sensual'],
  ['Dificultad', 'Intermedio'],
  ['Tipo', 'Secuencia'],
  ['Duración', '8 conteos'],
  ['Pasos', 'paso básico, giro, cambio de posición'],
];

const INSTRUCTOR_POINTS = [
  {
    title: 'Estructura tu contenido',
    body: 'Cursos divididos en módulos y secciones, con un video y sus metadatos por sección.',
  },
  {
    title: 'Decide quién entra',
    body: 'Acceso por alumno y por curso: solo lectura, colaboración o edición completa.',
  },
  {
    title: 'Clasifica cada video',
    body: 'Estilo, dificultad, tipo, pasos y etiquetas alimentan la búsqueda de tu biblioteca.',
  },
];

const revealTransition = { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const };

const Reveal = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ ...revealTransition, delay }}
    >
      {children}
    </motion.div>
  );
};

const Diamond = () => (
  <Box
    component="span"
    aria-hidden="true"
    sx={{
      display: 'inline-block',
      width: 6,
      height: 6,
      mx: 3,
      bgcolor: AMBER,
      opacity: 0.75,
      transform: 'rotate(45deg)',
      flexShrink: 0,
    }}
  />
);

const focusRing = {
  '&:focus-visible': {
    outline: `2px solid ${AMBER}`,
    outlineOffset: 3,
  },
};

const primaryButtonSx = {
  bgcolor: AMBER,
  color: '#171106',
  borderRadius: 999,
  px: 3.5,
  py: 1.5,
  fontSize: '1rem',
  fontWeight: 600,
  transition: 'background-color 160ms ease, transform 120ms ease',
  '&:hover': { bgcolor: '#f0bc6a' },
  '&:active': { transform: 'scale(0.97)' },
  ...focusRing,
};

const ghostButtonSx = {
  color: IVORY,
  borderColor: 'rgba(244, 238, 228, 0.3)',
  borderRadius: 999,
  px: 3.5,
  py: 1.5,
  fontSize: '1rem',
  transition: 'border-color 160ms ease, background-color 160ms ease, transform 120ms ease',
  '&:hover': {
    borderColor: IVORY,
    bgcolor: 'rgba(244, 238, 228, 0.06)',
  },
  '&:active': { transform: 'scale(0.97)' },
  ...focusRing,
};

export const Landing = () => {
  const reduced = useReducedMotion();
  const heroMotion = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { ...revealTransition, delay },
  });

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: BG,
        color: IVORY,
        '& ::selection': { bgcolor: AMBER, color: '#171106' },
      }}
    >
      <Box
        component="a"
        href="#contenido"
        sx={{
          position: 'absolute',
          left: 16,
          top: -64,
          zIndex: 20,
          px: 2,
          py: 1,
          borderRadius: 2,
          bgcolor: AMBER,
          color: '#171106',
          fontSize: '0.875rem',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'top 160ms ease',
          '&:focus': { top: 16 },
        }}
      >
        Saltar al contenido
      </Box>

      <Box
        component="header"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 3, sm: 6 },
          py: { xs: 2.5, sm: 3 },
        }}
      >
        <MuiLink
          component={Link}
          to="/"
          underline="none"
          sx={{
            fontFamily: DISPLAY,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: '1.35rem',
            color: IVORY,
            textDecoration: 'none',
            letterSpacing: '0.01em',
            ...focusRing,
          }}
        >
          Dance Platform
        </MuiLink>
        <Box component="nav" aria-label="Principal" sx={{ display: 'flex', gap: { xs: 1, sm: 2 } }}>
          <Button
            component={Link}
            to="/login"
            variant="text"
            sx={{
              color: IVORY_DIM,
              fontSize: '0.95rem',
              '&:hover': { color: IVORY, bgcolor: 'transparent' },
              ...focusRing,
            }}
          >
            Iniciar sesión
          </Button>
          <Button
            component={Link}
            to="/register"
            variant="contained"
            sx={{ ...primaryButtonSx, px: 2.5, py: 1, fontSize: '0.9rem' }}
          >
            Crear cuenta
          </Button>
        </Box>
      </Box>

      <Box component="main" id="contenido" sx={{ flex: 1 }}>
        <Box
          component="section"
          aria-label="Presentación"
          sx={{
            position: 'relative',
            minHeight: '100svh',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            background: `radial-gradient(ellipse 90% 60% at 70% 80%, rgba(226, 168, 78, 0.14), transparent 60%), ${BG}`,
          }}
        >
          <Suspense fallback={null}>
            <StageCanvas />
          </Suspense>
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: {
                xs: 'linear-gradient(to top, rgba(11,9,8,0.92) 8%, rgba(11,9,8,0.35) 55%, rgba(11,9,8,0.55) 100%)',
                sm: 'linear-gradient(to right, rgba(11,9,8,0.9) 0%, rgba(11,9,8,0.5) 50%, rgba(11,9,8,0.1) 100%)',
              },
            }}
          />
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 14, sm: 12 } }}>
            <Box sx={{ maxWidth: { xs: '100%', sm: 620 } }}>
              <motion.div {...heroMotion(0)}>
                <Typography
                  variant="h1"
                  sx={{
                    fontFamily: DISPLAY,
                    fontWeight: 500,
                    fontSize: { xs: '2.9rem', sm: '4.4rem', md: '5.2rem' },
                    lineHeight: 1.02,
                    letterSpacing: '-0.015em',
                    color: IVORY,
                    textWrap: 'balance',
                  }}
                >
                  Tu pista de baile,{' '}
                  <Box component="em" sx={{ fontWeight: 460, color: AMBER }}>
                    siempre abierta.
                  </Box>
                </Typography>
              </motion.div>
              <motion.div {...heroMotion(0.1)}>
                <Typography
                  sx={{
                    mt: 3,
                    fontSize: { xs: '1.1rem', sm: '1.3rem' },
                    lineHeight: 1.55,
                    color: IVORY_DIM,
                    maxWidth: '34rem',
                    textWrap: 'pretty',
                  }}
                >
                  Cursos en video de salsa y bachata con cada paso clasificado por
                  estilo, dificultad y tipo. Aprende a tu ritmo — o dirige tu
                  escuela desde un solo lugar.
                </Typography>
              </motion.div>
              <motion.div {...heroMotion(0.2)}>
                <Box sx={{ mt: 5, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    size="large"
                    sx={primaryButtonSx}
                  >
                    Empezar a bailar
                  </Button>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    size="large"
                    sx={ghostButtonSx}
                  >
                    Iniciar sesión
                  </Button>
                </Box>
              </motion.div>
            </Box>
          </Container>
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              bottom: 28,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 1,
              height: 56,
              background: `linear-gradient(to bottom, transparent, ${AMBER})`,
              opacity: 0.6,
              '@keyframes scrollCue': {
                '0%': { transform: 'translateX(-50%) scaleY(0)', transformOrigin: 'top' },
                '45%': { transform: 'translateX(-50%) scaleY(1)', transformOrigin: 'top' },
                '55%': { transform: 'translateX(-50%) scaleY(1)', transformOrigin: 'bottom' },
                '100%': { transform: 'translateX(-50%) scaleY(0)', transformOrigin: 'bottom' },
              },
              animation: 'scrollCue 2.6s ease-in-out infinite',
            }}
          />
        </Box>

        <Box
          aria-hidden="true"
          sx={{
            borderTop: `1px solid ${HAIRLINE}`,
            borderBottom: `1px solid ${HAIRLINE}`,
            py: 2.25,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: 'max-content',
              '@keyframes marquee': {
                from: { transform: 'translateX(0)' },
                to: { transform: 'translateX(-50%)' },
              },
              animation: 'marquee 30s linear infinite',
              '&:hover': { animationPlayState: 'paused' },
            }}
          >
            {[0, 1].map((copy) => (
              <Box key={copy} component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                {MARQUEE_ITEMS.map((item) => (
                  <Box key={item} component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                      component="span"
                      sx={{
                        fontFamily: DISPLAY,
                        fontStyle: 'italic',
                        fontSize: '1.25rem',
                        color: 'rgba(244, 238, 228, 0.55)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item}
                    </Typography>
                    <Diamond />
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>

        <Container maxWidth="lg">
          <Box component="section" aria-labelledby="como-funciona" sx={{ py: { xs: 9, sm: 13 } }}>
            <Reveal>
              <Typography
                id="como-funciona"
                variant="h2"
                sx={{
                  fontFamily: DISPLAY,
                  fontWeight: 500,
                  fontSize: { xs: '2rem', sm: '2.9rem' },
                  letterSpacing: '-0.01em',
                  maxWidth: 560,
                  textWrap: 'balance',
                }}
              >
                De la cuenta a la pista en tres pasos.
              </Typography>
            </Reveal>
            <Box
              sx={{
                mt: { xs: 5, sm: 7 },
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: { xs: 4, sm: 5 },
              }}
            >
              {STEPS.map((step, i) => (
                <Reveal key={step.n} delay={i * 0.08}>
                  <Box sx={{ borderTop: `1px solid ${HAIRLINE}`, pt: 3 }}>
                    <Typography
                      component="span"
                      sx={{
                        display: 'block',
                        fontFamily: DISPLAY,
                        fontStyle: 'italic',
                        fontSize: '2.2rem',
                        color: AMBER,
                        lineHeight: 1,
                      }}
                    >
                      {step.n}.
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{ mt: 2, fontSize: '1.15rem', fontWeight: 600, letterSpacing: '-0.01em' }}
                    >
                      {step.title}
                    </Typography>
                    <Typography sx={{ mt: 1.25, color: IVORY_DIM, fontSize: '0.98rem', lineHeight: 1.6 }}>
                      {step.body}
                    </Typography>
                  </Box>
                </Reveal>
              ))}
            </Box>
          </Box>
        </Container>

        <Box sx={{ borderTop: `1px solid ${HAIRLINE}` }}>
          <Container maxWidth="lg">
            <Box
              component="section"
              aria-labelledby="detalle-video"
              sx={{
                py: { xs: 9, sm: 13 },
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: { xs: 6, md: 10 },
                alignItems: 'center',
              }}
            >
              <Reveal>
                <Typography
                  id="detalle-video"
                  variant="h2"
                  sx={{
                    fontFamily: DISPLAY,
                    fontWeight: 500,
                    fontSize: { xs: '2rem', sm: '2.9rem' },
                    letterSpacing: '-0.01em',
                    textWrap: 'balance',
                  }}
                >
                  Sabes qué vas a bailar antes de dar play.
                </Typography>
                <Typography
                  sx={{ mt: 2.5, color: IVORY_DIM, fontSize: '1.05rem', lineHeight: 1.65, maxWidth: '30rem' }}
                >
                  Cada video lleva su ficha completa: estilo, dificultad, tipo de
                  contenido y los pasos que contiene. La búsqueda entiende esos
                  metadatos — encuentras el movimiento exacto que quieres
                  practicar.
                </Typography>
              </Reveal>
              <Reveal delay={0.1}>
                <Box
                  sx={{
                    border: `1px solid ${HAIRLINE}`,
                    borderRadius: 3,
                    bgcolor: '#120f0a',
                    p: { xs: 3, sm: 4 },
                    boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: DISPLAY,
                      fontStyle: 'italic',
                      fontSize: '1.5rem',
                      color: IVORY,
                    }}
                  >
                    Ficha de video
                  </Typography>
                  <Box component="dl" sx={{ mt: 2.5, display: 'grid', gap: 0 }}>
                    {METADATA_ROWS.map(([label, value], i) => (
                      <Box
                        key={label}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 3,
                          py: 1.5,
                          borderTop: i === 0 ? 'none' : `1px solid ${HAIRLINE}`,
                        }}
                      >
                        <Typography
                          component="dt"
                          sx={{ color: IVORY_DIM, fontSize: '0.85rem', letterSpacing: '0.04em' }}
                        >
                          {label}
                        </Typography>
                        <Typography
                          component="dd"
                          sx={{
                            m: 0,
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            textAlign: 'right',
                            color: label === 'Estilo' ? AMBER : IVORY,
                          }}
                        >
                          {value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Reveal>
            </Box>
          </Container>
        </Box>

        <Box sx={{ borderTop: `1px solid ${HAIRLINE}` }}>
          <Container maxWidth="lg">
            <Box
              component="section"
              aria-labelledby="instructores"
              sx={{
                py: { xs: 9, sm: 13 },
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: { xs: 6, md: 10 },
              }}
            >
              <Reveal>
                <Box>
                  <Typography
                    id="instructores"
                    variant="h2"
                    sx={{
                      fontFamily: DISPLAY,
                      fontWeight: 500,
                      fontSize: { xs: '2rem', sm: '2.9rem' },
                      letterSpacing: '-0.01em',
                      textWrap: 'balance',
                    }}
                  >
                    Tu escuela, bajo tu control.
                  </Typography>
                  <Typography
                    sx={{ mt: 2.5, color: IVORY_DIM, fontSize: '1.05rem', lineHeight: 1.65 }}
                  >
                    Si enseñas, la plataforma se convierte en tu escuela digital:
                    publica contenido estructurado y decide exactamente quién lo ve.
                  </Typography>
                  <Button
                    component={Link}
                    to="/register"
                    variant="outlined"
                    sx={{ ...ghostButtonSx, mt: 4, px: 3, py: 1.25 }}
                  >
                    Crear cuenta
                  </Button>
                  <Typography
                    sx={{ mt: 2, fontSize: '0.85rem', color: 'rgba(179, 168, 152, 0.75)' }}
                  >
                    Un administrador puede asignarte el rol de instructor.
                  </Typography>
                </Box>
              </Reveal>
              <Box sx={{ display: 'grid', alignContent: 'start' }}>
                {INSTRUCTOR_POINTS.map((point, i) => (
                  <Reveal key={point.title} delay={i * 0.08}>
                    <Box
                      sx={{
                        py: 3,
                        borderTop: `1px solid ${HAIRLINE}`,
                        '&:last-child': { borderBottom: `1px solid ${HAIRLINE}` },
                      }}
                    >
                      <Typography
                        variant="h3"
                        sx={{ fontSize: '1.15rem', fontWeight: 600, letterSpacing: '-0.01em' }}
                      >
                        {point.title}
                      </Typography>
                      <Typography sx={{ mt: 1, color: IVORY_DIM, fontSize: '0.98rem', lineHeight: 1.6 }}>
                        {point.body}
                      </Typography>
                    </Box>
                  </Reveal>
                ))}
              </Box>
            </Box>
          </Container>
        </Box>

        <Box
          component="section"
          aria-labelledby="cta-final"
          sx={{
            borderTop: `1px solid ${HAIRLINE}`,
            background: `radial-gradient(ellipse 70% 90% at 50% 110%, rgba(226, 168, 78, 0.16), transparent 65%), ${BG}`,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md" sx={{ py: { xs: 11, sm: 16 } }}>
            <Reveal>
              <Typography
                id="cta-final"
                variant="h2"
                sx={{
                  fontFamily: DISPLAY,
                  fontWeight: 500,
                  fontSize: { xs: '2.6rem', sm: '4rem' },
                  letterSpacing: '-0.01em',
                  textWrap: 'balance',
                }}
              >
                La pista <Box component="em" sx={{ color: AMBER }}>te espera.</Box>
              </Typography>
              <Typography
                sx={{ mt: 2.5, color: IVORY_DIM, fontSize: '1.05rem', lineHeight: 1.6 }}
              >
                Crea tu cuenta y empieza hoy.
              </Typography>
              <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  sx={primaryButtonSx}
                >
                  Crear cuenta
                </Button>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="large"
                  sx={ghostButtonSx}
                >
                  Iniciar sesión
                </Button>
              </Box>
            </Reveal>
          </Container>
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          borderTop: `1px solid ${HAIRLINE}`,
          py: 3,
          px: { xs: 3, sm: 6 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography
          component="span"
          sx={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '0.95rem', color: IVORY_DIM }}
        >
          Dance Platform
        </Typography>
        <MuiLink
          href="https://eduardosalasg.dev"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{ color: IVORY_DIM, fontSize: '0.85rem', ...focusRing }}
        >
          Eduardo Salas 2026
        </MuiLink>
      </Box>
    </Box>
  );
};
