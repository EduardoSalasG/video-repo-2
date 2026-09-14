import { useRef, useState } from 'react';
import { z } from 'zod';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import { api } from '../../../lib/api';
import { useApiResource } from '../../../hooks/useApiResource';
import { useZodForm } from '../../../hooks/useZodForm';
import { useStatusSnackbar } from '../../../hooks/useStatusSnackbar';
import { useConfirm } from '../../../hooks/useConfirm';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { RequirePerm } from '../../templates/RequirePerm';
import { Typography } from '../../atoms/Typography';
import { Button } from '../../atoms/Button';
import { SubmitButton } from '../../atoms/SubmitButton';
import { IconButton } from '../../atoms/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { FormField } from '../../molecules/FormField';
import { FormError } from '../../molecules/FormError';
import { StatusSnackbar } from '../../molecules/StatusSnackbar';
import { FileUploadField } from '../../organisms/FileUploadField';
import { PageHeader } from '../../organisms/PageHeader';
import type { Course } from '../../../types';

const courseSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
});

export const CoursesPage = () => {
  useDocumentTitle('Cursos · Administración');
  const { snackbar, showSuccess } = useStatusSnackbar();
  const { confirm, dialog } = useConfirm();
  const { data: courses, loading, error, reload, setData: setCourses } = useApiResource(
    () => api.getCourses().then((list) => [...list].sort((a, b) => a.name.localeCompare(b.name))),
    [],
    [] as Course[],
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const form = useZodForm(courseSchema, { name: '', description: '' });

  const startEdit = (course: Course) => {
    setEditingId(course.id);
    form.setValues({ name: course.name, description: course.description ?? '' });
    setImage(null);
    setImageError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.reset();
    setImage(null);
    setImageError(null);
  };

  const submit = form.handleSubmit(async (data) => {
    setImageError(null);
    setUploading(true);
    setProgress(image ? 0 : undefined);
    abortRef.current = new AbortController();
    try {
      if (editingId) {
        const updated = await api.updateCourse(
          editingId,
          data,
          image ?? undefined,
          setProgress,
          abortRef.current.signal,
        );
        setCourses((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
        showSuccess('Curso actualizado');
      } else {
        const created = await api.createCourse(
          data,
          image ?? undefined,
          setProgress,
          abortRef.current.signal,
        );
        setCourses((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        showSuccess('Curso creado');
      }
      cancelEdit();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar curso';
      form.setFormError(message);
    } finally {
      setUploading(false);
      setProgress(undefined);
      abortRef.current = null;
    }
  });

  const handleDelete = (course: Course) => {
    confirm(
      {
        title: 'Eliminar curso',
        description: (
          <>
            Se eliminará <strong>{course.name}</strong> junto con sus módulos, secciones y videos.
            Esta acción no se puede deshacer.
          </>
        ),
        confirmLabel: 'Eliminar curso',
      },
      async () => {
        await api.deleteCourse(course.id);
        setCourses((prev) => prev.filter((c) => c.id !== course.id));
        if (editingId === course.id) cancelEdit();
        showSuccess('Curso eliminado');
      },
    );
  };

  return (
    <RequirePerm permission="content.courses.manage">
      <Stack spacing={3} component="section" aria-labelledby="admin-courses-heading">
        <PageHeader
          title="Cursos"
          description="Crea y gestiona los cursos. El contenido se organiza en módulos, secciones y videos."
        />
        <Paper component="form" onSubmit={submit} noValidate sx={{ p: 2, borderRadius: 2, maxWidth: 560 }}>
          <Typography variant="h6" component="h2" id="admin-courses-heading" sx={{ mb: 1 }}>
            {editingId ? 'Editar curso' : 'Crear curso'}
          </Typography>
          <FormField
            label="Nombre"
            required
            value={form.values.name}
            onChange={(e) => form.setField('name', e.target.value)}
            fieldError={form.errors.name}
          />
          <FormField
            label="Descripción"
            value={form.values.description}
            onChange={(e) => form.setField('description', e.target.value)}
            fieldError={form.errors.description}
          />
          <FileUploadField
            label="Imagen del curso"
            accept="image/*"
            file={image}
            onChange={setImage}
            error={imageError}
            uploading={uploading}
            progress={progress}
            onCancel={uploading ? () => abortRef.current?.abort() : undefined}
            helperText="Opcional. Se muestra como portada del curso."
          />
          <FormError message={form.formError} />
          <SubmitButton
            fullWidth
            sx={{ mt: 2 }}
            loading={uploading}
            loadingText="Subiendo..."
          >
            {editingId ? 'Guardar cambios' : 'Crear curso'}
          </SubmitButton>
          {editingId && (
            <Button variant="outlined" fullWidth sx={{ mt: 1 }} onClick={cancelEdit} disabled={uploading}>
              Cancelar
            </Button>
          )}
        </Paper>

        {loading ? (
          <Stack spacing={1}>
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
          </Stack>
        ) : error ? (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              No se pudieron cargar los cursos: {error}
            </Typography>
            <Button variant="outlined" onClick={reload}>
              Reintentar
            </Button>
          </Paper>
        ) : courses.length === 0 ? (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography color="text.secondary">
              Aún no hay cursos. Crea el primero con el formulario de arriba.
            </Typography>
          </Paper>
        ) : (
          <Paper sx={{ borderRadius: 2 }}>
            <List>
              {courses.map((course) => (
                <ListItem
                  key={course.id}
                  secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        aria-label={`Editar ${course.name}`}
                        onClick={() => startEdit(course)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label={`Eliminar ${course.name}`}
                        onClick={() => handleDelete(course)}
                        color="error"
                      >
                        <CloseIcon />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={course.name}
                    secondary={course.description ?? undefined}
                    secondaryTypographyProps={{ noWrap: true }}
                    sx={{ pr: 12 }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Stack>
      <StatusSnackbar {...snackbar} />
      {dialog}
    </RequirePerm>
  );
};
