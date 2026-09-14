import { useEffect, useState } from 'react';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { api } from '../../../lib/api';
import { useApiResource } from '../../../hooks/useApiResource';
import { useZodForm } from '../../../hooks/useZodForm';
import { useStatusSnackbar } from '../../../hooks/useStatusSnackbar';
import { useConfirm } from '../../../hooks/useConfirm';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useParamLabels } from '../../../hooks/useParamLabels';
import { useAuth } from '../../../hooks/useAuth';
import { RequirePerm } from '../../templates/RequirePerm';
import { Typography } from '../../atoms/Typography';
import { Button } from '../../atoms/Button';
import { SubmitButton } from '../../atoms/SubmitButton';
import { IconButton } from '../../atoms/IconButton';
import { FormField } from '../../molecules/FormField';
import { FormError } from '../../molecules/FormError';
import { StatusSnackbar } from '../../molecules/StatusSnackbar';
import { PageHeader } from '../../organisms/PageHeader';
import type { Course, CourseAccess, User, Role } from '../../../types';

const roleSchema = z.object({
  role: z.string().min(1, 'Selecciona un rol'),
});

const accessSchema = z.object({
  courseId: z.string().min(1, 'Selecciona un curso'),
  accessLevel: z.string().min(1, 'Selecciona un nivel de acceso'),
});

const userLabel = (user: User) => {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return name ? `${name} (${user.email})` : user.email;
};

