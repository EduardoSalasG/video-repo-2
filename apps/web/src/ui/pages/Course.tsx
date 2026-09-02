import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Typography } from '../atoms/Typography';
import { api } from '../../lib/api';
import type { Course as CourseType, CourseModule, Section } from '../../types';

export const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseType | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [sectionsByModule, setSectionsByModule] = useState<Record<string, Section[]>>({});
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    Promise.all([api.getCourse(courseId), api.getModules(courseId), api.getCourseProgress(courseId)])
      .then(([courseData, modulesData, progress]) => {
        setCourse(courseData);
        setModules(modulesData);
        setCompletedIds(new Set(progress.completedSectionIds));
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar el curso');
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleToggle = async (moduleId: string) => {
    if (expanded === moduleId) {
      setExpanded(null);
      return;
    }
    setExpanded(moduleId);
    if (!sectionsByModule[moduleId]) {
      try {
        const sections = await api.getSections(moduleId);
        setSectionsByModule((prev) => ({ ...prev, [moduleId]: sections }));
      } catch {
        setSectionsByModule((prev) => ({ ...prev, [moduleId]: [] }));
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !course) {
    return <Typography>{error ?? 'Curso no encontrado'}</Typography>;
  }

  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link to="/app" style={{ textDecoration: 'none', color: 'inherit' }}>
          Biblioteca
        </Link>
        <Typography color="text.primary">{course?.name}</Typography>
      </Breadcrumbs>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {course?.name}
        </Typography>
        <Typography color="text.secondary" paragraph>
          {course.description}
        </Typography>
      </motion.div>

      <List disablePadding>
        {modules.map((module) => (
          <Box
            key={module.id}
            sx={{
              mb: 1.5,
              borderRadius: 3,
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              overflow: 'hidden',
            }}
          >
            <ListItemButton
              onClick={() => handleToggle(module.id)}
              sx={{ borderRadius: 3, py: 2 }}
            >
              <ListItemText
                primary={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {module.title}
                  </Typography>
                }
                secondary={module.description}
              />
              {expanded === module.id ? <ExpandLess color="action" /> : <ExpandMore color="action" />}
            </ListItemButton>
            <Collapse in={expanded === module.id} timeout="auto" unmountOnExit>
              <List disablePadding>
                {(sectionsByModule[module.id] ?? []).map((section) => (
                  <ListItem key={section.id} disablePadding>
                    <ListItemButton
                      component={Link}
                      to={`/app/sections/${section.id}`}
                      sx={{ pl: 4, py: 1.5 }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ color: '#111111' }}>
                            {section.title}
                          </Typography>
                        }
                      />
                      {completedIds.has(section.id) && (
                        <CheckCircleIcon color="success" />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        ))}
      </List>
    </Box>
  );
};
