import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Typography } from '../atoms/Typography';
import { FormField } from '../molecules/FormField';
import { UserAutocomplete } from '../molecules/UserAutocomplete';
import { StatusSnackbar, type StatusSeverity } from '../molecules/StatusSnackbar';
import { ParamMaintainer } from '../organisms/ParamMaintainer';
import { RolePermissionsMaintainer } from '../organisms/RolePermissionsMaintainer';
import { Button } from '../atoms/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { primaryStyleLabels, videoTypeLabels, difficultyLabels } from '../../lib/labels';
import type { Course, CourseModule, Section, Role, Difficulty, PrimaryStyle, VideoType, User, CourseAccess, ParamRecord } from '../../types';

const TABS = [
  'dashboard',
  'cursos',
  'modulos',
  'secciones',
  'videos',
  'parametros/pasos',
  'parametros/estilos',
  'usuarios',
  'parametros/dificultades',
  'parametros/tipos-video',
  'parametros/tipos-etiqueta',
  'parametros/niveles-acceso',
  'parametros/roles',
  'parametros/permisos',
];

const TAB_PERMISSIONS = [
  'admin.dashboard.view',
  'content.courses.manage',
  'content.courses.manage',
  'content.courses.manage',
  'content.courses.manage',
  'content.labels.manage',
  'admin.params.manage',
  'admin.users.view',
  'admin.params.manage',
  'admin.params.manage',
  'admin.params.manage',
  'admin.params.manage',
  'admin.roles.manage',
  'admin.roles.manage',
] as const;

const getUploadMessage = (percent: number, type: 'video' | 'imagen' = 'video'): string => {
  if (percent < 25) return `Subiendo ${type}...`;
  if (percent < 50) return '25%, ya falta menos';
  if (percent < 75) return 'Ya pasamos la mitad';
  if (percent < 80) return 'Queda un poco más, no desesperes';
  if (percent < 90) return 'Bien, superamos el 80%';
  if (percent < 99) return 'Ya queda un 10% solamente';
  if (percent < 100) return 'Llegando al 99%';
  return type === 'imagen' ? 'Imagen cargada' : 'Video cargado';
};

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
  difficulty: z.string().min(1, 'La dificultad es obligatoria'),
  primaryStyle: z.string().min(1, 'El estilo es obligatorio'),
  videoType: z.string().min(1, 'El tipo de video es obligatorio'),
  durationCounts: z.coerce.number().min(1, 'La duración debe ser mayor a 0'),
  steps: z.array(z.string()).default([]),
  influences: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

