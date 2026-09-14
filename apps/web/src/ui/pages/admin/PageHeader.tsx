import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link } from 'react-router-dom';
import MuiLink from '@mui/material/Link';
import { Typography } from '../../atoms/Typography';
import { brand } from '../../../theme';

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  crumbs?: Crumb[];
}

export const PageHeader = ({ title, description, crumbs }: PageHeaderProps) => (
  <Box sx={{ mb: 2 }}>
    {crumbs && crumbs.length > 0 && (
      <Breadcrumbs aria-label="Ruta de navegación" sx={{ mb: 0.5, '& .MuiBreadcrumbs-separator': { color: brand.dim } }}>
        {crumbs.map((crumb, index) =>
          crumb.to && index < crumbs.length - 1 ? (
            <MuiLink
              key={`${crumb.label}-${index}`}
              component={Link}
              to={crumb.to}
              underline="hover"
              color="inherit"
              sx={{ color: 'text.secondary', fontSize: '0.8rem' }}
            >
              {crumb.label}
            </MuiLink>
          ) : (
            <Typography
              key={`${crumb.label}-${index}`}
              variant="caption"
              color="text.secondary"
              aria-current={index === crumbs.length - 1 ? 'page' : undefined}
            >
              {crumb.label}
            </Typography>
          ),
        )}
      </Breadcrumbs>
    )}
    <Typography variant="h5" component="h1">
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {description}
      </Typography>
    )}
  </Box>
);
