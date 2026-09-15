import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { CourseList } from '../organisms/CourseList';
import { useCourses } from '../../hooks/useCascadeSelects';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useLibraryOnboarding } from '../../hooks/useLibraryOnboarding';

export const Library = () => {
  useDocumentTitle('Biblioteca');
  const { data: courses, loading, error, reload } = useCourses();

  useLibraryOnboarding(!loading && !error);

  return (
    <>
      <motion.div data-tour="library" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Biblioteca
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Explora los cursos disponibles y continúa tu entrenamiento.
        </Typography>
      </motion.div>
      {loading && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }} aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={140} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
      )}
      {error && (
        <Box sx={{ textAlign: 'center', py: 6 }} role="alert">
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button variant="outlined" onClick={reload}>
            Reintentar
          </Button>
        </Box>
      )}
      {!loading && !error && courses.length > 0 && <CourseList courses={courses} />}
      {!loading && !error && courses.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom>
            No tienes cursos disponibles
          </Typography>
          <Typography color="text.secondary">
            Cuando un instructor te habilite un curso, aparecerá aquí.
          </Typography>
        </Box>
      )}
    </>
  );
};
