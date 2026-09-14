import { useState, type ReactNode } from 'react';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TuneIcon from '@mui/icons-material/Tune';
import LockIcon from '@mui/icons-material/Lock';
import GestureIcon from '@mui/icons-material/Gesture';
import StyleIcon from '@mui/icons-material/Style';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import CategoryIcon from '@mui/icons-material/Category';
import LabelIcon from '@mui/icons-material/Label';
import KeyIcon from '@mui/icons-material/Key';
import BadgeIcon from '@mui/icons-material/Badge';
import ViewListIcon from '@mui/icons-material/ViewList';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { brand } from '../../theme';
import { Typography } from '../atoms/Typography';
import { IconButton } from '../atoms/IconButton';
import { Footer } from '../molecules/Footer';
import { useAuth } from '../../hooks/useAuth';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 64;

interface MenuItem { label: string; path: string; icon: ReactNode; perm: string; }
interface MenuGroup { label: string; icon: ReactNode; items: MenuItem[]; }

const STANDALONE_ITEMS: MenuItem[] = [
  { label: 'Dashboard', path: '/admin', icon: <DashboardIcon />, perm: 'admin.dashboard.view' },
  { label: 'Usuarios', path: '/admin/usuarios', icon: <PeopleIcon />, perm: 'admin.users.view' },
];

const MENU_GROUPS: MenuGroup[] = [
  {
    label: 'Contenido',
    icon: <MenuBookIcon />,
    items: [
      { label: 'Cursos', path: '/admin/cursos', icon: <SchoolIcon />, perm: 'content.courses.manage' },
      { label: 'Módulos', path: '/admin/modulos', icon: <ViewModuleIcon />, perm: 'content.courses.manage' },
      { label: 'Secciones', path: '/admin/secciones', icon: <ViewListIcon />, perm: 'content.courses.manage' },
      { label: 'Videos', path: '/admin/videos', icon: <OndemandVideoIcon />, perm: 'content.courses.manage' },
    ],
  },
  {
    label: 'Parámetros',
    icon: <TuneIcon />,
    items: [
      { label: 'Pasos', path: '/admin/parametros/pasos', icon: <GestureIcon />, perm: 'content.labels.manage' },
      { label: 'Estilos', path: '/admin/parametros/estilos', icon: <StyleIcon />, perm: 'admin.params.manage' },
      { label: 'Dificultades', path: '/admin/parametros/dificultades', icon: <SignalCellularAltIcon />, perm: 'admin.params.manage' },
      { label: 'Tipos de video', path: '/admin/parametros/tipos-video', icon: <CategoryIcon />, perm: 'admin.params.manage' },
      { label: 'Tipos de etiqueta', path: '/admin/parametros/tipos-etiqueta', icon: <LabelIcon />, perm: 'admin.params.manage' },
      { label: 'Niveles de acceso', path: '/admin/parametros/niveles-acceso', icon: <KeyIcon />, perm: 'admin.params.manage' },
      { label: 'Roles', path: '/admin/parametros/roles', icon: <BadgeIcon />, perm: 'admin.roles.manage' },
      { label: 'Permisos', path: '/admin/parametros/permisos', icon: <LockIcon />, perm: 'admin.roles.manage' },
    ],
  },
];

