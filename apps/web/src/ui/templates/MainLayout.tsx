import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Header } from '../organisms/Header';
import { useAuth } from '../../hooks/useAuth';

const pageVariants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.99 },
};

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuth();

  const [value, setValue] = useState(0);
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (location.pathname === '/app' || location.pathname.startsWith('/app/courses')) {
      setValue(0);
    } else if (location.pathname === '/app/search') {
      setValue(1);
    } else if (location.pathname === '/app/profile') {
      setValue(2);
    } else {
      setValue(-1);
    }
  }, [location.pathname]);

  const handleChange = (_: unknown, newValue: number) => {
    setValue(newValue);
    if (newValue === 0) navigate('/app');
    else if (newValue === 1) navigate('/app/search');
    else if (newValue === 2) navigate('/app/profile');
  };

  const handleMoreOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMoreAnchor(event.currentTarget);
  };

  const handleMoreClose = () => {
    setMoreAnchor(null);
  };

  const handleMoreNavigate = (path: string) => {
    setMoreAnchor(null);
    navigate(path);
  };

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, bounce: 0, duration: 0.35 };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isMobile && <Header />}
      <Container maxWidth="md" sx={{ flex: 1, py: 3, pb: isMobile ? 9 : 3 }}>
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={transition}
        >
          <Outlet />
        </motion.div>
      </Container>
      {isMobile && (
        <>
          <BottomNavigation
            value={value}
            onChange={handleChange}
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
            <BottomNavigationAction label="Cursos" icon={<SchoolIcon />} />
            <BottomNavigationAction label="Buscar" icon={<SearchIcon />} />
            <BottomNavigationAction label="Perfil" icon={<PersonIcon />} />
            <BottomNavigationAction
              label="Más"
              icon={<MoreHorizIcon />}
              onClick={handleMoreOpen}
              value={-1}
            />
          </BottomNavigation>
          <Menu
            anchorEl={moreAnchor}
            open={Boolean(moreAnchor)}
            onClose={handleMoreClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <MenuItem onClick={() => handleMoreNavigate('/app/settings')}>
              <SettingsIcon fontSize="small" sx={{ mr: 1 }} /> Configuración
            </MenuItem>
            {isAdmin && (
              <MenuItem onClick={() => handleMoreNavigate('/admin')}>
                <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 1 }} /> Administración
              </MenuItem>
            )}
            <MenuItem onClick={() => handleMoreNavigate('/app/more')}>
              <MoreHorizIcon fontSize="small" sx={{ mr: 1 }} /> Más opciones
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
};