const roleSchema = z.object({
  userId: z.string().min(1, 'El ID de usuario es obligatorio'),
  role: z.string().min(1, 'Selecciona un rol'),
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
  const { '*': tab } = useParams();
  const { hasPerm } = useAuth();
  const activeTab = useMemo(() => {
    const current = tab ?? 'dashboard';
    const index = TABS.indexOf(current);
    if (index >= 0) return index;
    if (current.startsWith('parametros/')) return 5;
    return 0;
  }, [tab]);
  const canViewTab = hasPerm(TAB_PERMISSIONS[activeTab] ?? 'admin.panel.access');

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

  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState({ courses: 0, users: 0 });
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [courseForm, setCourseForm] = useState<CourseFormData>({ name: '', description: '' });
  const [courseImage, setCourseImage] = useState<File | null>(null);
  const [courseUploading, setCourseUploading] = useState(false);
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
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const courseImageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<StatusSeverity>('info');
  const [stepLabels, setStepLabels] = useState<string[]>([]);
  const [influenceLabels, setInfluenceLabels] = useState<string[]>([]);
  const [tagLabels, setTagLabels] = useState<string[]>([]);
  const [videoLink, setVideoLink] = useState('');
  const [videoLinkError, setVideoLinkError] = useState<string | null>(null);

  const [adminLabels, setAdminLabels] = useState<{ id: string; name: string; styles: PrimaryStyle[] }[]>([]);
  const [loadingLabels, setLoadingLabels] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelStyles, setNewLabelStyles] = useState<PrimaryStyle[]>([]);
  const [filterLabelStyle, setFilterLabelStyle] = useState<PrimaryStyle | ''>('');

  const [primaryStyles, setPrimaryStyles] = useState<ParamRecord[]>([]);
  const [loadingStyles, setLoadingStyles] = useState(false);
  const [difficulties, setDifficulties] = useState<ParamRecord[]>([]);
  const [loadingDifficulties, setLoadingDifficulties] = useState(false);
  const [videoTypes, setVideoTypes] = useState<ParamRecord[]>([]);
  const [loadingVideoTypes, setLoadingVideoTypes] = useState(false);
  const [labelTypes, setLabelTypes] = useState<ParamRecord[]>([]);
  const [loadingLabelTypes, setLoadingLabelTypes] = useState(false);
  const [accessLevels, setAccessLevels] = useState<ParamRecord[]>([]);
  const [loadingAccessLevels, setLoadingAccessLevels] = useState(false);
  const [roles, setRoles] = useState<ParamRecord[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [roleForm, setRoleForm] = useState<RoleFormData>({ userId: '', role: 'STUDENT' });
  const [roleErrors, setRoleErrors] = useState<Partial<Record<keyof RoleFormData, string>>>({});

  const [accessForm, setAccessForm] = useState<AccessFormData>({ userId: '', courseId: '' });
  const [, setAccessErrors] = useState<Partial<Record<keyof AccessFormData, string>>>({});
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userAccesses, setUserAccesses] = useState<CourseAccess[]>([]);

  const showStatus = (message: string, severity: StatusSeverity) => {
    setSnackbarSeverity(severity);
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const showSuccess = (message: string) => showStatus(message, 'success');
  const showError = (message: string) => showStatus(message, 'error');

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null);
      setUserAccesses([]);
      return;
    }
    api
      .getUser(selectedUserId)
      .then(setSelectedUser)
      .catch(() => setSelectedUser(null));
    api
      .getUserAccesses(selectedUserId)
      .then(setUserAccesses)
      .catch(() => setUserAccesses([]));
  }, [selectedUserId]);

  useEffect(() => {
    setLoadingCourses(true);
    api
      .getCourses()
      .then((data) => setCourses([...data].sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));
  }, []);

  const loadDashboard = () => {
    setLoadingDashboard(true);
    setDashboardError(null);
    api
      .getDashboard()
      .then(setDashboard)
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Error al cargar el dashboard';
        setDashboard({ courses: 0, users: 0 });
        setDashboardError(message);
      })
      .finally(() => setLoadingDashboard(false));
  };

  useEffect(() => {
    if (canViewTab && activeTab === 0) loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, canViewTab]);

  useEffect(() => {
    if (!moduleCourse) {
      setModules([]);
      return;
    }
    setLoadingModules(true);
    api
      .getModules(moduleCourse)
      .then((data) => setModules([...data].sort((a, b) => a.title.localeCompare(b.title))))
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
      .then((data) => setModules([...data].sort((a, b) => a.title.localeCompare(b.title))))
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
      .then((data) => setSections([...data].sort((a, b) => a.title.localeCompare(b.title))))
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
      .then((data) => setModules([...data].sort((a, b) => a.title.localeCompare(b.title))))
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
      .then((data) => setSections([...data].sort((a, b) => a.title.localeCompare(b.title))))
      .catch(() => setSections([]))
      .finally(() => setLoadingSections(false));
  }, [videoModule]);

  useEffect(() => {
    if (activeTab !== 4) return;
    api.getVideoLabels('STEP', undefined, videoForm.primaryStyle).then(setStepLabels).catch(() => setStepLabels([]));
    api.getVideoLabels('INFLUENCE').then(setInfluenceLabels).catch(() => setInfluenceLabels([]));
    api.getVideoLabels('TAG').then(setTagLabels).catch(() => setTagLabels([]));
  }, [activeTab, videoForm.primaryStyle]);

  const loadAdminLabels = () => {
    if (activeTab !== 5 && activeTab !== 6) return;
    setLoadingLabels(true);
    api
      .getAdminLabels('STEP', filterLabelStyle || undefined)
      .then((data) => setAdminLabels(data.labels as { id: string; name: string; styles: PrimaryStyle[] }[]))
      .catch(() => setAdminLabels([]))
      .finally(() => setLoadingLabels(false));
  };

  const loadPrimaryStyles = () => {
    setLoadingStyles(true);
    api
      .getPrimaryStyles()
      .then(setPrimaryStyles)
      .catch(() => setPrimaryStyles([]))
      .finally(() => setLoadingStyles(false));
  };

  const loadDifficulties = () => {
    setLoadingDifficulties(true);
    api
      .getDifficulties()
      .then(setDifficulties)
      .catch(() => setDifficulties([]))
      .finally(() => setLoadingDifficulties(false));
  };

  const loadVideoTypes = () => {
    setLoadingVideoTypes(true);
    api
      .getVideoTypes()
      .then(setVideoTypes)
      .catch(() => setVideoTypes([]))
      .finally(() => setLoadingVideoTypes(false));
  };

  const loadLabelTypes = () => {
    setLoadingLabelTypes(true);
    api
      .getLabelTypes()
      .then(setLabelTypes)
      .catch(() => setLabelTypes([]))
      .finally(() => setLoadingLabelTypes(false));
  };

  const loadAccessLevels = () => {
    setLoadingAccessLevels(true);
    api
      .getAccessLevels()
      .then(setAccessLevels)
      .catch(() => setAccessLevels([]))
      .finally(() => setLoadingAccessLevels(false));
  };

  const loadRoles = () => {
    setLoadingRoles(true);
    api
      .getRoles()
      .then(setRoles)
      .catch(() => setRoles([]))
      .finally(() => setLoadingRoles(false));
  };

  useEffect(() => {
    if (!canViewTab) return;
    if (activeTab >= 4) {
      loadPrimaryStyles();
      loadDifficulties();
      loadVideoTypes();
      loadLabelTypes();
      loadAccessLevels();
      loadRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, canViewTab]);

  useEffect(() => {
    if (!canViewTab) return;
    loadAdminLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filterLabelStyle, canViewTab]);

  const submitCourse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (courseUploading) return;
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
    setCourseUploading(true);
    setSnackbarSeverity('info');
    setSnackbarMessage(getUploadMessage(0, 'imagen'));
    setSnackbarOpen(true);

    try {
      let course: Course;
      const onProgress = (percent: number) => setSnackbarMessage(getUploadMessage(percent, 'imagen'));
      if (editingCourseId) {
        course = await api.updateCourse(editingCourseId, result.data, courseImage ?? undefined, onProgress);
        setCourses((prev) => prev.map((c) => (c.id === editingCourseId ? course : c)));
        setEditingCourseId(null);
      } else {
        course = await api.createCourse(result.data, courseImage ?? undefined, onProgress);
        setCourses((prev) => [...prev, course]);
      }
      setCourseForm({ name: '', description: '' });
      setCourseImage(null);
      if (courseImageInputRef.current) courseImageInputRef.current.value = '';
      setSnackbarSeverity('success');
      setSnackbarMessage(editingCourseId ? 'Curso actualizado' : 'Curso creado');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar curso';
      setSnackbarSeverity('error');
      setSnackbarMessage(message);
      setCourseErrors({ name: message });
    } finally {
      setCourseUploading(false);
    }
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
    if (editingModuleId) {
      api
        .updateModule(editingModuleId, result.data)
        .then((updated) => {
          setModules((prev) => prev.map((m) => (m.id === editingModuleId ? updated : m)));
          setModuleForm({ title: '', description: '', orderIndex: undefined });
          setEditingModuleId(null);
          showSuccess('Módulo actualizado');
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Error al actualizar módulo';
          setModuleErrors({ title: message });
        });
      return;
    }
    api
      .createModule(moduleCourse, result.data)
      .then((newModule) => {
        setModules((prev) => [...prev, newModule]);
        setModuleForm({ title: '', description: '', orderIndex: undefined });
        setModuleCourse('');
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
    if (editingSectionId) {
      api
        .updateSection(editingSectionId, result.data)
        .then((updated) => {
          setSections((prev) => prev.map((s) => (s.id === editingSectionId ? updated : s)));
          setSectionForm({ title: '', description: '', orderIndex: undefined, markdownContent: '' });
          setEditingSectionId(null);
          showSuccess('Sección actualizada');
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Error al actualizar sección';
          setSectionErrors({ title: message });
        });
      return;
    }
    api
      .createSection(sectionModule, result.data)
      .then((newSection) => {
        setSections((prev) => [...prev, newSection]);
        setSectionForm({ title: '', description: '', orderIndex: undefined, markdownContent: '' });
        setSectionCourse('');
        setSectionModule('');
        showSuccess('Sección creada');
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al crear sección';
        setSectionErrors({ title: message });
      });
  };

  const submitVideo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (uploading) return;
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

    setUploading(true);
    setSnackbarSeverity('info');
    setSnackbarMessage(getUploadMessage(0));
    setSnackbarOpen(true);
    setVideoErrors({});

    try {
      await api.uploadVideo(
        videoSection,
        videoFile,
        {
          difficulty: result.data.difficulty as Difficulty,
          primaryStyle: result.data.primaryStyle as PrimaryStyle,
          videoType: result.data.videoType as VideoType,
          durationCounts: result.data.durationCounts,
          steps: result.data.steps,
          influences: result.data.influences,
          tags: result.data.tags,
        },
        (percent) => {
          setSnackbarMessage(getUploadMessage(percent));
        },
      );
      setVideoFile(null);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
      setVideoForm({
        difficulty: 'BEGINNER',
        primaryStyle: 'MAMBO_ON2',
        videoType: 'STEP',
        durationCounts: 0,
        steps: [],
        influences: [],
        tags: [],
      });
      setVideoCourse('');
      setVideoModule('');
      setVideoSection('');
      setSnackbarSeverity('success');
      setSnackbarMessage('Video cargado');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir video';
      setSnackbarSeverity('error');
      setSnackbarMessage(message);
      setVideoErrors({ difficulty: message });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateLabel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newLabelName.trim() || newLabelStyles.length === 0) return;
    try {
      await api.createAdminLabel({
        type: 'STEP',
        name: newLabelName.trim(),
        styles: newLabelStyles,
      });
      setNewLabelName('');
      setNewLabelStyles([]);
      showSuccess('Paso creado');
      loadAdminLabels();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear paso';
      showError(message);
    }
  };

  const handleDeleteLabel = async (id: string) => {
    try {
      await api.deleteAdminLabel(id);
      showSuccess('Paso eliminado');
      loadAdminLabels();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar paso';
      showError(message);
    }
  };

  const handleCreateStyle = async (value: string, label: string) => {
    try {
      await api.createPrimaryStyle({ value, label });
      showSuccess('Estilo creado');
      loadPrimaryStyles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear estilo';
      showError(message);
    }
  };

  const handleUpdateStyle = async (value: string, data: { label?: string; orderIndex?: number; isActive?: boolean }) => {
    try {
      await api.updatePrimaryStyle(value, data);
      showSuccess('Estilo actualizado');
      loadPrimaryStyles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar estilo';
      showError(message);
    }
  };

  const handleDeleteStyle = async (value: string) => {
    try {
      await api.deletePrimaryStyle(value);
      showSuccess('Estilo eliminado');
      loadPrimaryStyles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar estilo';
      showError(message);
    }
  };

  const handleCreateDifficulty = async (value: string, label: string) => {
    try {
      await api.createDifficulty({ value, label });
      showSuccess('Dificultad creada');
      loadDifficulties();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear dificultad';
      showError(message);
    }
  };

  const handleUpdateDifficulty = async (value: string, data: { label?: string; orderIndex?: number; isActive?: boolean }) => {
    try {
      await api.updateDifficulty(value, data);
      showSuccess('Dificultad actualizada');
      loadDifficulties();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar dificultad';
      showError(message);
    }
  };

  const handleDeleteDifficulty = async (value: string) => {
    try {
      await api.deleteDifficulty(value);
      showSuccess('Dificultad eliminada');
      loadDifficulties();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar dificultad';
      showError(message);
    }
  };

  const handleCreateVideoType = async (value: string, label: string) => {
    try {
      await api.createVideoType({ value, label });
      showSuccess('Tipo de video creado');
      loadVideoTypes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear tipo de video';
      showError(message);
    }
  };

  const handleUpdateVideoType = async (value: string, data: { label?: string; orderIndex?: number; isActive?: boolean }) => {
    try {
      await api.updateVideoType(value, data);
      showSuccess('Tipo de video actualizado');
      loadVideoTypes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar tipo de video';
      showError(message);
    }
  };

  const handleDeleteVideoType = async (value: string) => {
    try {
      await api.deleteVideoType(value);
      showSuccess('Tipo de video eliminado');
      loadVideoTypes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar tipo de video';
      showError(message);
    }
  };

  const handleCreateLabelType = async (value: string, label: string) => {
    try {
      await api.createLabelType({ value, label });
      showSuccess('Tipo de etiqueta creado');
      loadLabelTypes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear tipo de etiqueta';
      showError(message);
    }
  };

  const handleUpdateLabelType = async (value: string, data: { label?: string; orderIndex?: number; isActive?: boolean }) => {
    try {
      await api.updateLabelType(value, data);
      showSuccess('Tipo de etiqueta actualizado');
      loadLabelTypes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar tipo de etiqueta';
      showError(message);
    }
  };

  const handleDeleteLabelType = async (value: string) => {
    try {
      await api.deleteLabelType(value);
      showSuccess('Tipo de etiqueta eliminado');
      loadLabelTypes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar tipo de etiqueta';
      showError(message);
    }
  };

  const handleCreateAccessLevel = async (value: string, label: string) => {
    try {
      await api.createAccessLevel({ value, label });
      showSuccess('Nivel de acceso creado');
      loadAccessLevels();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear nivel de acceso';
      showError(message);
    }
  };

  const handleUpdateAccessLevel = async (value: string, data: { label?: string; orderIndex?: number; isActive?: boolean }) => {
    try {
      await api.updateAccessLevel(value, data);
      showSuccess('Nivel de acceso actualizado');
      loadAccessLevels();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar nivel de acceso';
      showError(message);
    }
  };

  const handleDeleteAccessLevel = async (value: string) => {
    try {
      await api.deleteAccessLevel(value);
      showSuccess('Nivel de acceso eliminado');
      loadAccessLevels();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar nivel de acceso';
      showError(message);
    }
  };

  const handleCreateRole = async (value: string, label: string) => {
    try {
      await api.createRole({ value, label });
      showSuccess('Rol creado');
      loadRoles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear rol';
      showError(message);
    }
  };

  const handleUpdateRole = async (value: string, data: { label?: string; orderIndex?: number; isActive?: boolean }) => {
    try {
      await api.updateRole(value, data);
      showSuccess('Rol actualizado');
      loadRoles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar rol';
      showError(message);
    }
  };

  const handleDeleteRole = async (value: string) => {
    try {
      await api.deleteRole(value);
      showSuccess('Rol eliminado');
      loadRoles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar rol';
      showError(message);
    }
  };

  const submitLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setVideoLinkError(null);
    if (!videoSection) {
      setVideoLinkError('Selecciona una sección');
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
    if (!videoLink.trim()) {
      setVideoLinkError('Pega una URL de video');
      return;
    }

    api
      .attachVideoLink(videoSection, videoLink, {
        difficulty: result.data.difficulty as Difficulty,
        primaryStyle: result.data.primaryStyle as PrimaryStyle,
        videoType: result.data.videoType as VideoType,
        durationCounts: result.data.durationCounts,
        steps: result.data.steps,
        influences: result.data.influences,
        tags: result.data.tags,
      })
      .then(() => {
        setVideoLink('');
        setVideoLinkError(null);
        setVideoFile(null);
        if (videoFileInputRef.current) videoFileInputRef.current.value = '';
        setVideoForm({
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          videoType: 'STEP',
          durationCounts: 0,
          steps: [],
          influences: [],
          tags: [],
        });
        setVideoCourse('');
        setVideoModule('');
        setVideoSection('');
        showSuccess('Enlace guardado');
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al guardar enlace';
        setVideoLinkError(message);
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
        setRoleForm({ userId: selectedUserId, role: 'STUDENT' });
        showSuccess('Rol actualizado');
        if (selectedUserId) {
          api.getUser(selectedUserId).then(setSelectedUser).catch(() => setSelectedUser(null));
        }
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
        setAccessForm({ userId: selectedUserId, courseId: '' });
        showSuccess('Acceso concedido');
        if (selectedUserId) {
          api.getUserAccesses(selectedUserId).then(setUserAccesses).catch(() => setUserAccesses([]));
        }
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al conceder acceso';
        setAccessErrors({ courseId: message });
      });
  };

  const handleRevokeAccess = (courseId: string) => {
    if (!selectedUserId) return;
    api
      .revokeAccess(selectedUserId, courseId)
      .then(() => {
        setUserAccesses((prev) => prev.filter((a) => a.courseId !== courseId));
        showSuccess('Acceso revocado');
      })
      .catch(() => showError('Error al revocar acceso'));
  };

  const startEditCourse = (c: Course) => {
    setEditingCourseId(c.id);
    setCourseForm({ name: c.name, description: c.description ?? '' });
    setCourseImage(null);
    if (courseImageInputRef.current) courseImageInputRef.current.value = '';
  };

  const startEditModule = (m: CourseModule) => {
    setModuleCourse(m.courseId);
    setEditingModuleId(m.id);
    setModuleForm({
      title: m.title,
      description: m.description ?? '',
      orderIndex: m.orderIndex,
    });
  };

  const startEditSection = (s: Section) => {
    setSectionModule(s.moduleId);
    setEditingSectionId(s.id);
    setSectionForm({
      title: s.title,
      description: s.description ?? '',
      orderIndex: s.orderIndex,
      markdownContent: s.markdownContent ?? '',
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    api
      .deleteCourse(courseId)
      .then(() => {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
        showSuccess('Curso eliminado');
      })
      .catch(() => showError('Error al eliminar curso'));
  };

  const handleDeleteModule = (moduleId: string) => {
    api
      .deleteModule(moduleId)
      .then(() => {
        setModules((prev) => prev.filter((m) => m.id !== moduleId));
        showSuccess('Módulo eliminado');
      })
      .catch(() => showError('Error al eliminar módulo'));
  };

  const handleDeleteSection = (sectionId: string) => {
    api
      .deleteSection(sectionId)
      .then(() => {
        setSections((prev) => prev.filter((s) => s.id !== sectionId));
        showSuccess('Sección eliminada');
      })
      .catch(() => showError('Error al eliminar sección'));
  };

  const renderCourseSelect = (value: string, onChange: (value: string) => void, disabled = false) => (
    <FormField
      select
      label="Curso"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled || courses.length === 0}
    >
      <MenuItem value="">Seleccionar curso</MenuItem>
      {courses.map((course) => (
        <MenuItem key={course.id} value={course.id}>
          {course.name}
        </MenuItem>
      ))}
    </FormField>
  );

  const renderModuleSelect = (value: string, onChange: (value: string) => void, disabled = false) => (
    <FormField
      select
      label="Módulo"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled || modules.length === 0}
    >
      <MenuItem value="">Seleccionar módulo</MenuItem>
      {modules.map((module) => (
        <MenuItem key={module.id} value={module.id}>
          {module.title}
        </MenuItem>
      ))}
    </FormField>
  );

  const renderSectionSelect = (value: string, onChange: (value: string) => void, disabled = false) => (
    <FormField
      select
      label="Sección"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled || sections.length === 0}
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
      <StatusSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />

      <Box sx={{ mt: { xs: 0, sm: 3 } }}>
        {!canViewTab && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography color="text.secondary">
              No tienes permiso para ver esta sección. Contacta a un administrador si crees que es un error.
            </Typography>
          </Paper>
        )}

        {canViewTab && activeTab === 0 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Dashboard
            </Typography>
            {loadingDashboard ? (
              <Typography color="text.secondary">Cargando dashboard...</Typography>
            ) : dashboardError ? (
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  No se pudo cargar el dashboard: {dashboardError}
                </Typography>
                <Button variant="outlined" onClick={loadDashboard}>
                  Reintentar
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Paper sx={{ p: 3, borderRadius: 2, minWidth: 200 }}>
                  <Typography color="text.secondary" variant="body2">
                    Cursos que administro
                  </Typography>
                  <Typography variant="h3">{dashboard.courses}</Typography>
                </Paper>
                <Paper sx={{ p: 3, borderRadius: 2, minWidth: 200 }}>
                  <Typography color="text.secondary" variant="body2">
                    Usuarios que administro
                  </Typography>
                  <Typography variant="h3">{dashboard.users}</Typography>
                </Paper>
              </Box>
            )}
          </Stack>
        )}

        {canViewTab && activeTab === 1 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Cursos
            </Typography>
            <Box component="form" onSubmit={submitCourse} noValidate>
              <Typography variant="h6" component="h3">
                {editingCourseId ? 'Editar curso' : 'Crear curso'}
              </Typography>
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
              <Box sx={{ my: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Imagen del curso
                </Typography>
                <input
                  ref={courseImageInputRef}
                  type="file"
                  accept="image/*"
                  disabled={courseUploading}
                  onChange={(event) => setCourseImage(event.target.files?.[0] ?? null)}
                />
              </Box>
              <Button type="submit" variant="contained" fullWidth disabled={courseUploading} sx={{ mt: 2 }}>
                {courseUploading ? 'Subiendo...' : editingCourseId ? 'Guardar cambios' : 'Crear curso'}
              </Button>
              {editingCourseId && (
                <Button
                  variant="outlined"
                  fullWidth
                    sx={{ mt: 1 }}
                  onClick={() => {
                    setEditingCourseId(null);
                    setCourseForm({ name: '', description: '' });
                    setCourseImage(null);
                    if (courseImageInputRef.current) courseImageInputRef.current.value = '';
                  }}
                >
                  Cancelar
                </Button>
              )}
            </Box>
            {loadingCourses ? (
              <Typography color="text.secondary">Cargando cursos...</Typography>
            ) : (
              <List>
                {courses.map((course) => (
                  <ListItem
                    key={course.id}
                    secondaryAction={
                      <>
                        <Button onClick={() => startEditCourse(course)}>Editar</Button>
                        <Button color="error" onClick={() => handleDeleteCourse(course.id)}>
                          Eliminar
                        </Button>
                      </>
                    }
                  >
                    <ListItemText
                      primary={course.name}
                      secondary={
                        course.description
                          ? course.description.length > 20
                            ? `${course.description.slice(0, 20)}…`
                            : course.description
                          : ''
                      }
                      sx={{ pr: 14 }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Stack>
        )}

        {canViewTab && activeTab === 2 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Módulos
            </Typography>
            {renderCourseSelect(moduleCourse, setModuleCourse)}
            <Box component="form" onSubmit={submitModule} noValidate>
              <Typography variant="h6" component="h3">
                {editingModuleId ? 'Editar módulo' : 'Crear módulo'}
              </Typography>
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
                {editingModuleId ? 'Guardar cambios' : 'Crear módulo'}
              </Button>
              {editingModuleId && (
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={() => {
                    setEditingModuleId(null);
                    setModuleForm({ title: '', description: '', orderIndex: undefined });
                  }}
                >
                  Cancelar
                </Button>
              )}
            </Box>
            {loadingModules ? (
              <Typography color="text.secondary">Cargando módulos...</Typography>
            ) : (
              <List>
                {modules.map((module) => (
                  <ListItem
                    key={module.id}
                    secondaryAction={
                      <>
                        <Button onClick={() => startEditModule(module)}>Editar</Button>
                        <Button color="error" onClick={() => handleDeleteModule(module.id)}>
                          Eliminar
                        </Button>
                      </>
                    }
                  >
                    <ListItemText primary={module.title} />
                  </ListItem>
                ))}
              </List>
            )}
          </Stack>
        )}

        {canViewTab && activeTab === 3 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Secciones
            </Typography>
            {renderCourseSelect(sectionCourse, setSectionCourse)}
            {renderModuleSelect(sectionModule, setSectionModule)}
            <Box component="form" onSubmit={submitSection} noValidate>
              <Typography variant="h6" component="h3">
                {editingSectionId ? 'Editar sección' : 'Crear sección'}
              </Typography>
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
                {editingSectionId ? 'Guardar cambios' : 'Crear sección'}
              </Button>
              {editingSectionId && (
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={() => {
                    setEditingSectionId(null);
                    setSectionForm({ title: '', description: '', orderIndex: undefined, markdownContent: '' });
                  }}
                >
                  Cancelar
                </Button>
              )}
            </Box>
            {loadingSections ? (
              <Typography color="text.secondary">Cargando secciones...</Typography>
            ) : (
              <List>
                {sections.map((section) => (
                  <ListItem
                    key={section.id}
                    secondaryAction={
                      <>
                        <Button onClick={() => startEditSection(section)}>Editar</Button>
                        <Button color="error" onClick={() => handleDeleteSection(section.id)}>
                          Eliminar
                        </Button>
                      </>
                    }
                  >
                    <ListItemText primary={section.title} />
                  </ListItem>
                ))}
              </List>
            )}
          </Stack>
        )}

        {canViewTab && activeTab === 4 && (
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
                {(difficulties.length > 0
                  ? difficulties.filter((d) => d.isActive)
                  : Object.entries(difficultyLabels).map(([value, label], index) => ({ value, label, orderIndex: index }))
                ).map((difficulty) => (
                  <MenuItem key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </MenuItem>
                ))}
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
                {(primaryStyles.length > 0
                  ? primaryStyles.filter((s) => s.isActive)
                  : Object.entries(primaryStyleLabels).map(([value, label]) => ({ value, label }))
                ).map((style) => (
                  <MenuItem key={style.value} value={style.value}>
                    {style.label}
                  </MenuItem>
                ))}
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
                {(videoTypes.length > 0
                  ? videoTypes.filter((t) => t.isActive)
                  : Object.entries(videoTypeLabels).map(([value, label], index) => ({ value, label, orderIndex: index }))
                ).map((videoType) => (
                  <MenuItem key={videoType.value} value={videoType.value}>
                    {videoType.label}
                  </MenuItem>
                ))}
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
                options={stepLabels}
                value={videoForm.steps}
                onChange={(_event, value) => setVideoForm((f) => ({ ...f, steps: value as string[] }))}
                filterSelectedOptions
                ChipProps={{ deleteIcon: <CloseIcon fontSize="small" /> }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Pasos"
                    helperText="Escribe y presiona Enter"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
              <Autocomplete
                multiple
                freeSolo
                options={influenceLabels}
                value={videoForm.influences}
                onChange={(_event, value) => setVideoForm((f) => ({ ...f, influences: value as string[] }))}
                filterSelectedOptions
                ChipProps={{ deleteIcon: <CloseIcon fontSize="small" /> }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Influencias"
                    helperText="Escribe y presiona Enter"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
              <Autocomplete
                multiple
                freeSolo
                options={tagLabels}
                value={videoForm.tags}
                onChange={(_event, value) => setVideoForm((f) => ({ ...f, tags: value as string[] }))}
                filterSelectedOptions
                ChipProps={{ deleteIcon: <CloseIcon fontSize="small" /> }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    helperText="Escribe y presiona Enter"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
              <Box sx={{ my: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Archivo de video
                </Typography>
                <input
                  ref={videoFileInputRef}
                  type="file"
                  accept="video/*"
                  disabled={uploading}
                  onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
                />
              </Box>
              {videoErrors.difficulty && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {videoErrors.difficulty}
                </Typography>
              )}
              <Button type="submit" variant="contained" fullWidth disabled={uploading}>
                {uploading ? 'Subiendo...' : 'Subir video'}
              </Button>
            </Box>
            <Divider />
            <Box component="form" onSubmit={submitLink} noValidate>
              <FormField
                label="URL del video"
                placeholder="https://..."
                value={videoLink}
                onChange={(event) => setVideoLink(event.target.value)}
                fieldError={videoLinkError ?? undefined}
              />
              {videoLinkError && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {videoLinkError}
                </Typography>
              )}
              <Button type="submit" variant="outlined" fullWidth sx={{ mt: 2 }}>
                Guardar enlace
              </Button>
            </Box>
          </Stack>
        )}

        {canViewTab && activeTab === 5 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Mantenedor de pasos
            </Typography>
            <FormField
              select
              label="Filtrar por estilo"
              value={filterLabelStyle}
              onChange={(event) => setFilterLabelStyle(event.target.value as PrimaryStyle | '')}
            >
              <MenuItem value="">Todos</MenuItem>
              {(primaryStyles.length > 0
                ? primaryStyles
                : Object.entries(primaryStyleLabels).map(([value, label]) => ({ value, label }))
              ).map((style) => (
                <MenuItem key={style.value} value={style.value}>
                  {style.label}
                </MenuItem>
              ))}
            </FormField>
            <Box component="form" onSubmit={handleCreateLabel} noValidate>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <FormField
                  label="Nuevo paso"
                  value={newLabelName}
                  onChange={(event) => setNewLabelName(event.target.value)}
                  margin="none"
                  sx={{ flex: 1 }}
                />
                <Autocomplete
                  multiple
                  options={primaryStyles.map((s) => s.value)}
                  getOptionLabel={(option) => primaryStyles.find((s) => s.value === option)?.label ?? primaryStyleLabels[option] ?? option}
                  value={newLabelStyles}
                  onChange={(_event, value) => setNewLabelStyles(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Estilos"
                      placeholder="Asocia uno o varios estilos"
                      size="small"
                      margin="none"
                    />
                  )}
                  sx={{ flex: 1, minWidth: 200 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!newLabelName.trim() || newLabelStyles.length === 0}
                  sx={{ height: 40 }}
                >
                  Agregar
                </Button>
              </Stack>
            </Box>
            {loadingLabels && <Typography color="text.secondary">Cargando pasos...</Typography>}
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <List>
                {adminLabels.map((label) => (
                  <ListItem
                    key={label.id}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleDeleteLabel(label.id)} color="error">
                        <CloseIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={label.name}
                      secondary={
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                          {label.styles.map((style) => (
                            <Chip
                              key={style}
                              label={primaryStyles.find((s) => s.value === style)?.label ?? primaryStyleLabels[style] ?? style}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
                {adminLabels.length === 0 && !loadingLabels && (
                  <ListItem>
                    <ListItemText primary="No hay pasos" />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Stack>
        )}

        {canViewTab && activeTab === 6 && (
          <ParamMaintainer
            title="Mantenedor de estilos"
            description="Crea, edita y desactiva estilos principales. Estos valores alimentan los selects de videos y pasos."
            items={primaryStyles}
            loading={loadingStyles}
            onCreate={handleCreateStyle}
            onUpdate={handleUpdateStyle}
            onDelete={handleDeleteStyle}
          />
        )}

        {canViewTab && activeTab === 8 && (
          <ParamMaintainer
            title="Mantenedor de dificultades"
            description="Crea, edita y desactiva niveles de dificultad. El orden define cómo se listan en los formularios."
            items={difficulties}
            loading={loadingDifficulties}
            onCreate={handleCreateDifficulty}
            onUpdate={handleUpdateDifficulty}
            onDelete={handleDeleteDifficulty}
          />
        )}

        {canViewTab && activeTab === 9 && (
          <ParamMaintainer
            title="Mantenedor de tipos de video"
            description="Crea, edita y desactiva tipos de video (paso, secuencia, coreografía, etc.)."
            items={videoTypes}
            loading={loadingVideoTypes}
            onCreate={handleCreateVideoType}
            onUpdate={handleUpdateVideoType}
            onDelete={handleDeleteVideoType}
          />
        )}

        {canViewTab && activeTab === 10 && (
          <ParamMaintainer
            title="Mantenedor de tipos de etiqueta"
            description="Crea, edita y desactiva tipos de etiqueta (paso, influencia, tag, etc.)."
            items={labelTypes}
            loading={loadingLabelTypes}
            onCreate={handleCreateLabelType}
            onUpdate={handleUpdateLabelType}
            onDelete={handleDeleteLabelType}
          />
        )}

        {canViewTab && activeTab === 11 && (
          <ParamMaintainer
            title="Mantenedor de niveles de acceso"
            description="Crea, edita y desactiva niveles de acceso (lectura, escritura, mantener, etc.)."
            items={accessLevels}
            loading={loadingAccessLevels}
            onCreate={handleCreateAccessLevel}
            onUpdate={handleUpdateAccessLevel}
            onDelete={handleDeleteAccessLevel}
          />
        )}

        {canViewTab && activeTab === 12 && (
          <ParamMaintainer
            title="Mantenedor de roles"
            description="Crea, edita y desactiva roles de usuario (admin, instructor, estudiante, etc.)."
            items={roles}
            loading={loadingRoles}
            onCreate={handleCreateRole}
            onUpdate={handleUpdateRole}
            onDelete={handleDeleteRole}
          />
        )}

        {canViewTab && activeTab === 13 && (
          <RolePermissionsMaintainer roles={roles} />
        )}

        {canViewTab && activeTab === 7 && (
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              Mantenedor de usuarios
            </Typography>
            <UserAutocomplete
              value={selectedUserId}
              onChange={(userId) => {
                setSelectedUserId(userId);
                setRoleForm((f) => ({ ...f, userId }));
                setAccessForm((f) => ({ ...f, userId }));
              }}
              label="Buscar usuario"
            />
            {selectedUser && (
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  Datos del usuario
                </Typography>
                <Typography><strong>Nombre:</strong> {selectedUser.firstName} {selectedUser.lastName}</Typography>
                <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
                <Typography><strong>Usuario:</strong> {selectedUser.username}</Typography>
                <Typography><strong>Rol:</strong> {roles.find((r) => r.value === selectedUser.role)?.label ?? selectedUser.role}</Typography>
              </Paper>
            )}
            {selectedUserId && (
              <>
                <Box component="form" onSubmit={submitRole} noValidate>
                  <Typography variant="h6" component="h3">
                    Cambiar rol
                  </Typography>
                  <FormField
                    select
                    label="Nuevo rol"
                    value={roleForm.role}
                    onChange={(event) =>
                      setRoleForm((f) => ({ ...f, role: event.target.value as Role }))
                    }
                    fieldError={roleErrors.role}
                  >
                    {(roles.length > 0
                      ? roles.filter((r) => r.isActive)
                      : [
                          { value: 'ADMIN', label: 'Admin' },
                          { value: 'INSTRUCTOR', label: 'Instructor' },
                          { value: 'STUDENT', label: 'Estudiante' },
                        ]
                    ).map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </FormField>
                  <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                    Actualizar rol
                  </Button>
                </Box>
                <Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Cursos con acceso
                  </Typography>
                  <List>
                    {userAccesses.length === 0 && (
                      <ListItem>
                        <ListItemText primary="Sin accesos" />
                      </ListItem>
                    )}
                    {userAccesses.map((access) => (
                      <ListItem
                        key={access.courseId}
                        secondaryAction={
                          <IconButton edge="end" onClick={() => handleRevokeAccess(access.courseId)} color="error">
                            <CloseIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={access.course?.name ?? access.courseId}
                          secondary={accessLevels.find((l) => l.value === access.accessLevel)?.label ?? access.accessLevel}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Box component="form" onSubmit={submitAccess} noValidate>
                  <Typography variant="h6" component="h3">
                    Conceder acceso
                  </Typography>
                  {renderCourseSelect(accessForm.courseId, (value) =>
                    setAccessForm((f) => ({ ...f, courseId: value }))
                  )}
                  <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                    Conceder acceso
                  </Button>
                </Box>
              </>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
};
