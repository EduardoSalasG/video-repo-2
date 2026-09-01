import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import { Typography } from '../atoms/Typography';
import { api } from '../../lib/api';
import type { Course as CourseType, CourseModule, Section } from '../../types';

export const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseType | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [sectionsByModule, setSectionsByModule] = useState<Record<string, Section[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    Promise.all([api.getCourse(courseId), api.getModules(courseId)])
      .then(([courseData, modulesData]) => {
        setCourse(courseData);
        setModules(modulesData);
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
      } catch (err) {
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
      <Typography variant="h4" component="h1" gutterBottom>
        {course.name}
      </Typography>
      <Typography color="text.secondary" paragraph>
        {course.description}
      </Typography>
      {modules.map((module) => (
        <Box key={module.id} sx={{ mb: 2 }}>
          <ListItemButton onClick={() => handleToggle(module.id)}>
            <ListItemText primary={module.title} />
          </ListItemButton>
          <Collapse in={expanded === module.id} timeout="auto" unmountOnExit>
            <List disablePadding>
              {(sectionsByModule[module.id] ?? []).map((section) => (
                <ListItemButton
                  key={section.id}
                  component={Link}
                  to={`/app/sections/${section.id}`}
                  sx={{ pl: 4 }}
                >
                  <ListItemText primary={section.title} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </Box>
      ))}
    </Box>
  );
};
