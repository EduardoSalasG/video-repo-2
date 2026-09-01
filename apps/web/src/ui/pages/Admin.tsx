import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import { Typography } from '../atoms/Typography';
import { FormField } from '../molecules/FormField';
import { UserAutocomplete } from '../molecules/UserAutocomplete';
import { Button } from '../atoms/Button';
import { api } from '../../lib/api';
import type { Course, CourseModule, Section, Role, Difficulty, PrimaryStyle, VideoType } from '../../types';

const TABS = ['cursos', 'modulos', 'secciones', 'videos', 'usuarios', 'accesos'];

const courseSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
});

const moduleSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional(),
  orderIndex: z.coerce.number().optional(),
});

const sectionSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional(),
  orderIndex: z.coerce.number().optional(),
  markdownContent: z.string().optional(),
});

const videoSchema = z.object({
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  primaryStyle: z.enum(['MAMBO_ON2', 'CASINO', 'SENSUAL_BACHATA', 'MODERN_BACHATA']),
  videoType: z.enum(['STEP', 'SEQUENCE', 'CHOREOGRAPHY']),
  durationCounts: z.coerce.number().min(1, 'La duración debe ser mayor a 0'),
  steps: z.array(z.string()).default([]),
  influences: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

const roleSchema = z.object({
  userId: z.string().min(1, 'El ID de usuario es obligatorio'),
  role: z.enum(['ADMIN', 'INSTRUCTOR', 'STUDENT']),
});

const accessSchema = z.object({
  userId: z.string().min(1, 'El ID de usuario es obligatorio'),
  courseId: z.string().min(1, 'Selecciona un curso'),
});

type CourseFormData = z.infer<typeof courseSchema>;
type ModuleFormData = z.infer<typeof moduleSchema>;
type SectionFormData = z.infer<typeof sectionSchema>;
type VideoFormData = z.infer<typeof videoSchema>;
type RoleFormData = z.infer<typeof roleSchema>;
type AccessFormData = z.infer<typeof accessSchema>;

export const Admin = () => {
  const { tab } = useParams<{ tab?: string }>();
  const activeTab = useMemo(() => {
    const index = TABS.indexOf(tab ?? 'cursos');
    return Math.max(0, index);
  }, [tab]);

  const [success, setSuccess] = useState<string | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [moduleCourse, setModuleCourse] = useState('');
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);

  const [sectionCourse, setSectionCourse] = useState('');
  const [sectionModule, setSectionModule] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);

  const [videoCourse, setVideoCourse] = useState('');
  const [videoModule, setVideoModule] = useState('');
  const [videoSection, setVideoSection] = useState('');

  const [courseForm, setCourseForm] = useState<CourseFormData>({ name: '', description: '' });
  const [courseErrors, setCourseErrors] = useState<Partial<Record<keyof CourseFormData, string>>>({});

  const [moduleForm, setModuleForm] = useState<ModuleFormData>({ title: '', description: '', orderIndex: undefined });
  const [moduleErrors, setModuleErrors] = useState<Partial<Record<keyof ModuleFormData, string>>>({});

  const [sectionForm, setSectionForm] = useState<SectionFormData>({
    title: '',
    description: '',
    orderIndex: undefined,
    markdownContent: '',
  });
  const [sectionErrors, setSectionErrors] = useState<Partial<Record<keyof SectionFormData, string>>>({});

  const [videoForm, setVideoForm] = useState<VideoFormData>({
    difficulty: 'BEGINNER',
    primaryStyle: 'MAMBO_ON2',
    videoType: 'STEP',
    durationCounts: 0,
    steps: [],
    influences: [],
    tags: [],
  });
  const [videoErrors, setVideoErrors] = useState<Partial<Record<keyof VideoFormData, string>>>({});
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [roleForm, setRoleForm] = useState<RoleFormData>({ userId: '', role: 'STUDENT' });
  const [roleErrors, setRoleErrors] = useState<Partial<Record<keyof RoleFormData, string>>>({});

  const [accessForm, setAccessForm] = useState<AccessFormData>({ userId: '', courseId: '' });
  const [accessErrors, setAccessErrors] = useState<Partial<Record<keyof AccessFormData, string>>>({});

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  useEffect(() => {
    setLoadingCourses(true);
    api
      .getCourses()
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));
  }, []);

  useEffect(() => {
    if (!moduleCourse) {
      setModules([]);
      return;
    }
    setLoadingModules(true);
    api
      .getModules(moduleCourse)
      .then(setModules)
      .catch(() => setModules([]))
      .finally(() => setLoadingModules(false));
  }, [moduleCourse]);

  useEffect(() => {
    if (!sectionCourse) {
      setModules([]);
      return;
    }
    setLoadingModules(true);
    api
      .getModules(sectionCourse)
      .then(setModules)
      .catch(() => setModules([]))
      .finally(() => setLoadingModules(false));
  }, [sectionCourse]);

  useEffect(() => {
    if (!sectionModule) {
      setSections([]);
      return;
    }
    setLoadingSections(true);
    api
      .getSections(sectionModule)
      .then(setSections)
      .catch(() => setSections([]))
      .finally(() => setLoadingSections(false));
  }, [sectionModule]);

  useEffect(() => {
    if (!videoCourse) {
      setModules([]);
      return;
    }
    setLoadingModules(true);
    api
      .getModules(videoCourse)
      .then(setModules)
      .catch(() => setModules([]))
      .finally(() => setLoadingModules(false));
  }, [videoCourse]);

  useEffect(() => {
    if (!videoModule) {
      setSections([]);
      return;
    }
    setLoadingSections(true);
    api
      .getSections(videoModule)
      .then(setSections)
      .catch(() => setSections([]))
      .finally(() => setLoadingSections(false));
  }, [videoModule]);

  const submitCourse = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = courseSchema.safeParse(courseForm);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setCourseErrors({
        name: fieldErrors.name?.[0],
        description: fieldErrors.description?.[0],
      });
      return;
    }
    setCourseErrors({});
    api
      .createCourse(result.data)
      .then((newCourse) => {
        setCourses((prev) => [...prev, newCourse]);
        setCourseForm({ name: '', description: '' });
        showSuccess('Curso creado');
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al crear curso';
        setCourseErrors({ name: message });
      });
  };

  const submitModule = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!moduleCourse) {
      setModuleErrors({ ...moduleErrors, title: 'Selecciona un curso' });
      return;
    }
    const result = moduleSchema.safeParse(moduleForm);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setModuleErrors({
        title: fieldErrors.title?.[0],
        description: fieldErrors.description?.[0],
        orderIndex: fieldErrors.orderIndex?.[0],
      });
      return;
    }
    setModuleErrors({});
    api
      .createModule(moduleCourse, result.data)
      .then((newModule) => {
        setModules((prev) => [...prev, newModule]);
        setModuleForm({ title: '', description: '', orderIndex: undefined });
        showSuccess('Módulo creado');
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al crear módulo';
        setModuleErrors({ title: message });
      });
  };

  const submitSection = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sectionModule) {
      setSectionErrors({ ...sectionErrors, title: 'Selecciona un módulo' });
      return;
    }
    const result = sectionSchema.safeParse(sectionForm);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setSectionErrors({
        title: fieldErrors.title?.[0],
        description: fieldErrors.description?.[0],
        orderIndex: fieldErrors.orderIndex?.[0],
        markdownContent: fieldErrors.markdownContent?.[0],
      });
      return;
    }
    setSectionErrors({});
    api
      .createSection(sectionModule, result.data)
      .then((newSection) => {
        setSections((prev) => [...prev, newSection]);
        setSectionForm({ title: '', description: '', orderIndex: undefined, markdownContent: '' });
        showSuccess('Sección creada');
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al crear sección';
        setSectionErrors({ title: message });
      });
  };

  const submitVideo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!videoSection) {
      setVideoErrors({ ...videoErrors, difficulty: 'Selecciona una sección' });
      return;
    }
    const result = videoSchema.safeParse(videoForm);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setVideoErrors({
        difficulty: fieldErrors.difficulty?.[0],
        primaryStyle: fieldErrors.primaryStyle?.[0],
        videoType: fieldErrors.videoType?.[0],
        durationCounts: fieldErrors.durationCounts?.[0],
      });
      return;
    }
    if (!videoFile) {
      setVideoErrors({ ...videoErrors, difficulty: 'Selecciona un archivo de video' });
      return;
    }

    api
      .uploadVideo(videoSection, videoFile, {
        difficulty: result.data.difficulty as Difficulty,
        primaryStyle: result.data.primaryStyle as PrimaryStyle,
        videoType: result.data.videoType as VideoType,
        durationCounts: result.data.durationCounts,
        steps: result.data.steps,
        influences: result.data.influences,
        tags: result.data.tags,
      })
      .then(() => {
        setVideoFile(null);
        setVideoForm({
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          videoType: 'STEP',
          durationCounts: 0,
          steps: [],
          influences: [],
          tags: [],
        });
        setVideoSection('');
        showSuccess('Video subido');
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al subir video';
        setVideoErrors({ difficulty: message });
      });
  };

  const submitRole = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = roleSchema.safeParse(roleForm);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setRoleErrors({
        userId: fieldErrors.userId?.[0],
        role: fieldErrors.role?.[0],
      });
      return;
    }
    setRoleErrors({});
    api
      .updateUserRole(result.data.userId, result.data.role as Role)
      .then(() => {
        setRoleForm({ userId: '', role: 'STUDENT' });
        showSuccess('Rol actualizado');
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al actualizar rol';
        setRoleErrors({ userId: message });
      });
  };

  const submitAccess = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = accessSchema.safeParse(accessForm);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setAccessErrors({
        userId: fieldErrors.userId?.[0],
        courseId: fieldErrors.courseId?.[0],
      });
      return;
    }
    setAccessErrors({});
    api
      .grantAccess(result.data.courseId, {
        userId: result.data.userId,
        courseId: result.data.courseId,
      })
      .then(() => {
        setAccessForm({ userId: '', courseId: '' });
        showSuccess('Acceso concedido');
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al conceder acceso';
        setAccessErrors({ courseId: message });
      });
  };

  const handleDeleteCourse = (courseId: string) => {
    api
      .deleteCourse(courseId)
      .then(() => {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
        showSuccess('Curso eliminado');
      })
      .catch(() => showSuccess('Error al eliminar curso'));
  };

  const handleDeleteModule = (moduleId: string) => {
    api
      .deleteModule(moduleId)
      .then(() => {
        setModules((prev) => prev.filter((m) => m.id !== moduleId));
        showSuccess('Módulo eliminado');
      })
      .catch(() => showSuccess('Error al eliminar módulo'));
  };

  const handleDeleteSection = (sectionId: string) => {
    api
      .deleteSection(sectionId)
      .then(() => {
        setSections((prev) => prev.filter((s) => s.id !== sectionId));
        showSuccess('Sección eliminada');
      })
      .catch(() => showSuccess('Error al eliminar sección'));
  };

  const renderCourseSelect = (value: string, onChange: (value: string) => void) => (
    <FormField
      select
      label="Curso"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <MenuItem value="">Seleccionar curso</MenuItem>
      {courses.map((course) => (
        <MenuItem key={course.id} value={course.id}>
          {course.name}
        </MenuItem>
      ))}
    </FormField>
  );

  const renderModuleSelect = (value: string, onChange: (value: string) => void) => (
    <FormField
      select
      label="Módulo"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <MenuItem value="">Seleccionar módulo</MenuItem>
      {modules.map((module) => (
        <MenuItem key={module.id} value={module.id}>
          {module.title}
        </MenuItem>
      ))}
    </FormField>
  );

  const renderSectionSelect = (value: string, onChange: (value: string) => void) => (
    <FormField
      select
      label="Sección"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <MenuItem value="">Seleccionar sección</MenuItem>
      {sections.map((section) => (
        <MenuItem key={section.id} value={section.id}>
          {section.title}
        </MenuItem>
      ))}
    </FormField>
  );

  return (
    <Box>
      {success && (
        <Typography color="success.main" sx={{ mt: 2 }}>
          {success}
        </Typography>
      )}

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Cursos
            </Typography>
            <Box component="form" onSubmit={submitCourse} noValidate>
              <FormField
                label="Nombre"
                value={courseForm.name}
                onChange={(event) => setCourseForm((f) => ({ ...f, name: event.target.value }))}
                fieldError={courseErrors.name}
              />
              <FormField
                label="Descripción"
                value={courseForm.description}
                onChange={(event) => setCourseForm((f) => ({ ...f, description: event.target.value }))}
                fieldError={courseErrors.description}
              />
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                Crear curso
              </Button>
            </Box>
            {loadingCourses ? (
              <Typography color="text.secondary">Cargando cursos...</Typography>
            ) : (
              <List>
                {courses.map((course) => (
                  <ListItem
                    key={course.id}
                    secondaryAction={
                      <Button color="error" onClick={() => handleDeleteCourse(course.id)}>
                        Eliminar
                      </Button>
                    }
                  >
                    <ListItemText primary={course.name} secondary={course.description ?? ''} />
                  </ListItem>
                ))}
              </List>
            )}
          </Stack>
        )}

        {activeTab === 1 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Módulos
            </Typography>
            {renderCourseSelect(moduleCourse, setModuleCourse)}
            <Box component="form" onSubmit={submitModule} noValidate>
              <FormField
                label="Título"
                value={moduleForm.title}
                onChange={(event) => setModuleForm((f) => ({ ...f, title: event.target.value }))}
                fieldError={moduleErrors.title}
              />
              <FormField
                label="Descripción"
                value={moduleForm.description}
                onChange={(event) => setModuleForm((f) => ({ ...f, description: event.target.value }))}
                fieldError={moduleErrors.description}
              />
              <FormField
                label="Orden"
                type="number"
                value={moduleForm.orderIndex ?? ''}
                onChange={(event) =>
                  setModuleForm((f) => ({
                    ...f,
                    orderIndex: event.target.value ? Number(event.target.value) : undefined,
                  }))
                }
                fieldError={moduleErrors.orderIndex}
              />
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                Crear módulo
              </Button>
            </Box>
            {loadingModules ? (
              <Typography color="text.secondary">Cargando módulos...</Typography>
            ) : (
              <List>
                {modules.map((module) => (
                  <ListItem
                    key={module.id}
                    secondaryAction={
                      <Button color="error" onClick={() => handleDeleteModule(module.id)}>
                        Eliminar
                      </Button>
                    }
                  >
                    <ListItemText primary={module.title} />
                  </ListItem>
                ))}
              </List>
            )}
          </Stack>
        )}

        {activeTab === 2 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Secciones
            </Typography>
            {renderCourseSelect(sectionCourse, setSectionCourse)}
            {renderModuleSelect(sectionModule, setSectionModule)}
            <Box component="form" onSubmit={submitSection} noValidate>
              <FormField
                label="Título"
                value={sectionForm.title}
                onChange={(event) => setSectionForm((f) => ({ ...f, title: event.target.value }))}
                fieldError={sectionErrors.title}
              />
              <FormField
                label="Descripción"
                value={sectionForm.description}
                onChange={(event) => setSectionForm((f) => ({ ...f, description: event.target.value }))}
                fieldError={sectionErrors.description}
              />
              <FormField
                label="Orden"
                type="number"
                value={sectionForm.orderIndex ?? ''}
                onChange={(event) =>
                  setSectionForm((f) => ({
                    ...f,
                    orderIndex: event.target.value ? Number(event.target.value) : undefined,
                  }))
                }
                fieldError={sectionErrors.orderIndex}
              />
              <FormField
                label="Contenido markdown"
                multiline
                rows={4}
                value={sectionForm.markdownContent}
                onChange={(event) =>
                  setSectionForm((f) => ({ ...f, markdownContent: event.target.value }))
                }
                fieldError={sectionErrors.markdownContent}
              />
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                Crear sección
              </Button>
            </Box>
            {loadingSections ? (
              <Typography color="text.secondary">Cargando secciones...</Typography>
            ) : (
              <List>
                {sections.map((section) => (
                  <ListItem
                    key={section.id}
                    secondaryAction={
                      <Button color="error" onClick={() => handleDeleteSection(section.id)}>
                        Eliminar
                      </Button>
                    }
                  >
                    <ListItemText primary={section.title} />
                  </ListItem>
                ))}
              </List>
            )}
          </Stack>
        )}

        {activeTab === 3 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Subir video
            </Typography>
            {renderCourseSelect(videoCourse, setVideoCourse)}
            {renderModuleSelect(videoModule, setVideoModule)}
            {renderSectionSelect(videoSection, setVideoSection)}
            <Box component="form" onSubmit={submitVideo} noValidate>
              <FormField
                select
                label="Dificultad"
                value={videoForm.difficulty}
                onChange={(event) =>
                  setVideoForm((f) => ({ ...f, difficulty: event.target.value as Difficulty }))
                }
                fieldError={videoErrors.difficulty}
              >
                <MenuItem value="BEGINNER">Principiante</MenuItem>
                <MenuItem value="INTERMEDIATE">Intermedio</MenuItem>
                <MenuItem value="ADVANCED">Avanzado</MenuItem>
              </FormField>
              <FormField
                select
                label="Estilo principal"
                value={videoForm.primaryStyle}
                onChange={(event) =>
                  setVideoForm((f) => ({ ...f, primaryStyle: event.target.value as PrimaryStyle }))
                }
                fieldError={videoErrors.primaryStyle}
              >
                <MenuItem value="MAMBO_ON2">Mambo On2</MenuItem>
                <MenuItem value="CASINO">Casino</MenuItem>
                <MenuItem value="SENSUAL_BACHATA">Bachata Sensual</MenuItem>
                <MenuItem value="MODERN_BACHATA">Bachata Moderna</MenuItem>
              </FormField>
              <FormField
                select
                label="Tipo de video"
                value={videoForm.videoType}
                onChange={(event) =>
                  setVideoForm((f) => ({ ...f, videoType: event.target.value as VideoType }))
                }
                fieldError={videoErrors.videoType}
              >
                <MenuItem value="STEP">Paso</MenuItem>
                <MenuItem value="SEQUENCE">Secuencia</MenuItem>
                <MenuItem value="CHOREOGRAPHY">Coreografía</MenuItem>
              </FormField>
              <FormField
                label="Duración (counts)"
                type="number"
                value={String(videoForm.durationCounts)}
                onChange={(event) =>
                  setVideoForm((f) => ({
                    ...f,
                    durationCounts: event.target.value ? Number(event.target.value) : 0,
                  }))
                }
                fieldError={videoErrors.durationCounts}
              />
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={videoForm.steps}
                onChange={(_event, value) => setVideoForm((f) => ({ ...f, steps: value as string[] }))}
                filterSelectedOptions
                renderInput={(params) => <TextField {...params} label="Pasos" placeholder="Escribe y presiona Enter" />}
              />
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={videoForm.influences}
                onChange={(_event, value) => setVideoForm((f) => ({ ...f, influences: value as string[] }))}
                filterSelectedOptions
                renderInput={(params) => <TextField {...params} label="Influencias" placeholder="Escribe y presiona Enter" />}
              />
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={videoForm.tags}
                onChange={(_event, value) => setVideoForm((f) => ({ ...f, tags: value as string[] }))}
                filterSelectedOptions
                renderInput={(params) => <TextField {...params} label="Tags" placeholder="Escribe y presiona Enter" />}
              />
              <Box sx={{ my: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Archivo de video
                </Typography>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
                />
              </Box>
              {videoErrors.difficulty && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {videoErrors.difficulty}
                </Typography>
              )}
              <Button type="submit" variant="contained" fullWidth>
                Subir video
              </Button>
            </Box>
          </Stack>
        )}

        {activeTab === 4 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Cambiar rol
            </Typography>
            <Box component="form" onSubmit={submitRole} noValidate>
              <UserAutocomplete
                value={roleForm.userId}
                onChange={(userId) => setRoleForm((f) => ({ ...f, userId }))}
                label="Buscar usuario"
                error={roleErrors.userId}
              />
              <FormField
                select
                label="Nuevo rol"
                value={roleForm.role}
                onChange={(event) =>
                  setRoleForm((f) => ({ ...f, role: event.target.value as Role }))
                }
                fieldError={roleErrors.role}
              >
                <MenuItem value="STUDENT">Estudiante</MenuItem>
                <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </FormField>
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                Actualizar rol
              </Button>
            </Box>
          </Stack>
        )}

        {activeTab === 5 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Conceder acceso
            </Typography>
            <Box component="form" onSubmit={submitAccess} noValidate>
              <UserAutocomplete
                value={accessForm.userId}
                onChange={(userId) => setAccessForm((f) => ({ ...f, userId }))}
                label="Buscar usuario"
                error={accessErrors.userId}
              />
              {renderCourseSelect(accessForm.courseId, (value) =>
                setAccessForm((f) => ({ ...f, courseId: value }))
              )}
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                Conceder acceso
              </Button>
            </Box>
          </Stack>
        )}
      </Box>
    </Box>
  );
};
