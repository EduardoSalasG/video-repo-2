import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { IconButton } from '../atoms/IconButton';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { brand } from '../../theme';

export const Header = () => {
  const { user, hasPerm, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const navButtonSx = (active: boolean) => ({
    color: brand.ink,
    fontWeight: 600,
    display: { xs: 'none', sm: 'inline-flex' },
    ...(active && { color: brand.accentText }),
  });

  const handleLogout = async () => {
    setMenuAnchor(null);
    await logout();
    navigate('/', { replace: true });
  };

  const handleNavigate = (path: string) => {
    setMenuAnchor(null);
    navigate(path);
  };

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ gap: 1 }}>
        <Link to="/app" style={{ textDecoration: 'none', flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{
              color: brand.ink,
              fontFamily: brand.display,
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: '1.25rem',
              letterSpacing: '0.01em',
            }}
          >
            Dance Platform
          </Typography>
        </Link>
        <Box component="nav" aria-label="Navegación principal" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Button
            component={Link}
            to="/app"
            color="inherit"
            aria-current={location.pathname === '/app' ? 'page' : undefined}
            sx={navButtonSx(location.pathname === '/app')}
          >
            Biblioteca
          </Button>
          <Button
            component={Link}
            to="/app/search"
            color="inherit"
            startIcon={<SearchIcon />}
            data-tour="nav-search"
            aria-current={location.pathname === '/app/search' ? 'page' : undefined}
            sx={navButtonSx(location.pathname === '/app/search')}
          >
            Buscar
          </Button>
          {hasPerm('admin.panel.access') && (
            <Button
              component={Link}
              to="/admin"
              color="inherit"
              sx={navButtonSx(false)}
            >
              Administración
            </Button>
          )}
          <IconButton
            aria-label="Menú de cuenta"
            aria-haspopup="menu"
            aria-expanded={menuAnchor ? 'true' : 'false'}
            aria-controls={menuAnchor ? 'account-menu' : undefined}
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            sx={{ color: brand.ink }}
          >
            <PersonIcon />
          </IconButton>
          <Menu
            id="account-menu"
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem disabled sx={{ opacity: '1 !important' }}>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => handleNavigate('/app/profile')}
              aria-current={location.pathname === '/app/profile' ? 'page' : undefined}
            >
              <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Perfil
            </MenuItem>
            <MenuItem
              onClick={() => handleNavigate('/app/settings')}
              aria-current={location.pathname === '/app/settings' ? 'page' : undefined}
            >
              <SettingsIcon fontSize="small" sx={{ mr: 1 }} /> Configuración
            </MenuItem>
            {hasPerm('admin.panel.access') && (
              <MenuItem onClick={() => handleNavigate('/admin')}>
                <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 1 }} /> Administración
              </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Cerrar sesión
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
