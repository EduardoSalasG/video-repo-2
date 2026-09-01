import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenu?: () => void;
  title?: string;
}

export const Header = ({ onMenu, title = 'Dance Platform' }: HeaderProps) => (
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
      <Button component={Link} to="/login" color="inherit">
        Login
      </Button>
    </Toolbar>
  </AppBar>
);
