import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import { Typography } from '../atoms/Typography';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { api } from '../../lib/api';
import { primaryStyleLabels, videoTypeLabels, difficultyLabels } from '../../lib/labels';
import type { Course, VideoSearchResult } from '../../types';

const resultVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [results, setResults] = useState<VideoSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getCourses()
      .then(setCourses)
      .catch(() => setCourses([]));
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.searchVideos({
        q: query.trim() || undefined,
        style: style || undefined,
        courseId: courseId || undefined,
      });
      setResults(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al buscar';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            mb: 3,
            borderRadius: 5,
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.04)',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Buscar videos
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Encuentra contenido por tags, pasos, estilo o curso.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              <FormField
                label="Buscar en tags y pasos"
                placeholder="salsa, suzy q, 1 2 3"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <FormField
                select
                label="Estilo"
                value={style}
                onChange={(event) => setStyle(event.target.value)}
              >
                <MenuItem value="">Todos los estilos</MenuItem>
                {Object.entries(primaryStyleLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </FormField>
              <FormField
                select
                label="Curso"
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
              >
                <MenuItem value="">Todos mis cursos</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.name}
                  </MenuItem>
                ))}
              </FormField>
            </Stack>
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={<SearchIcon />}
              sx={{ mt: 2, py: 1.5, borderRadius: 8 }}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Box>
        </Paper>
      </motion.div>

      {results.length > 0 && (
        <Stack spacing={2}>
          {results.map((result, index) => (
            <motion.div
              key={result.section.id}
              initial="hidden"
              animate="visible"
              variants={resultVariants}
              transition={{ delay: index * 0.05, type: 'spring', bounce: 0, duration: 0.4 }}
            >
              <Card
                elevation={0}
                sx={{ cursor: 'pointer', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 4 }}
                onClick={() => navigate(`/app/sections/${result.section.id}`)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {result.section.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {result.course.name} / {result.module.title}
                  </Typography>
                  <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {result.metadata.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                    {difficultyLabels[result.metadata.difficulty]} / {primaryStyleLabels[result.metadata.primaryStyle]} / {videoTypeLabels[result.metadata.videoType]}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Stack>
      )}

      {!loading && results.length === 0 && (query || style || courseId) && (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          No se encontraron videos.
        </Typography>
      )}
    </Container>
  );
};
