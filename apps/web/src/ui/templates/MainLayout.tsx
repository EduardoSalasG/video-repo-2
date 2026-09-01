import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Header } from '../organisms/Header';

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

  const [value, setValue] = useState(0);

  useEffect(() => {
    if (location.pathname === '/app' || location.pathname.startsWith('/app/courses')) {
      setValue(0);
    } else if (location.pathname === '/app/search') {
      setValue(1);
    } else {
      setValue(0);
    }
  }, [location.pathname]);

  const handleChange = (_: unknown, newValue: number) => {
    setValue(newValue);
    if (newValue === 0) navigate('/app');
    else if (newValue === 1) navigate('/app/search');
  };

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, bounce: 0, duration: 0.35 };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="md" sx={{ flex: 1, py: 3, pb: isMobile ? 8 : 3 }}>
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
        <BottomNavigation
          value={value}
          onChange={handleChange}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.76)',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderTop: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <BottomNavigationAction label="Cursos" icon={<SchoolIcon />} />
          <BottomNavigationAction label="Buscar" icon={<SearchIcon />} />
        </BottomNavigation>
      )}
    </Box>
  );
};
