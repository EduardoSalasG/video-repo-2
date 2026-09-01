import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onMenu?: () => void;
  title?: string;
}

export const Header = ({ onMenu, title = 'Dance Platform' }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.76)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {onMenu && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenu}
            aria-label="Abrir menú"
            sx={{ color: '#111111' }}
          >
            <MenuIcon />
          </IconButton>
        )}
        {user ? (
          <Link to="/app" style={{ textDecoration: 'none', flexGrow: 1 }}>
            <Typography
              variant="h6"
              sx={{ color: '#111111', letterSpacing: '-0.02em' }}
            >
              {title}
            </Typography>
          </Link>
        ) : (
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, color: '#111111', letterSpacing: '-0.02em' }}
          >
            {title}
          </Typography>
        )}
        {user ? (
          <>
            <Button
              component={Link}
              to="/app/search"
              color="inherit"
              startIcon={<SearchIcon />}
              sx={{ color: '#111111', fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Buscar
            </Button>
            {(user.role === 'ADMIN' || user.role === 'INSTRUCTOR') && (
              <Button
                component={Link}
                to="/admin"
                color="inherit"
                sx={{ color: '#111111', fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Administración
              </Button>
            )}
            <Button
              component={Link}
              to="/app/profile"
              color="inherit"
              startIcon={<PersonIcon />}
              sx={{ color: '#111111', fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Perfil
            </Button>
            <Typography
              variant="body2"
              sx={{ mr: 2, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}
            >
              {user.email}
            </Typography>
          </>
        ) : (
          <Button
            variant="contained"
            component={Link}
            to="/login"
            size="small"
            sx={{ borderRadius: 8, px: 2 }}
          >
            Entrar
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};
