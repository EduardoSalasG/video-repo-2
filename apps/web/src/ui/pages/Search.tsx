import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import SearchIcon from '@mui/icons-material/Search';
import { Typography } from '../atoms/Typography';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { api } from '../../lib/api';
import type { VideoSearchResult } from '../../types';

const resultVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VideoSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const tags = query
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (tags.length === 0) {
      setError('Escribe al menos un tag');
      return;
    }
    setLoading(true);
    try {
      const data = await api.searchVideos(tags);
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
            Encuentra contenido por tags, estilo o dificultad.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <FormField
              label="Tags (separados por coma)"
              placeholder="salsa, on2, principiante"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
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
              sx={{ mt: 2, py: 1.5, borderRadius: 14 }}
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
                    {result.metadata.difficulty} / {result.metadata.primaryStyle} / {result.metadata.videoType}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Stack>
      )}

      {!loading && results.length === 0 && query && (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          No se encontraron videos con esos tags.
        </Typography>
      )}
    </Container>
  );
};
