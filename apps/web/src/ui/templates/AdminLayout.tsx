import { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SchoolIcon from '@mui/icons-material/School';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PeopleIcon from '@mui/icons-material/People';
import LockIcon from '@mui/icons-material/Lock';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import { Typography } from '../atoms/Typography';
import { useAuth } from '../../hooks/useAuth';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 64;

const MENU = [
  { label: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
  { label: 'Cursos', path: '/admin/cursos', icon: <SchoolIcon /> },
  { label: 'Módulos', path: '/admin/modulos', icon: <ViewModuleIcon /> },
  { label: 'Secciones', path: '/admin/secciones', icon: <VideoLibraryIcon /> },
  { label: 'Videos', path: '/admin/videos', icon: <VideoLibraryIcon /> },
  { label: 'Usuarios', path: '/admin/usuarios', icon: <PeopleIcon /> },
  { label: 'Accesos', path: '/admin/accesos', icon: <LockIcon /> },
];

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
          flexShrink: 0,
          transition: 'width 250ms ease',
          [`& .MuiDrawer-paper`]: {
            width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderRight: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'space-between' : 'center',
            px: open ? 2 : 1,
            minHeight: 64,
          }}
        >
          {open && (
            <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
              Admin
            </Typography>
          )}
          <IconButton onClick={() => setOpen(!open)} size="small" aria-label="Contraer menú">
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Toolbar>
        <Divider />
        <List sx={{ flex: 1, px: 1 }}>
          {MENU.map((item) => (
            <ListItemButton
              key={item.path}
              selected={isActive(item.path)}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: open ? 2 : 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: isActive(item.path) ? '#111111' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  opacity: open ? 1 : 0,
                  width: open ? 'auto' : 0,
                  overflow: 'hidden',
                  transition: 'opacity 200ms ease',
                }}
              />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <List sx={{ px: 1 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: open ? 2 : 1,
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', justifyContent: 'center' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Cerrar sesión"
              sx={{ opacity: open ? 1 : 0, width: open ? 'auto' : 0, overflow: 'hidden', transition: 'opacity 200ms ease' }}
            />
          </ListItemButton>
          {open && user && (
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            </Box>
          )}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${open ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: '#f2f2f7',
          transition: 'width 250ms ease',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
