import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Typography } from '../atoms/Typography';
import { CourseList } from '../organisms/CourseList';
import { api, ApiError } from '../../lib/api';
import type { Course } from '../../types';

export const Library = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getCourses()
      .then(setCourses)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        setError(err instanceof Error ? err.message : 'Error al cargar cursos');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Biblioteca
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Explora los cursos disponibles y continúa tu entrenamiento.
        </Typography>
      </motion.div>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {!loading && <CourseList courses={courses} />}
    </>
  );
};
