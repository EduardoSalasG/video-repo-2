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
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TuneIcon from '@mui/icons-material/Tune';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Typography } from '../atoms/Typography';
import { useAuth } from '../../hooks/useAuth';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 64;

interface MenuItem { label: string; path: string; icon: ReactNode; }
interface MenuGroup { label: string; icon: ReactNode; items: MenuItem[]; }

const STANDALONE_ITEMS: MenuItem[] = [
  { label: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
  { label: 'Usuarios', path: '/admin/usuarios', icon: <PeopleIcon /> },
];

const MENU_GROUPS: MenuGroup[] = [
  {
    label: 'Contenido',
    icon: <MenuBookIcon />,
    items: [
      { label: 'Cursos', path: '/admin/cursos', icon: <SchoolIcon /> },
      { label: 'Módulos', path: '/admin/modulos', icon: <ViewModuleIcon /> },
      { label: 'Secciones', path: '/admin/secciones', icon: <VideoLibraryIcon /> },
      { label: 'Videos', path: '/admin/videos', icon: <VideoLibraryIcon /> },
    ],
  },
  {
    label: 'Parámetros',
    icon: <TuneIcon />,
    items: [
      { label: 'Pasos', path: '/admin/parametros/pasos', icon: <SchoolIcon /> },
      { label: 'Estilos', path: '/admin/parametros/estilos', icon: <SchoolIcon /> },
      { label: 'Dificultades', path: '/admin/parametros/dificultades', icon: <SchoolIcon /> },
      { label: 'Tipos de video', path: '/admin/parametros/tipos-video', icon: <SchoolIcon /> },
      { label: 'Tipos de etiqueta', path: '/admin/parametros/tipos-etiqueta', icon: <SchoolIcon /> },
    ],
  },
];

const ALL_MENU_ITEMS: MenuItem[] = [
  STANDALONE_ITEMS[0], // Dashboard
  ...MENU_GROUPS[0].items, // Contenido
  ...MENU_GROUPS[1].items, // Parámetros
  STANDALONE_ITEMS[1], // Usuarios
];

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  const handleMoreOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMoreAnchor(event.currentTarget);
  };

  const handleMoreClose = () => setMoreAnchor(null);

  const mobileNavIndex = (() => {
    const idx = ALL_MENU_ITEMS.findIndex((item) => isActive(item.path));
    if (idx < 2) return idx;
    return -1;
  })();

  const handleMobileNav = (_: unknown, newValue: number) => {
    if (newValue < 0 || newValue >= 2) return;
    navigate(ALL_MENU_ITEMS[newValue].path);
  };

  const moreItems = ALL_MENU_ITEMS.slice(2);

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
          <Box sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
            {STANDALONE_ITEMS.map((item) => (
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
            {MENU_GROUPS.map((group) => (
              <Accordion
                key={group.label}
                defaultExpanded={open && group.items.some((item) => isActive(item.path))}
                disableGutters
                elevation={0}
                sx={{ backgroundColor: 'transparent', '&:before': { display: 'none' } }}
              >
                <AccordionSummary
                  expandIcon={open ? <ExpandMoreIcon /> : null}
                  sx={{ minHeight: 48, px: open ? 2 : 1, borderRadius: 2 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: open ? 'flex-start' : 'center',
                      gap: open ? 1.5 : 0,
                      width: '100%',
                    }}
                  >
                    <Box sx={{ display: 'flex', color: 'text.secondary' }}>{group.icon}</Box>
                    {open && (
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {group.label}
                      </Typography>
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ px: open ? 1 : 0, pt: 0 }}>
                  <List disablePadding>
                    {group.items.map((item) => (
                      <ListItemButton
                        key={item.path}
                        selected={isActive(item.path)}
                        onClick={() => navigate(item.path)}
                        sx={{
                          borderRadius: 2,
                          minHeight: 40,
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
                        {open && <ListItemText primary={item.label} />}
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
              sx={{
                borderRadius: 2,
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: open ? 2 : 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', justifyContent: 'center' }}>
                <ArrowBackIcon />
              </ListItemIcon>
              <ListItemText
                primary="Volver a la biblioteca"
                sx={{ opacity: open ? 1 : 0, width: open ? 'auto' : 0, overflow: 'hidden', transition: 'opacity 200ms ease' }}
              />
            </ListItemButton>
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
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          pb: isMobile ? 10 : 3,
          width: { sm: `calc(100% - ${open ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)` },
          height: { xs: '100dvh', sm: '100vh' },
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          backgroundColor: '#fafafa',
          transition: 'width 250ms ease',
        }}
      >
        <Outlet />
      </Box>
      {isMobile && (
        <>
          <BottomNavigation
            value={mobileNavIndex}
            onChange={handleMobileNav}
            showLabels
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(20px) saturate(180%)',
              borderTop: '1px solid rgba(0,0,0,0.08)',
              zIndex: (t) => t.zIndex.appBar,
            }}
          >
            <BottomNavigationAction label="Dashboard" icon={<DashboardIcon />} />
            <BottomNavigationAction label="Cursos" icon={<SchoolIcon />} />
            <BottomNavigationAction
              label="Más"
              icon={<MoreHorizIcon />}
              value={-1}
              onClick={handleMoreOpen}
            />
          </BottomNavigation>
          <Menu
            anchorEl={moreAnchor}
            open={Boolean(moreAnchor)}
            onClose={handleMoreClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            {moreItems.map((item) => (
              <MenuItem
                key={item.path}
                onClick={() => {
                  handleMoreClose();
                  navigate(item.path);
                }}
                selected={isActive(item.path)}
              >
                {item.icon && <Box sx={{ mr: 1 }}>{item.icon}</Box>}
                {item.label}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem component={Link} to="/app" onClick={handleMoreClose}>
              <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} /> Volver a la biblioteca
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Cerrar sesión
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
};
