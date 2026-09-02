import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Typography } from '../atoms/Typography';

export const More = () => (
  <Box>
    <Typography variant="h4" component="h1" gutterBottom>
      Más
    </Typography>
    <List>
      <ListItem>
        <ListItemText primary="Progreso de estudiantes" secondary="Próximamente" />
      </ListItem>
      <ListItem>
        <ListItemText primary="Comunidad y foros" secondary="Próximamente" />
      </ListItem>
      <ListItem>
        <ListItemText primary="Certificaciones" secondary="Próximamente" />
      </ListItem>
      <ListItem>
        <ListItemText primary="Análisis y métricas" secondary="Próximamente" />
      </ListItem>
    </List>
  </Box>
);
