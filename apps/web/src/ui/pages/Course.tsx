import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { brand } from '../../theme';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { PageHeader } from '../organisms/PageHeader';
import { api } from '../../lib/api';
import { useApiResource } from '../../hooks/useApiResource';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Course as CourseType, CourseModule, Section } from '../../types';

interface CourseData {
  course: CourseType;
  modules: CourseModule[];
  completedIds: Set<string>;
}

interface ModuleSections {
  sections?: Section[];
  error?: boolean;
}

export const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [sectionsByModule, setSectionsByModule] = useState<Record<string, ModuleSections>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, loading, error, reload } = useApiResource<CourseData | null>(
    async () => {
      const [courseData, modulesData, progress] = await Promise.all([
        api.getCourse(courseId!),
        api.getModules(courseId!),
        api.getCourseProgress(courseId!),
      ]);
      return {
        course: courseData,
        modules: modulesData,
        completedIds: new Set(progress.completedSectionIds),
      };
    },
    [courseId],
    null,
  );

  useDocumentTitle(data?.course.name ?? 'Curso');

  useEffect(() => {
    setSectionsByModule({});
    setExpanded(null);
  }, [courseId]);

  const loadSections = async (moduleId: string) => {
    setSectionsByModule((prev) => ({ ...prev, [moduleId]: {} }));
    try {
      const sections = await api.getSections(moduleId);
      setSectionsByModule((prev) => ({ ...prev, [moduleId]: { sections } }));
    } catch {
      setSectionsByModule((prev) => ({ ...prev, [moduleId]: { error: true } }));
    }
  };

  const handleToggle = (moduleId: string) => {
    if (expanded === moduleId) {
      setExpanded(null);
      return;
    }
    setExpanded(moduleId);
    if (sectionsByModule[moduleId] === undefined) {
      void loadSections(moduleId);
    }
  };

  if (loading) {
    return (
      <Box aria-busy="true">
        <Skeleton variant="text" width={200} height={24} />
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="rounded" height={72} sx={{ mt: 2, borderRadius: 3 }} />
        <Skeleton variant="rounded" height={72} sx={{ mt: 1.5, borderRadius: 3 }} />
        <Skeleton variant="rounded" height={72} sx={{ mt: 1.5, borderRadius: 3 }} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }} role="alert">
        <Typography variant="h6" gutterBottom>
          {error ?? 'Curso no encontrado'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
          <Button variant="outlined" onClick={reload}>
            Reintentar
          </Button>
          <Button component={Link} to="/app" variant="text">
            Volver a la biblioteca
          </Button>
        </Box>
      </Box>
    );
  }

  const { course, modules, completedIds } = data;

  return (
    <Box>
      <PageHeader
        title={course.name}
        description={course.description ?? undefined}
        crumbs={[
          { label: 'Biblioteca', to: '/app' },
          { label: course.name },
        ]}
      />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {modules.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>
              Este curso aún no tiene módulos
            </Typography>
            <Typography color="text.secondary">
              El contenido se irá publicando próximamente.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {modules.map((module) => {
              const isOpen = expanded === module.id;
              const moduleState = sectionsByModule[module.id];
              return (
                <Box
                  key={module.id}
                  sx={{
                    mb: 1.5,
                    borderRadius: 3,
                    backgroundColor: brand.paper,
                    border: `1px solid ${brand.hairline}`,
                    overflow: 'hidden',
                  }}
                >
                  <ListItemButton
                    onClick={() => handleToggle(module.id)}
                    aria-expanded={isOpen}
                    aria-controls={`module-${module.id}-sections`}
                    sx={{ borderRadius: 3, py: 2 }}
                  >
                    <ListItemText
                      primary={
                        <Typography component="span" sx={{ fontWeight: 600, fontSize: '1.05rem' }}>
                          {module.title}
                        </Typography>
                      }
                      secondary={module.description}
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                    {isOpen ? <ExpandLess color="action" /> : <ExpandMore color="action" />}
                  </ListItemButton>
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <Box id={`module-${module.id}-sections`}>
                      {moduleState === undefined || (moduleState.sections === undefined && !moduleState.error) ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                          <CircularProgress size={24} aria-label="Cargando secciones" />
                        </Box>
                      ) : moduleState.error ? (
                        <Box sx={{ px: 3, py: 2, textAlign: 'center' }} role="alert">
                          <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                            No se pudieron cargar las secciones.
                          </Typography>
                          <Button size="small" variant="outlined" onClick={() => void loadSections(module.id)}>
                            Reintentar
                          </Button>
                        </Box>
                      ) : moduleState.sections!.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ px: 4, py: 2 }}>
                          Este módulo aún no tiene secciones.
                        </Typography>
                      ) : (
                        <List disablePadding>
                          {moduleState.sections!.map((section) => (
                            <ListItem key={section.id} disablePadding>
                              <ListItemButton
                                component={Link}
                                to={`/app/sections/${section.id}`}
                                sx={{ pl: 4, py: 1.5 }}
                              >
                                <ListItemText
                                  primary={
                                    <Typography variant="body1" sx={{ color: brand.ink }}>
                                      {section.title}
                                    </Typography>
                                  }
                                  secondary={
                                    section.videoMetadata?.steps?.length ? (
                                      <Stack
                                        direction="row"
                                        spacing={0.5}
                                        flexWrap="wrap"
                                        gap={0.5}
                                        sx={{ mt: 0.5 }}
                                      >
                                        {section.videoMetadata.steps.map((step) => (
                                          <Chip key={step} label={step} size="small" variant="outlined" />
                                        ))}
                                      </Stack>
                                    ) : null
                                  }
                                  secondaryTypographyProps={{ component: 'div' }}
                                />
                                {completedIds.has(section.id) && (
                                  <>
                                    <CheckCircleIcon color="success" aria-hidden="true" />
                                    <Typography
                                      component="span"
                                      sx={{
                                        position: 'absolute',
                                        width: 1,
                                        height: 1,
                                        overflow: 'hidden',
                                        clip: 'rect(0 0 0 0)',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      Sección completada
                                    </Typography>
                                  </>
                                )}
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </List>
        )}
      </motion.div>
    </Box>
  );
};
