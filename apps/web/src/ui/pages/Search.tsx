import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import { Typography } from '../atoms/Typography';
import { FormField } from '../molecules/FormField';
import { FormError } from '../molecules/FormError';
import { SubmitButton } from '../atoms/SubmitButton';
import { EntitySelect } from '../organisms/EntitySelect';
import { api } from '../../lib/api';
import { apiErrorMessage } from '../../lib/error';
import { useCourses } from '../../hooks/useCascadeSelects';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useParamLabels } from '../../hooks/useParamLabels';
import { primaryStyleLabels } from '../../lib/labels';
import type { VideoSearchResult } from '../../types';

const resultVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const Search = () => {
  useDocumentTitle('Buscar');
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const style = searchParams.get('style') ?? '';
  const courseId = searchParams.get('courseId') ?? '';

  const { data: courses } = useCourses();
  const { params, getLabel } = useParamLabels();
  const [results, setResults] = useState<VideoSearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const styleOptions =
    params.primaryStyle.length > 0
      ? params.primaryStyle
      : Object.entries(primaryStyleLabels).map(([value, label]) => ({ value, label }));

  useEffect(() => {
    if (!query && !style && !courseId) {
      setResults(null);
      setError(null);
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);
      api
        .searchVideos({
          q: query.trim() || undefined,
          style: style || undefined,
          courseId: courseId || undefined,
        })
        .then((data) => {
          if (requestId === requestIdRef.current) setResults(data);
        })
        .catch((err) => {
          if (requestId === requestIdRef.current) {
            setError(apiErrorMessage(err, 'Error al buscar'));
            setResults(null);
          }
        })
        .finally(() => {
          if (requestId === requestIdRef.current) setLoading(false);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, style, courseId]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // El estado ya vive en la URL; el submit reenvía la búsqueda actual.
    setSearchParams((prev) => new URLSearchParams(prev), { replace: true });
  };

  const updateParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  };

  const searched = Boolean(query || style || courseId);

  return (
    <Container maxWidth="md" sx={{ py: 4 }} disableGutters>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            mb: 3,
            borderRadius: 5,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Buscar videos
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Encuentra contenido por tags, pasos, estilo o curso.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} role="search" noValidate>
            <Stack spacing={2}>
              <FormField
                label="Buscar en tags y pasos"
                type="search"
                placeholder="salsa, suzy q, 1 2 3"
                autoFocus
                value={query}
                onChange={(event) => updateParam('q', event.target.value)}
              />
              <FormField
                select
                label="Estilo"
                value={style}
                onChange={(event) => updateParam('style', event.target.value)}
              >
                <MenuItem value="">Todos los estilos</MenuItem>
                {styleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </FormField>
              <EntitySelect
                label="Curso"
                value={courseId}
                onChange={(value) => updateParam('courseId', value)}
                items={courses.map((c) => ({ id: c.id, name: c.name }))}
                placeholder="Todos mis cursos"
              />
            </Stack>
            <FormError message={error} />
            <SubmitButton
              fullWidth
              loading={loading}
              loadingText="Buscando..."
              startIcon={loading ? undefined : <SearchIcon />}
              sx={{ mt: 2, py: 1.5, borderRadius: 8 }}
            >
              Buscar
            </SubmitButton>
          </Box>
        </Paper>
      </motion.div>

      {results && results.length > 0 && (
        <Stack spacing={2}>
          {results.map((result, index) => (
            <motion.div
              key={result.section.id}
              initial="hidden"
              animate="visible"
              variants={resultVariants}
              transition={{ delay: index * 0.05, type: 'spring', bounce: 0, duration: 0.4 }}
            >
              <Card elevation={0} sx={{ borderRadius: 4 }}>
                <CardActionArea
                  component={Link}
                  to={`/app/sections/${result.section.id}`}
                  sx={{ p: 0 }}
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
                      {getLabel('difficulty', result.metadata.difficulty)} / {getLabel('primaryStyle', result.metadata.primaryStyle)} / {getLabel('videoType', result.metadata.videoType)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </motion.div>
          ))}
        </Stack>
      )}

      {!loading && searched && results !== null && results.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }} role="status">
          No se encontraron videos para tu búsqueda.
        </Typography>
      )}
    </Container>
  );
};
