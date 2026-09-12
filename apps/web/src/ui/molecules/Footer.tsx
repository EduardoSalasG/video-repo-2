import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { Typography } from '../atoms/Typography';

export const Footer = () => (
  <Box
    component="footer"
    sx={{
      py: 3,
      mt: 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Link
      href="https://eduardosalasg.dev"
      target="_blank"
      rel="noopener noreferrer"
      underline="hover"
      sx={{ color: 'text.secondary' }}
    >
      <Typography variant="body2" component="span">
        Eduardo Salas 2026
      </Typography>
    </Link>
  </Box>
);
