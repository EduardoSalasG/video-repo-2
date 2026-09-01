import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import { Typography } from '../atoms/Typography';
import { Outlet, useNavigate } from 'react-router-dom';

const DRAWER_WIDTH = 240;

export const AdminLayout = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6">Panel de administración</Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItemButton onClick={() => navigate('/admin')}>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/admin/courses')}>
            <ListItemText primary="Cursos" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/admin/modules')}>
            <ListItemText primary="Módulos" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/admin/sections')}>
            <ListItemText primary="Secciones" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/admin/users')}>
            <ListItemText primary="Usuarios" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/admin/access')}>
            <ListItemText primary="Accesos" />
          </ListItemButton>
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: `${DRAWER_WIDTH}px`,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
