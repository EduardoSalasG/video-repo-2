import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import { Typography } from '../atoms/Typography';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { SectionForm } from '../organisms/SectionForm';
import { MOCK_COURSES, MOCK_USERS, MOCK_ACCESSES } from '../../data/mock';
import type { Course, Section, User, Access, VideoMetadata } from '../../types';

const TABS = ['cursos', 'modulos', 'secciones', 'metadatos', 'usuarios', 'accesos'];

const courseSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
});

const moduleSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  courseId: z.string().min(1, 'Selecciona un curso'),
});

const metadataSchema = z.object({
  sectionId: z.string().min(1, 'El ID de sección es obligatorio'),
  fileSize: z.coerce.number().min(1, 'El tamaño debe ser mayor a 0'),
  mimeType: z.string().min(1, 'El tipo MIME es obligatorio'),
  resolution: z.string().min(1, 'La resolución es obligatoria'),
  duration: z.coerce.number().min(1, 'La duración debe ser mayor a 0'),
});

const userSchema = z.object({
  email: z.string().email('Email no válido'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  role: z.enum(['student', 'admin']),
});

const accessSchema = z.object({
  userId: z.string().min(1, 'Selecciona un usuario'),
  courseId: z.string().min(1, 'Selecciona un curso'),
});

type MetadataFormData = z.infer<typeof metadataSchema>;
type UserFormData = z.infer<typeof userSchema>;
type AccessFormData = z.infer<typeof accessSchema>;

export const Admin = () => {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  const activeTab = useMemo(() => {
    const index = TABS.indexOf(tab ?? 'cursos');
    return Math.max(0, index);
  }, [tab]);

  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [modules, setModules] = useState<{ id: string; title: string; courseId: string }[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [metadataList, setMetadataList] = useState<VideoMetadata[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [accesses, setAccesses] = useState<Access[]>(MOCK_ACCESSES);

  const [courseForm, setCourseForm] = useState({ title: '', description: '' });
  const [courseErrors, setCourseErrors] = useState<Partial<Record<'title' | 'description', string>>>({});

  const [moduleForm, setModuleForm] = useState({ title: '', courseId: '' });
  const [moduleErrors, setModuleErrors] = useState<Partial<Record<'title' | 'courseId', string>>>({});

  const [metadataForm, setMetadataForm] = useState({
    sectionId: '',
    fileSize: '',
    mimeType: 'video/mp4',
    resolution: '1920x1080',
    duration: '',
  });
  const [metadataErrors, setMetadataErrors] = useState<Partial<Record<keyof MetadataFormData, string>>>({});

  const [userForm, setUserForm] = useState<UserFormData>({ email: '', name: '', role: 'student' });
  const [userErrors, setUserErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  const [accessForm, setAccessForm] = useState({ userId: '', courseId: '' });
  const [accessErrors, setAccessErrors] = useState<Partial<Record<keyof AccessFormData, string>>>({});

  const handleTabChange = (_: unknown, newValue: number) => {
    navigate(`/admin/${TABS[newValue]}`);
  };

  const submitCourse = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = courseSchema.safeParse(courseForm);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setCourseErrors({
        title: fieldErrors.title?.[0],
        description: fieldErrors.description?.[0],
      });
      return;
    }
    setCourseErrors({});
    const newCourse: Course = {
      id: crypto.randomUUID(),
      ...result.data,
      thumbnail: '/icon.svg',
      modules: [],
    };
    setCourses((prev) => [...prev, newCourse]);
    setCourseForm({ title: '', description: '' });
  };

  const submitModule = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = moduleSchema.safeParse(moduleForm);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setModuleErrors({
        title: fieldErrors.title?.[0],
        courseId: fieldErrors.courseId?.[0],
      });
      return;
    }
    setModuleErrors({});
    setModules((prev) => [...prev, { id: crypto.randomUUID(), ...result.data }]);
    setModuleForm({ title: '', courseId: '' });
  };

  const submitMetadata = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = metadataSchema.safeParse({
      ...metadataForm,
      fileSize: Number(metadataForm.fileSize),
      duration: Number(metadataForm.duration),
    });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setMetadataErrors({
        sectionId: fieldErrors.sectionId?.[0],
        fileSize: fieldErrors.fileSize?.[0],
        mimeType: fieldErrors.mimeType?.[0],
        resolution: fieldErrors.resolution?.[0],
        duration: fieldErrors.duration?.[0],
      });
      return;
    }
    setMetadataErrors({});
    setMetadataList((prev) => [...prev, { ...result.data }]);
    setMetadataForm({
      sectionId: '',
      fileSize: '',
      mimeType: 'video/mp4',
      resolution: '1920x1080',
      duration: '',
    });
  };

  const submitUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = userSchema.safeParse(userForm);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setUserErrors({
        email: fieldErrors.email?.[0],
        name: fieldErrors.name?.[0],
        role: fieldErrors.role?.[0],
      });
      return;
    }
    setUserErrors({});
    setUsers((prev) => [...prev, { id: crypto.randomUUID(), ...result.data }]);
    setUserForm({ email: '', name: '', role: 'student' });
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
    const newAccess: Access = {
      id: crypto.randomUUID(),
      ...result.data,
      grantedAt: new Date().toISOString(),
    };
    setAccesses((prev) => [...prev, newAccess]);
    setAccessForm({ userId: '', courseId: '' });
  };

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Pestañas de administración"
      >
        {TABS.map((t) => (
          <Tab key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} />
        ))}
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Cursos
            </Typography>
            <Box component="form" onSubmit={submitCourse} noValidate>
              <FormField
                label="Título"
                value={courseForm.title}
                onChange={(e) => setCourseForm((f) => ({ ...f, title: e.target.value }))}
                fieldError={courseErrors.title}
              />
              <FormField
                label="Descripción"
                value={courseForm.description}
                onChange={(e) =>
                  setCourseForm((f) => ({ ...f, description: e.target.value }))
                }
                fieldError={courseErrors.description}
              />
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                Crear curso
              </Button>
            </Box>
            <List>
              {courses.map((c) => (
                <ListItem key={c.id}>
                  <ListItemText primary={c.title} secondary={c.description} />
                </ListItem>
              ))}
            </List>
          </Stack>
        )}

        {activeTab === 1 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Módulos
            </Typography>
            <Box component="form" onSubmit={submitModule} noValidate>
              <FormField
                label="Título del módulo"
                value={moduleForm.title}
                onChange={(e) => setModuleForm((f) => ({ ...f, title: e.target.value }))}
                fieldError={moduleErrors.title}
              />
              <FormField
                label="Curso"
                select
                value={moduleForm.courseId}
                onChange={(e) =>
                  setModuleForm((f) => ({ ...f, courseId: e.target.value }))
                }
                fieldError={moduleErrors.courseId}
              >
                {courses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.title}
                  </MenuItem>
                ))}
              </FormField>
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                Crear módulo
              </Button>
            </Box>
            <List>
              {modules.map((m) => (
                <ListItem key={m.id}>
                  <ListItemText primary={m.title} secondary={`Curso: ${m.courseId}`} />
                </ListItem>
              ))}
            </List>
          </Stack>
        )}

        {activeTab === 2 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Secciones
            </Typography>
            <SectionForm
              onSave={(data) => {
                setSections((prev) => [...prev, { id: crypto.randomUUID(), ...data }]);
              }}
            />
            <List>
              {sections.map((s) => (
                <ListItem key={s.id}>
                  <ListItemText primary={s.title} />
                </ListItem>
              ))}
            </List>
          </Stack>
        )}

        {activeTab === 3 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Metadatos de video
            </Typography>
            <Box component="form" onSubmit={submitMetadata} noValidate>
              <FormField
                label="ID de sección"
                value={metadataForm.sectionId}
                onChange={(e) =>
                  setMetadataForm((f) => ({ ...f, sectionId: e.target.value }))
                }
                fieldError={metadataErrors.sectionId}
              />
              <FormField
                label="Tamaño (bytes)"
                type="number"
                value={metadataForm.fileSize}
                onChange={(e) =>
                  setMetadataForm((f) => ({ ...f, fileSize: e.target.value }))
                }
                fieldError={metadataErrors.fileSize}
              />
              <FormField
                label="MIME type"
                value={metadataForm.mimeType}
                onChange={(e) =>
                  setMetadataForm((f) => ({ ...f, mimeType: e.target.value }))
                }
                fieldError={metadataErrors.mimeType}
              />
              <FormField
                label="Resolución"
                value={metadataForm.resolution}
                onChange={(e) =>
                  setMetadataForm((f) => ({ ...f, resolution: e.target.value }))
                }
                fieldError={metadataErrors.resolution}
              />
              <FormField
                label="Duración (s)"
                type="number"
                value={metadataForm.duration}
                onChange={(e) =>
                  setMetadataForm((f) => ({ ...f, duration: e.target.value }))
                }
                fieldError={metadataErrors.duration}
              />
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                Guardar metadatos
              </Button>
            </Box>
            <List>
              {metadataList.map((m) => (
                <ListItem key={m.sectionId}>
                  <ListItemText
                    primary={m.sectionId}
                    secondary={`${m.resolution} | ${m.mimeType} | ${m.duration}s`}
                  />
                </ListItem>
              ))}
            </List>
          </Stack>
        )}

        {activeTab === 4 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Usuarios
            </Typography>
            <Box component="form" onSubmit={submitUser} noValidate>
              <FormField
                label="Nombre"
                value={userForm.name}
                onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))}
                fieldError={userErrors.name}
              />
              <FormField
                label="Email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
                fieldError={userErrors.email}
              />
              <FormField
                label="Rol"
                select
                value={userForm.role}
                onChange={(e) =>
                  setUserForm((f) => ({ ...f, role: e.target.value as 'student' | 'admin' }))
                }
                fieldError={userErrors.role}
              >
                <MenuItem value="student">Estudiante</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </FormField>
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                Crear usuario
              </Button>
            </Box>
            <List>
              {users.map((u) => (
                <ListItem key={u.id}>
                  <ListItemText primary={u.name} secondary={`${u.email} · ${u.role}`} />
                </ListItem>
              ))}
            </List>
          </Stack>
        )}

        {activeTab === 5 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Accesos
            </Typography>
            <Box component="form" onSubmit={submitAccess} noValidate>
              <FormField
                label="Usuario"
                select
                value={accessForm.userId}
                onChange={(e) =>
                  setAccessForm((f) => ({ ...f, userId: e.target.value }))
                }
                fieldError={accessErrors.userId}
              >
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name}
                  </MenuItem>
                ))}
              </FormField>
              <FormField
                label="Curso"
                select
                value={accessForm.courseId}
                onChange={(e) =>
                  setAccessForm((f) => ({ ...f, courseId: e.target.value }))
                }
                fieldError={accessErrors.courseId}
              >
                {courses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.title}
                  </MenuItem>
                ))}
              </FormField>
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                Conceder acceso
              </Button>
            </Box>
            <List>
              {accesses.map((a) => (
                <ListItem key={a.id}>
                  <ListItemText
                    primary={`Usuario ${a.userId}`}
                    secondary={`Curso ${a.courseId} · ${a.grantedAt}`}
                  />
                </ListItem>
              ))}
            </List>
          </Stack>
        )}
      </Box>
    </Box>
  );
};