export const UsersPage = () => {
  useDocumentTitle('Usuarios · Administración');
  const { hasPerm } = useAuth();
  const canManageRoles = hasPerm('admin.users.manage');
  const canManageAccess = hasPerm('content.access.manage');
  const { snackbar, showSuccess } = useStatusSnackbar();
  const { confirm, dialog } = useConfirm();
  const { getLabel, params } = useParamLabels();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { data: users, loading, error, reload, setData: setUsers } = useApiResource(
    () => api.searchUsers(debouncedQuery),
    [debouncedQuery],
    [] as User[],
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: courses } = useApiResource(() => api.getCourses(), [], [] as Course[]);

  const [selectedId, setSelectedId] = useState('');
  const [selected, setSelected] = useState<User | null>(null);
  const [accesses, setAccesses] = useState<CourseAccess[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const roleForm = useZodForm(roleSchema, { role: '' });
  const accessForm = useZodForm(accessSchema, { courseId: '', accessLevel: 'READ' });

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      setAccesses([]);
      return;
    }
    setLoadingDetail(true);
    api
      .getUser(selectedId)
      .then((user) => {
        setSelected(user);
        roleForm.setField('role', user.role);
      })
      .catch(() => setSelected(null));
    api
      .getUserAccesses(selectedId)
      .then(setAccesses)
      .catch(() => setAccesses([]))
      .finally(() => setLoadingDetail(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const submitRole = roleForm.handleSubmit(async (data) => {
    if (!selectedId) return;
    try {
      const updated = await api.updateUserRole(selectedId, data.role as Role);
      setSelected(updated);
      setUsers((prev) => prev.map((u) => (u.id === selectedId ? updated : u)));
      showSuccess('Rol actualizado');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar rol';
      roleForm.setFormError(message);
    }
  });

  const submitAccess = accessForm.handleSubmit(async (data) => {
    if (!selectedId) return;
    try {
      await api.grantAccess(data.courseId, {
        userId: selectedId,
        courseId: data.courseId,
        accessLevel: data.accessLevel,
      });
      accessForm.setValues((f) => ({ ...f, courseId: '' }));
      const next = await api.getUserAccesses(selectedId);
      setAccesses(next);
      showSuccess('Acceso concedido');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al conceder acceso';
      accessForm.setFormError(message);
    }
  });

  const handleRevoke = (access: CourseAccess) => {
    if (!selectedId) return;
    const courseName = access.course?.name ?? access.courseId;
    confirm(
      {
        title: 'Revocar acceso',
        description: (
          <>
            Se revocará el acceso de <strong>{selected ? userLabel(selected) : 'este usuario'}</strong> al
            curso <strong>{courseName}</strong>.
          </>
        ),
        confirmLabel: 'Revocar acceso',
      },
      async () => {
        await api.revokeAccess(selectedId, access.courseId);
        setAccesses((prev) => prev.filter((a) => a.courseId !== access.courseId));
        showSuccess('Acceso revocado');
      },
    );
  };

  const roleOptions =
    params.role.filter((r) => r.isActive).length > 0
      ? params.role.filter((r) => r.isActive)
      : [
          { value: 'ADMIN', label: 'Administrador' },
          { value: 'INSTRUCTOR', label: 'Instructor' },
          { value: 'STUDENT', label: 'Estudiante' },
        ];

  const levelOptions =
    params.accessLevel.filter((l) => l.isActive).length > 0
      ? params.accessLevel.filter((l) => l.isActive)
      : [
          { value: 'READ', label: 'Lectura' },
          { value: 'WRITE', label: 'Escritura' },
          { value: 'MAINTAIN', label: 'Mantener' },
        ];

  return (
    <RequirePerm permission="admin.users.view">
      <Stack spacing={3} component="section" aria-labelledby="admin-users-heading">
        <PageHeader
          title="Usuarios"
          description="Busca usuarios, revisa su rol y gestiona sus accesos a cursos."
        />

        <FormField
          label="Buscar usuario"
          placeholder="Nombre, email o usuario"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          margin="none"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 480 }}
        />

        {loading ? (
          <Stack spacing={1}>
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
          </Stack>
        ) : error ? (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              No se pudieron cargar los usuarios: {error}
            </Typography>
            <Button variant="outlined" onClick={reload}>
              Reintentar
            </Button>
          </Paper>
        ) : users.length === 0 ? (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography color="text.secondary">
              {debouncedQuery ? `Sin resultados para «${debouncedQuery}».` : 'No hay usuarios para mostrar.'}
            </Typography>
          </Paper>
        ) : (
          <Paper sx={{ borderRadius: 2 }}>
            <List aria-label="Usuarios">
              {users.map((user) => (
                <ListItem key={user.id} disablePadding>
                  <ListItemButton
                    selected={user.id === selectedId}
                    onClick={() => setSelectedId(user.id === selectedId ? '' : user.id)}
                  >
                    <ListItemText
                      primary={userLabel(user)}
                      secondary={getLabel('role', user.role) || user.role}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {selectedId && (
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" component="h2" id="admin-users-heading" sx={{ mb: 1 }}>
              Detalle del usuario
            </Typography>
            {loadingDetail && !selected ? (
              <Skeleton variant="rounded" height={80} />
            ) : selected ? (
              <Stack spacing={0.5} sx={{ mb: 2 }}>
                <Typography>
                  <strong>Nombre:</strong> {selected.firstName} {selected.lastName}
                </Typography>
                <Typography>
                  <strong>Email:</strong> {selected.email}
                </Typography>
                <Typography>
                  <strong>Usuario:</strong> {selected.username}
                </Typography>
                <Typography>
                  <strong>Rol:</strong> {getLabel('role', selected.role) || selected.role}
                </Typography>
              </Stack>
            ) : (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                No se pudo cargar el usuario.
              </Typography>
            )}

            {canManageRoles && selected && (
              <Box component="form" onSubmit={submitRole} noValidate sx={{ maxWidth: 420 }}>
                <Typography variant="subtitle1" component="h3" sx={{ mb: 1 }}>
                  Cambiar rol
                </Typography>
                <FormField
                  select
                  label="Nuevo rol"
                  required
                  value={roleForm.values.role}
                  onChange={(e) => roleForm.setField('role', e.target.value)}
                  fieldError={roleForm.errors.role}
                >
                  {roleOptions.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </FormField>
                <FormError message={roleForm.formError} />
                <SubmitButton sx={{ mt: 1 }} loading={roleForm.submitting} loadingText="Actualizando...">
                  Actualizar rol
                </SubmitButton>
              </Box>
            )}

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" component="h3" sx={{ mb: 1 }}>
                Cursos con acceso
              </Typography>
              {accesses.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  Este usuario no tiene accesos a cursos.
                </Typography>
              ) : (
                <List>
                  {accesses.map((access) => (
                    <ListItem
                      key={access.courseId}
                      secondaryAction={
                        canManageAccess ? (
                          <IconButton
                            edge="end"
                            aria-label={`Revocar acceso a ${access.course?.name ?? access.courseId}`}
                            onClick={() => handleRevoke(access)}
                            color="error"
                          >
                            <CloseIcon />
                          </IconButton>
                        ) : undefined
                      }
                    >
                      <ListItemText
                        primary={access.course?.name ?? access.courseId}
                        secondary={getLabel('accessLevel', access.accessLevel) || access.accessLevel}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            {canManageAccess && (
              <Box component="form" onSubmit={submitAccess} noValidate sx={{ maxWidth: 420 }}>
                <Typography variant="subtitle1" component="h3" sx={{ mb: 1 }}>
                  Conceder acceso a un curso
                </Typography>
                <FormField
                  select
                  label="Curso"
                  required
                  value={accessForm.values.courseId}
                  onChange={(e) => accessForm.setField('courseId', e.target.value)}
                  fieldError={accessForm.errors.courseId}
                >
                  <MenuItem value="">Seleccionar curso</MenuItem>
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.name}
                    </MenuItem>
                  ))}
                </FormField>
                <FormField
                  select
                  label="Nivel de acceso"
                  required
                  value={accessForm.values.accessLevel}
                  onChange={(e) => accessForm.setField('accessLevel', e.target.value)}
                  fieldError={accessForm.errors.accessLevel}
                  helperText="Lectura: ver · Escritura: progreso · Mantener: administrar"
                >
                  {levelOptions.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </FormField>
                <FormError message={accessForm.formError} />
                <SubmitButton sx={{ mt: 1 }} loading={accessForm.submitting} loadingText="Concediendo...">
                  Conceder acceso
                </SubmitButton>
              </Box>
            )}

            {!canManageRoles && !canManageAccess && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Tienes permiso de lectura: puedes ver usuarios pero no modificar roles ni accesos.
              </Typography>
            )}
          </Paper>
        )}
      </Stack>
      <StatusSnackbar {...snackbar} />
      {dialog}
    </RequirePerm>
  );
};
