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
import { useCourseModules, useModuleSections } from '../../../hooks/useCascadeSelects';
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
import type { Course, Section } from '../../../types';

const sectionSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional(),
  orderIndex: z.coerce.number().int().optional(),
  markdownContent: z.string().optional(),
});

export const SectionsPage = () => {
  useDocumentTitle('Secciones · Administración');
  const { snackbar, showSuccess } = useStatusSnackbar();
  const { confirm, dialog } = useConfirm();
  const { data: courses, loading: loadingCourses } = useApiResource(() => api.getCourses(), [], [] as Course[]);
  const [courseId, setCourseId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const { modules, loading: loadingModules } = useCourseModules(courseId);
  const { sections, setSections, loading: loadingSections, error: sectionsError } = useModuleSections(moduleId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [parentError, setParentError] = useState<string | null>(null);

  const form = useZodForm(sectionSchema, {
    title: '',
    description: '',
    orderIndex: undefined as number | undefined,
    markdownContent: '',
  });

  const selectedCourse = courses.find((c) => c.id === courseId);
  const selectedModule = modules.find((m) => m.id === moduleId);

  const startEdit = (section: Section) => {
    setEditingId(section.id);
    form.setValues({
      title: section.title,
      description: section.description ?? '',
      orderIndex: section.orderIndex,
      markdownContent: section.markdownContent ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.reset();
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!moduleId) {
      event.preventDefault();
      setParentError('Selecciona un módulo');
      return;
    }
    setParentError(null);
    form.handleSubmit(async (data) => {
      try {
        if (editingId) {
          const updated = await api.updateSection(editingId, data);
          setSections((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
          showSuccess('Sección actualizada');
        } else {
          const created = await api.createSection(moduleId, data);
          setSections((prev) => [...prev, created].sort((a, b) => a.title.localeCompare(b.title)));
          showSuccess('Sección creada');
        }
        cancelEdit();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al guardar sección';
        form.setFormError(message);
      }
    })(event);
  };

  const handleDelete = (section: Section) => {
    confirm(
      {
        title: 'Eliminar sección',
        description: (
          <>
            Se eliminará <strong>{section.title}</strong> junto con su video asociado.
            Esta acción no se puede deshacer.
          </>
        ),
        confirmLabel: 'Eliminar sección',
      },
      async () => {
        await api.deleteSection(section.id);
        setSections((prev) => prev.filter((s) => s.id !== section.id));
        if (editingId === section.id) cancelEdit();
        showSuccess('Sección eliminada');
      },
    );
  };

  return (
    <RequirePerm permission="content.courses.manage">
      <Stack spacing={3} component="section" aria-labelledby="admin-sections-heading">
        <PageHeader
          title="Secciones"
          description="Elige un curso y un módulo para gestionar sus secciones."
          crumbs={[
            { label: 'Contenido' },
            { label: 'Secciones' },
            ...(selectedCourse ? [{ label: selectedCourse.name }] : []),
            ...(selectedModule ? [{ label: selectedModule.title }] : []),
          ]}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <EntitySelect
            label="Curso"
            value={courseId}
            onChange={(value) => {
              setCourseId(value);
              setModuleId('');
              cancelEdit();
            }}
            items={courses.map((c) => ({ id: c.id, name: c.name }))}
            loading={loadingCourses}
          />
          <EntitySelect
            label="Módulo"
            value={moduleId}
            onChange={(value) => {
              setModuleId(value);
              setParentError(null);
              cancelEdit();
            }}
            items={modules.map((m) => ({ id: m.id, name: m.title }))}
            loading={loadingModules}
            disabled={!courseId}
            fieldError={parentError ?? undefined}
          />
        </Stack>

        {moduleId && (
          <>
            <Paper component="form" onSubmit={submit} noValidate sx={{ p: 2, borderRadius: 2, maxWidth: 560 }}>
              <Typography variant="h6" component="h2" id="admin-sections-heading" sx={{ mb: 1 }}>
                {editingId ? 'Editar sección' : `Nueva sección en ${selectedModule?.title ?? 'este módulo'}`}
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
              <FormField
                label="Contenido markdown"
                multiline
                rows={4}
                value={form.values.markdownContent}
                onChange={(e) => form.setField('markdownContent', e.target.value)}
                fieldError={form.errors.markdownContent}
              />
              <FormError message={form.formError} />
              <SubmitButton fullWidth sx={{ mt: 2 }} loading={form.submitting}>
                {editingId ? 'Guardar cambios' : 'Crear sección'}
              </SubmitButton>
              {editingId && (
                <Button variant="outlined" fullWidth sx={{ mt: 1 }} onClick={cancelEdit}>
                  Cancelar
                </Button>
              )}
            </Paper>

            {loadingSections ? (
              <Stack spacing={1}>
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
              </Stack>
            ) : sectionsError ? (
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography color="error" variant="body2">
                  No se pudieron cargar las secciones: {sectionsError}
                </Typography>
              </Paper>
            ) : sections.length === 0 ? (
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography color="text.secondary">
                  Este módulo aún no tiene secciones. Crea la primera con el formulario.
                </Typography>
              </Paper>
            ) : (
              <Paper sx={{ borderRadius: 2 }}>
                <List>
                  {sections.map((section) => (
                    <ListItem
                      key={section.id}
                      secondaryAction={
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            aria-label={`Editar ${section.title}`}
                            onClick={() => startEdit(section)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            aria-label={`Eliminar ${section.title}`}
                            onClick={() => handleDelete(section)}
                            color="error"
                          >
                            <CloseIcon />
                          </IconButton>
                        </Stack>
                      }
                    >
                      <ListItemText
                        primary={section.title}
                        secondary={section.videoFileId ? 'Tiene video asociado' : 'Sin video'}
                        sx={{ pr: 12 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </>
        )}

        {!moduleId && !loadingModules && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography color="text.secondary">
              Selecciona un curso y un módulo para ver y gestionar sus secciones.
            </Typography>
          </Paper>
        )}
      </Stack>
      <StatusSnackbar {...snackbar} />
      {dialog}
    </RequirePerm>
  );
};
