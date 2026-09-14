import { useState, type ReactNode } from 'react';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TuneIcon from '@mui/icons-material/Tune';
import LockIcon from '@mui/icons-material/Lock';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Typography } from '../atoms/Typography';
import { Footer } from '../molecules/Footer';
import { useAuth } from '../../hooks/useAuth';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 64;

interface MenuItem { label: string; path: string; icon: ReactNode; perm: string; }
interface MenuGroup { label: string; icon: ReactNode; items: MenuItem[]; }

const STANDALONE_ITEMS: MenuItem[] = [
  { label: 'Dashboard', path: '/admin', icon: <DashboardIcon />, perm: 'admin.dashboard.view' },
  { label: 'Usuarios', path: '/admin/usuarios', icon: <PeopleIcon />, perm: 'admin.users.view' },
];

const MENU_GROUPS: MenuGroup[] = [
  {
    label: 'Contenido',
    icon: <MenuBookIcon />,
    items: [
      { label: 'Cursos', path: '/admin/cursos', icon: <SchoolIcon />, perm: 'content.courses.manage' },
      { label: 'Módulos', path: '/admin/modulos', icon: <ViewModuleIcon />, perm: 'content.courses.manage' },
      { label: 'Secciones', path: '/admin/secciones', icon: <VideoLibraryIcon />, perm: 'content.courses.manage' },
      { label: 'Videos', path: '/admin/videos', icon: <VideoLibraryIcon />, perm: 'content.courses.manage' },
    ],
  },
  {
    label: 'Parámetros',
    icon: <TuneIcon />,
    items: [
      { label: 'Pasos', path: '/admin/parametros/pasos', icon: <SchoolIcon />, perm: 'content.labels.manage' },
      { label: 'Estilos', path: '/admin/parametros/estilos', icon: <SchoolIcon />, perm: 'admin.params.manage' },
      { label: 'Dificultades', path: '/admin/parametros/dificultades', icon: <SchoolIcon />, perm: 'admin.params.manage' },
      { label: 'Tipos de video', path: '/admin/parametros/tipos-video', icon: <SchoolIcon />, perm: 'admin.params.manage' },
      { label: 'Tipos de etiqueta', path: '/admin/parametros/tipos-etiqueta', icon: <SchoolIcon />, perm: 'admin.params.manage' },
      { label: 'Niveles de acceso', path: '/admin/parametros/niveles-acceso', icon: <SchoolIcon />, perm: 'admin.params.manage' },
      { label: 'Roles', path: '/admin/parametros/roles', icon: <SchoolIcon />, perm: 'admin.roles.manage' },
      { label: 'Permisos', path: '/admin/parametros/permisos', icon: <LockIcon />, perm: 'admin.roles.manage' },
    ],
  },
];

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout, hasPerm } = useAuth();
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const standaloneItems = STANDALONE_ITEMS.filter((item) => hasPerm(item.perm));
  const menuGroups = MENU_GROUPS
    .map((group) => ({ ...group, items: group.items.filter((item) => hasPerm(item.perm)) }))
    .filter((group) => group.items.length > 0);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const menuContent = (expanded: boolean, onNavigate: (path: string) => void) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 1,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {standaloneItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={isActive(item.path)}
            onClick={() => onNavigate(item.path)}
            sx={{
              borderRadius: 2,
              minHeight: 48,
              justifyContent: expanded ? 'initial' : 'center',
              px: expanded ? 2 : 1,
              mb: 0.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: expanded ? 2 : 'auto',
                justifyContent: 'center',
                color: isActive(item.path) ? '#111111' : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{
                opacity: expanded ? 1 : 0,
                width: expanded ? 'auto' : 0,
                overflow: 'hidden',
                transition: 'opacity 200ms ease',
              }}
            />
          </ListItemButton>
        ))}
        {menuGroups.map((group) => (
          <Accordion
            key={group.label}
            defaultExpanded={expanded && group.items.some((item) => isActive(item.path))}
            disableGutters
            elevation={0}
            sx={{ backgroundColor: 'transparent', '&:before': { display: 'none' } }}
          >
            <AccordionSummary
              expandIcon={expanded ? <ExpandMoreIcon /> : null}
              sx={{ minHeight: 48, px: expanded ? 2 : 1, borderRadius: 2 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: expanded ? 'flex-start' : 'center',
                  gap: expanded ? 1.5 : 0,
                  width: '100%',
                }}
              >
                <Box sx={{ display: 'flex', color: 'text.secondary' }}>{group.icon}</Box>
                {expanded && (
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {group.label}
                  </Typography>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: expanded ? 1 : 0, pt: 0 }}>
              <List disablePadding>
                {group.items.map((item) => (
                  <ListItemButton
                    key={item.path}
                    selected={isActive(item.path)}
                    onClick={() => onNavigate(item.path)}
                    sx={{
                      borderRadius: 2,
                      minHeight: 40,
                      justifyContent: expanded ? 'initial' : 'center',
                      px: expanded ? 2 : 1,
                      mb: 0.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: expanded ? 2 : 'auto',
                        justifyContent: 'center',
                        color: isActive(item.path) ? '#111111' : 'inherit',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {expanded && <ListItemText primary={item.label} />}
                  </ListItemButton>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      <Divider />
      <List sx={{ px: 1 }}>
        <ListItemButton
          component={Link}
          to="/app"
          onClick={() => setMobileOpen(false)}
          sx={{
            borderRadius: 2,
            minHeight: 48,
            justifyContent: expanded ? 'initial' : 'center',
            px: expanded ? 2 : 1,
            mb: 0.5,
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: expanded ? 2 : 'auto', justifyContent: 'center' }}>
            <ArrowBackIcon />
          </ListItemIcon>
          <ListItemText
            primary="Volver a la biblioteca"
            sx={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0, overflow: 'hidden', transition: 'opacity 200ms ease' }}
          />
        </ListItemButton>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            minHeight: 48,
            justifyContent: expanded ? 'initial' : 'center',
            px: expanded ? 2 : 1,
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: expanded ? 2 : 'auto', justifyContent: 'center' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Cerrar sesión"
            sx={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0, overflow: 'hidden', transition: 'opacity 200ms ease' }}
          />
        </ListItemButton>
        {expanded && user && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user.email}
            </Typography>
          </Box>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {!isMobile && (
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
                Administración
              </Typography>
            )}
            <IconButton onClick={() => setOpen(!open)} size="small" aria-label="Contraer menú">
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          </Toolbar>
          <Divider />
          {menuContent(open, navigate)}
        </Drawer>
      )}
      {isMobile && (
        <>
          {!mobileOpen && (
            <IconButton
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              sx={{
                position: 'fixed',
                top: 'calc(8px + env(safe-area-inset-top))',
                left: 8,
                zIndex: (t) => t.zIndex.drawer + 2,
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(20px) saturate(180%)',
                boxShadow: 1,
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              [`& .MuiDrawer-paper`]: {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                backgroundColor: 'rgba(255, 255, 255, 0.97)',
                backdropFilter: 'blur(20px) saturate(180%)',
              },
            }}
          >
            <Toolbar
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                minHeight: 64,
              }}
            >
              <IconButton onClick={() => setMobileOpen(false)} size="small" aria-label="Cerrar menú" edge="start">
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
                Administración
              </Typography>
            </Toolbar>
            <Divider />
            {menuContent(true, handleNavigate)}
          </Drawer>
        </>
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          pt: isMobile ? 'calc(96px + env(safe-area-inset-top))' : 3,
          pb: isMobile ? 'calc(24px + env(safe-area-inset-bottom))' : 3,
          width: { sm: `calc(100% - ${open ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)` },
          height: { xs: '100dvh', sm: '100vh' },
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          backgroundColor: '#fafafa',
          transition: 'width 250ms ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
        <Footer />
      </Box>
    </Box>
  );
};
