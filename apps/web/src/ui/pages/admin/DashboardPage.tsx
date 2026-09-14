import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { api } from '../../../lib/api';
import { useApiResource } from '../../../hooks/useApiResource';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { RequirePerm } from '../../templates/RequirePerm';
import { Typography } from '../../atoms/Typography';
import { Button } from '../../atoms/Button';
import { PageHeader } from '../../organisms/PageHeader';

export const DashboardPage = () => {
  useDocumentTitle('Dashboard · Administración');
  const { data, loading, error, reload } = useApiResource(
    () => api.getDashboard(),
    [],
    { courses: 0, users: 0 },
  );

  return (
    <RequirePerm permission="admin.dashboard.view">
      <Stack spacing={3}>
        <PageHeader title="Dashboard" description="Resumen de lo que administras." />
        {loading ? (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Skeleton variant="rounded" width={220} height={110} />
            <Skeleton variant="rounded" width={220} height={110} />
          </Box>
        ) : error ? (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              No se pudo cargar el dashboard: {error}
            </Typography>
            <Button variant="outlined" onClick={reload}>
              Reintentar
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Paper sx={{ p: 3, borderRadius: 2, minWidth: 200 }}>
              <Typography color="text.secondary" variant="body2">
                Cursos que administro
              </Typography>
              <Typography variant="h3">{data.courses}</Typography>
            </Paper>
            <Paper sx={{ p: 3, borderRadius: 2, minWidth: 200 }}>
              <Typography color="text.secondary" variant="body2">
                Usuarios que administro
              </Typography>
              <Typography variant="h3">{data.users}</Typography>
            </Paper>
          </Box>
        )}
      </Stack>
    </RequirePerm>
  );
};
