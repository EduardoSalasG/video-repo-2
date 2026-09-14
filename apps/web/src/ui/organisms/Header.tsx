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
import { brand } from '../../theme';

interface HeaderProps {
  onMenu?: () => void;
  title?: string;
}

export const Header = ({ onMenu, title = 'Dance Platform' }: HeaderProps) => {
  const { user, hasPerm } = useAuth();

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ gap: 1 }}>
        {onMenu && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenu}
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </IconButton>
        )}
        {user ? (
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
              {title}
            </Typography>
          </Link>
        ) : (
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              color: brand.ink,
              fontFamily: brand.display,
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: '1.25rem',
              letterSpacing: '0.01em',
            }}
          >
            {title}
          </Typography>
        )}
        {user ? (
          <>
            <Button
              component={Link}
              to="/app"
              color="inherit"
              sx={{ color: brand.ink, fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Biblioteca
            </Button>
            <Button
              component={Link}
              to="/app/search"
              color="inherit"
              startIcon={<SearchIcon />}
              data-tour="nav-search"
              sx={{ color: brand.ink, fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Buscar
            </Button>
            {hasPerm('admin.panel.access') && (
              <Button
                component={Link}
                to="/admin"
                color="inherit"
                sx={{ color: brand.ink, fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Administración
              </Button>
            )}
            <Button
              component={Link}
              to="/app/profile"
              color="inherit"
              startIcon={<PersonIcon />}
              data-tour="nav-profile"
              sx={{ color: brand.ink, fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}
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
