import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Header } from '../organisms/Header';
import { Footer } from '../molecules/Footer';
import { useAuth } from '../../hooks/useAuth';
import { brand } from '../../theme';

const pageVariants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

const tabForPath = (pathname: string): number => {
  if (
    pathname === '/app' ||
    pathname.startsWith('/app/courses') ||
    pathname.startsWith('/app/sections')
  ) {
    return 0;
  }
  if (pathname === '/app/search') return 1;
  if (pathname === '/app/profile') return 2;
  return -1;
};

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldReduceMotion = useReducedMotion();
  const { hasPerm, logout } = useAuth();

  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  const value = tabForPath(location.pathname);

  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  const handleChange = (_: unknown, newValue: number) => {
    if (newValue === 0) navigate('/app');
    else if (newValue === 1) navigate('/app/search');
    else if (newValue === 2) navigate('/app/profile');
  };

  const handleMoreClose = () => setMoreAnchor(null);

  const handleMoreNavigate = (path: string) => {
    setMoreAnchor(null);
    navigate(path);
  };

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, bounce: 0, duration: 0.35 };

  const isAdmin = hasPerm('admin.panel.access');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: 16,
          top: -64,
          zIndex: (t) => t.zIndex.tooltip,
          px: 2,
          py: 1,
          borderRadius: 2,
          bgcolor: brand.accent,
          color: '#ffffff',
          fontSize: '0.875rem',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'top 160ms ease',
          '&:focus': { top: 16 },
        }}
      >
        Saltar al contenido
      </Box>
      {!isMobile && <Header />}
      <Container
        component="main"
        id="main-content"
        tabIndex={-1}
        ref={mainRef}
        maxWidth="md"
        sx={{
          flex: 1,
          py: 3,
          pb: isMobile ? 'calc(64px + env(safe-area-inset-bottom))' : 3,
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
        }}
      >
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="animate"
          variants={pageVariants}
          transition={transition}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Outlet />
        </motion.div>
        <Footer />
      </Container>
      {isMobile && (
        <>
          <BottomNavigation
            component="nav"
            aria-label="Navegación principal"
            value={value}
            onChange={handleChange}
            showLabels
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: (t) => t.zIndex.appBar,
            }}
          >
            <BottomNavigationAction
              label="Cursos"
              icon={<SchoolIcon />}
              aria-current={value === 0 ? 'page' : undefined}
            />
            <BottomNavigationAction
              label="Buscar"
              icon={<SearchIcon />}
              data-tour="nav-search"
              aria-current={value === 1 ? 'page' : undefined}
            />
            <BottomNavigationAction
              label="Perfil"
              icon={<PersonIcon />}
              data-tour="nav-profile"
              aria-current={value === 2 ? 'page' : undefined}
            />
            <BottomNavigationAction
              label="Más"
              icon={<MoreHorizIcon />}
              onClick={(event) => setMoreAnchor(event.currentTarget)}
              value={-1}
              aria-haspopup="menu"
              aria-expanded={moreAnchor ? 'true' : 'false'}
              aria-controls={moreAnchor ? 'more-menu' : undefined}
              aria-current={value === -1 ? 'page' : undefined}
            />
          </BottomNavigation>
          <Menu
            id="more-menu"
            anchorEl={moreAnchor}
            open={Boolean(moreAnchor)}
            onClose={handleMoreClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <MenuItem
              onClick={() => handleMoreNavigate('/app/settings')}
              aria-current={location.pathname === '/app/settings' ? 'page' : undefined}
            >
              <SettingsIcon fontSize="small" sx={{ mr: 1 }} /> Configuración
            </MenuItem>
            {isAdmin && (
              <MenuItem onClick={() => handleMoreNavigate('/admin')}>
                <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 1 }} /> Administración
              </MenuItem>
            )}
            <Divider />
            <MenuItem
              onClick={() => {
                handleMoreClose();
                void logout().then(() => navigate('/', { replace: true }));
              }}
            >
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Cerrar sesión
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
};
