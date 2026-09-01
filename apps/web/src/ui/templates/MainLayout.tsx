import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../organisms/Header';

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="md" sx={{ flex: 1, py: 3, pb: isMobile ? 8 : 3 }}>
        <Outlet />
      </Container>
      {isMobile && (
        <BottomNavigation
          value={value}
          onChange={handleChange}
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
        >
          <BottomNavigationAction label="Cursos" icon={<SchoolIcon />} />
          <BottomNavigationAction label="Buscar" icon={<SearchIcon />} />
        </BottomNavigation>
      )}
    </Box>
  );
};
