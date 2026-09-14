import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import { Typography } from '../atoms/Typography';
import { useAuth } from '../../hooks/useAuth';
import { useApiResource } from '../../hooks/useApiResource';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useParamLabels } from '../../hooks/useParamLabels';
import { api } from '../../lib/api';
import { brand } from '../../theme';

const DataRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 2,
      py: 1.5,
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Box sx={{ textAlign: 'right', minWidth: 0 }}>{children}</Box>
  </Box>
);

export const Profile = () => {
  useDocumentTitle('Perfil');
  const { user } = useAuth();
  const { getLabel } = useParamLabels();

  const { data: profile, loading: profileLoading } = useApiResource(
    () => api.getUser(user!.id),
    [user?.id],
    null,
  );

  if (!user) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Perfil
        </Typography>
        <Typography color="text.secondary">No has iniciado sesión.</Typography>
      </Box>
    );
  }

  const fullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : '';
  const initials = (profile ? `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}` : user.email[0]).toUpperCase();
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('es', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Perfil
      </Typography>

      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            aria-hidden
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(110, 77, 255, 0.14)',
              border: `1px solid ${brand.hairlineStrong}`,
              color: brand.accentHover,
              fontFamily: brand.display,
              fontSize: '1.35rem',
              letterSpacing: '0.02em',
            }}
          >
            {initials}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
              {profileLoading ? <Skeleton width={160} /> : fullName || user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
              {profileLoading ? <Skeleton width={200} /> : user.email}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {profileLoading ? (
          <Box sx={{ pt: 1 }}>
            <Skeleton />
            <Skeleton />
            <Skeleton width="60%" />
          </Box>
        ) : (
          <Box>
            {profile?.username && (
              <DataRow label="Nombre de usuario">
                <Typography variant="body2">@{profile.username}</Typography>
              </DataRow>
            )}
            <DataRow label="Rol">
              <Chip size="small" label={getLabel('role', user.role)} />
            </DataRow>
            {memberSince && (
              <DataRow label="Miembro desde">
                <Typography variant="body2">{memberSince}</Typography>
              </DataRow>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};
