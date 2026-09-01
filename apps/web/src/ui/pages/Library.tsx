import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <Typography variant="h4" component="h1" gutterBottom>
        Biblioteca de cursos
      </Typography>
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