const ALL_ITEMS = [...STANDALONE_ITEMS, ...MENU_GROUPS.flatMap((g) => g.items)];

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout, hasPerm } = useAuth();
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const standaloneItems = STANDALONE_ITEMS.filter((item) => hasPerm(item.perm));
  const menuGroups = MENU_GROUPS
    .map((group) => ({ ...group, items: group.items.filter((item) => hasPerm(item.perm)) }))
    .filter((group) => group.items.length > 0);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  const currentLabel =
    [...ALL_ITEMS].reverse().find((item) => isActive(item.path))?.label ?? 'Administración';

  const handleNavigate = () => {
    setMobileOpen(false);
  };

  const itemButton = (item: MenuItem, expanded: boolean) => {
    const active = isActive(item.path);
    const button = (
      <ListItemButton
        component={Link}
        to={item.path}
        selected={active}
        onClick={handleNavigate}
        aria-current={active ? 'page' : undefined}
        sx={{
          borderRadius: 2,
          minHeight: 44,
          justifyContent: expanded ? 'initial' : 'center',
          px: expanded ? 2 : 1,
          mb: 0.5,
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: expanded ? 2 : 'auto',
            justifyContent: 'center',
            color: active ? brand.accentText : 'inherit',
          }}
        >
          {item.icon}
        </ListItemIcon>
        {expanded && <ListItemText primary={item.label} />}
      </ListItemButton>
    );
    return expanded ? (
      button
    ) : (
      <Tooltip key={item.path} title={item.label} placement="right">
        {button}
      </Tooltip>
    );
  };

  const menuContent = (expanded: boolean) => (
    <Box
      component="nav"
      aria-label="Navegación de administración"
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
        {standaloneItems.map((item) => (
          <Box key={item.path}>{itemButton(item, expanded)}</Box>
        ))}
        {menuGroups.map((group) => (
          <Accordion
            key={group.label}
            defaultExpanded={expanded && group.items.some((item) => isActive(item.path))}
            disableGutters
            elevation={0}
            sx={{ backgroundColor: 'transparent', '&:before': { display: 'none' } }}
          >
            <AccordionSummary
              expandIcon={expanded ? <ExpandMoreIcon /> : null}
              aria-label={expanded ? undefined : `Abrir sección ${group.label}`}
              sx={{ minHeight: 48, px: expanded ? 2 : 1, borderRadius: 2 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: expanded ? 'flex-start' : 'center',
                  gap: expanded ? 1.5 : 0,
                  width: '100%',
                }}
              >
                <Box sx={{ display: 'flex', color: 'text.secondary' }}>{group.icon}</Box>
                {expanded && (
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {group.label}
                  </Typography>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: expanded ? 1 : 0, pt: 0 }}>
              <List disablePadding>
                {group.items.map((item) => (
                  <Box component="li" key={item.path} sx={{ listStyle: 'none' }}>
                    {itemButton(item, expanded)}
                  </Box>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      <Divider />
      <List sx={{ px: 1 }}>
        {(() => {
          const back = (
            <ListItemButton
              component={Link}
              to="/app"
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                minHeight: 44,
                justifyContent: expanded ? 'initial' : 'center',
                px: expanded ? 2 : 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: expanded ? 2 : 'auto', justifyContent: 'center' }}>
                <ArrowBackIcon />
              </ListItemIcon>
              {expanded && <ListItemText primary="Volver a la biblioteca" />}
            </ListItemButton>
          );
          const logoutButton = (
            <ListItemButton
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              sx={{
                borderRadius: 2,
                minHeight: 44,
                justifyContent: expanded ? 'initial' : 'center',
                px: expanded ? 2 : 1,
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: expanded ? 2 : 'auto', justifyContent: 'center' }}>
                <LogoutIcon />
              </ListItemIcon>
              {expanded && <ListItemText primary="Cerrar sesión" />}
            </ListItemButton>
          );
          return expanded ? (
            <>
              {back}
              {logoutButton}
            </>
          ) : (
            <>
              <Tooltip title="Volver a la biblioteca" placement="right">
                {back}
              </Tooltip>
              <Tooltip title="Cerrar sesión" placement="right">
                {logoutButton}
              </Tooltip>
            </>
          );
        })()}
        {expanded && user && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user.email}
            </Typography>
          </Box>
        )}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        height: { xs: '100dvh', sm: '100vh' },
      }}
    >
      {!isMobile && (
        <Drawer
          variant="permanent"
          open={open}
          aria-label="Menú de administración"
          sx={{
            width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
            flexShrink: 0,
            transition: 'width 250ms ease',
            [`& .MuiDrawer-paper`]: {
              width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
              boxSizing: 'border-box',
              overflowX: 'hidden',
              backgroundColor: 'rgba(15, 13, 24, 0.92)',
              backdropFilter: 'blur(20px) saturate(160%)',
              borderRight: `1px solid ${brand.hairline}`,
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
            <IconButton
              onClick={() => setOpen(!open)}
              size="small"
              aria-label={open ? 'Contraer menú' : 'Expandir menú'}
              aria-expanded={open}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          </Toolbar>
          <Divider />
          {menuContent(open)}
        </Drawer>
      )}
      {isMobile && (
        <AppBar
          position="static"
          sx={{ flexShrink: 0, pt: 'env(safe-area-inset-top)' }}
        >
          <Toolbar sx={{ minHeight: 48 }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú de administración"
              aria-expanded={mobileOpen}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
              {currentLabel}
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            [`& .MuiDrawer-paper`]: {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              backgroundColor: 'rgba(15, 13, 24, 0.97)',
              backdropFilter: 'blur(20px) saturate(160%)',
            },
          }}
        >
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              minHeight: 64,
            }}
          >
            <IconButton onClick={() => setMobileOpen(false)} size="small" aria-label="Cerrar menú" edge="start">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
              Administración
            </Typography>
          </Toolbar>
          <Divider />
          {menuContent(true)}
        </Drawer>
      )}
      <Box
        component="main"
        id="admin-main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: 0,
          width: { sm: `calc(100% - ${open ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)` },
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          backgroundColor: brand.bg,
          transition: 'width 250ms ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: 1040,
            mx: 'auto',
            p: { xs: 2, sm: 3 },
            pb: isMobile ? 'calc(24px + env(safe-area-inset-bottom))' : 3,
          }}
        >
          <Outlet />
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};
