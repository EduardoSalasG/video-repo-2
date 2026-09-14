import { useState } from 'react';
import { z } from 'zod';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { api } from '../../../lib/api';
import { useApiResource } from '../../../hooks/useApiResource';
import { useCourseModules } from '../../../hooks/useCascadeSelects';
import { useZodForm } from '../../../hooks/useZodForm';
import { useStatusSnackbar } from '../../../hooks/useStatusSnackbar';
import { useConfirm } from '../../../hooks/useConfirm';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { RequirePerm } from '../../templates/RequirePerm';
import { Typography } from '../../atoms/Typography';
import { Button } from '../../atoms/Button';
import { SubmitButton } from '../../atoms/SubmitButton';
import { IconButton } from '../../atoms/IconButton';
import { FormField } from '../../molecules/FormField';
import { FormError } from '../../molecules/FormError';
import { StatusSnackbar } from '../../molecules/StatusSnackbar';
import { EntitySelect } from '../../organisms/EntitySelect';
import { PageHeader } from './PageHeader';
import type { Course, CourseModule } from '../../../types';

const moduleSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional(),
  orderIndex: z.coerce.number().int().optional(),
});

export const ModulesPage = () => {
  useDocumentTitle('Módulos · Administración');
  const { snackbar, showSuccess } = useStatusSnackbar();
  const { confirm, dialog } = useConfirm();
  const { data: courses, loading: loadingCourses } = useApiResource(() => api.getCourses(), [], [] as Course[]);
  const [courseId, setCourseId] = useState('');
  const { modules, setModules, loading: loadingModules, error: modulesError } = useCourseModules(courseId);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useZodForm(moduleSchema, { title: '', description: '', orderIndex: undefined as number | undefined });
  const [courseError, setCourseError] = useState<string | null>(null);

  const selectedCourse = courses.find((c) => c.id === courseId);

  const startEdit = (module: CourseModule) => {
    setEditingId(module.id);
    form.setValues({
      title: module.title,
      description: module.description ?? '',
      orderIndex: module.orderIndex,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.reset();
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!courseId) {
      event.preventDefault();
      setCourseError('Selecciona un curso');
      return;
    }
    setCourseError(null);
    form.handleSubmit(async (data) => {
      try {
        if (editingId) {
          const updated = await api.updateModule(editingId, data);
          setModules((prev) => prev.map((m) => (m.id === editingId ? updated : m)));
          showSuccess('Módulo actualizado');
        } else {
          const created = await api.createModule(courseId, data);
          setModules((prev) => [...prev, created].sort((a, b) => a.title.localeCompare(b.title)));
          showSuccess('Módulo creado');
        }
        cancelEdit();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al guardar módulo';
        form.setFormError(message);
      }
    })(event);
  };

  const handleDelete = (module: CourseModule) => {
    confirm(
      {
        title: 'Eliminar módulo',
        description: (
          <>
            Se eliminará <strong>{module.title}</strong> junto con sus secciones y videos.
            Esta acción no se puede deshacer.
          </>
        ),
        confirmLabel: 'Eliminar módulo',
      },
      async () => {
        await api.deleteModule(module.id);
        setModules((prev) => prev.filter((m) => m.id !== module.id));
        if (editingId === module.id) cancelEdit();
        showSuccess('Módulo eliminado');
      },
    );
  };

  return (
    <RequirePerm permission="content.courses.manage">
      <Stack spacing={3} component="section" aria-labelledby="admin-modules-heading">
        <PageHeader
          title="Módulos"
          description="Elige un curso para gestionar sus módulos."
          crumbs={[
            { label: 'Contenido' },
            { label: 'Módulos' },
            ...(selectedCourse ? [{ label: selectedCourse.name }] : []),
          ]}
        />
        <EntitySelect
          label="Curso"
          value={courseId}
          onChange={(value) => {
            setCourseId(value);
            setCourseError(null);
            cancelEdit();
          }}
          items={courses.map((c) => ({ id: c.id, name: c.name }))}
          loading={loadingCourses}
          fieldError={courseError ?? undefined}
        />

        {courseId && (
          <>
            <Paper component="form" onSubmit={submit} noValidate sx={{ p: 2, borderRadius: 2, maxWidth: 560 }}>
              <Typography variant="h6" component="h2" id="admin-modules-heading" sx={{ mb: 1 }}>
                {editingId ? 'Editar módulo' : `Nuevo módulo en ${selectedCourse?.name ?? 'este curso'}`}
              </Typography>
              <FormField
                label="Título"
                required
                value={form.values.title}
                onChange={(e) => form.setField('title', e.target.value)}
                fieldError={form.errors.title}
              />
              <FormField
                label="Descripción"
                value={form.values.description}
                onChange={(e) => form.setField('description', e.target.value)}
                fieldError={form.errors.description}
              />
              <FormField
                label="Orden"
                type="number"
                value={form.values.orderIndex ?? ''}
                onChange={(e) =>
                  form.setField('orderIndex', e.target.value ? Number(e.target.value) : undefined)
                }
                fieldError={form.errors.orderIndex}
              />
              <FormError message={form.formError} />
              <SubmitButton fullWidth sx={{ mt: 2 }} loading={form.submitting}>
                {editingId ? 'Guardar cambios' : 'Crear módulo'}
              </SubmitButton>
              {editingId && (
                <Button variant="outlined" fullWidth sx={{ mt: 1 }} onClick={cancelEdit}>
                  Cancelar
                </Button>
              )}
            </Paper>

            {loadingModules ? (
              <Stack spacing={1}>
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
              </Stack>
            ) : modulesError ? (
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography color="error" variant="body2">
                  No se pudieron cargar los módulos: {modulesError}
                </Typography>
              </Paper>
            ) : modules.length === 0 ? (
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography color="text.secondary">
                  Este curso aún no tiene módulos. Crea el primero con el formulario.
                </Typography>
              </Paper>
            ) : (
              <Paper sx={{ borderRadius: 2 }}>
                <List>
                  {modules.map((module) => (
                    <ListItem
                      key={module.id}
                      secondaryAction={
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            aria-label={`Editar ${module.title}`}
                            onClick={() => startEdit(module)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            aria-label={`Eliminar ${module.title}`}
                            onClick={() => handleDelete(module)}
                            color="error"
                          >
                            <CloseIcon />
                          </IconButton>
                        </Stack>
                      }
                    >
                      <ListItemText
                        primary={module.title}
                        secondary={module.description ?? undefined}
                        secondaryTypographyProps={{ noWrap: true }}
                        sx={{ pr: 12 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </>
        )}

        {!courseId && !loadingCourses && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography color="text.secondary">
              Selecciona un curso para ver y gestionar sus módulos.
            </Typography>
          </Paper>
        )}
      </Stack>
      <StatusSnackbar {...snackbar} />
      {dialog}
    </RequirePerm>
  );
};
