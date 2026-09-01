import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import { Typography } from '../atoms/Typography';
import { Markdown } from '../atoms/Markdown';
import { api } from '../../lib/api';
import type { Section as SectionType, Course, CourseModule } from '../../types';

export const Section = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const [section, setSection] = useState<SectionType | null>(null);
  const [module, setModule] = useState<CourseModule | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sectionId) return;
    setLoading(true);
    api
      .getSection(sectionId)
      .then(async (data) => {
        setSection(data);
        if (data.videoFileId) {
          try {
            const { url } = await api.getVideoUrl(data.videoFileId);
            setVideoUrl(url);
          } catch {
            setVideoUrl(null);
          }
        }
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar la sección');
      })
      .finally(() => setLoading(false));
  }, [sectionId]);

  useEffect(() => {
    if (!section) return;
    api
      .getModule(section.moduleId)
      .then(async (mod) => {
        setModule(mod);
        try {
          const c = await api.getCourse(mod.courseId);
          setCourse(c);
        } catch {
          setCourse(null);
        }
      })
      .catch(() => setModule(null));
  }, [section]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !section) {
    return <Typography>{error ?? 'Sección no encontrada'}</Typography>;
  }

  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link to="/app" style={{ textDecoration: 'none', color: 'inherit' }}>
          Biblioteca
        </Link>
        {course && (
          <Link to={`/app/courses/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {course.name}
          </Link>
        )}
        <Typography color="text.primary">{module?.title ?? 'Módulo'}</Typography>
        <Typography color="text.primary">{section.title}</Typography>
      </Breadcrumbs>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {section.title}
        </Typography>
      </motion.div>

      {videoUrl && (
        <Paper
          elevation={0}
          sx={{
            p: 1,
            mb: 3,
            borderRadius: 4,
            border: '1px solid rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          <video
            src={videoUrl}
            controls
            preload="metadata"
            width="100%"
            aria-label={`Video de ${section.title}`}
            style={{ borderRadius: 8, display: 'block' }}
          />
        </Paper>
      )}

      {section.markdownContent && (
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(0,0,0,0.06)' }}
        >
          <Markdown source={section.markdownContent} />
        </Paper>
      )}
    </Box>
  );
};
