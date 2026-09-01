import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onMenu?: () => void;
  title?: string;
}

export const Header = ({ onMenu, title = 'Dance Platform' }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
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
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        {user ? (
          <>
            <Button component={Link} to="/app/search" color="inherit" sx={{ mr: 1 }}>
              Buscar
            </Button>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user.email}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button component={Link} to="/login" color="inherit">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};
