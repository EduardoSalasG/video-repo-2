import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import { Typography } from '../atoms/Typography';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { api } from '../../lib/api';
import type { VideoSearchResult } from '../../types';

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
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Buscar videos por tags
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
            sx={{ mt: 2 }}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </Box>
      </Paper>

      {results.length > 0 && (
        <Stack spacing={2}>
          {results.map((result) => (
            <Card
              key={result.section.id}
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/app/sections/${result.section.id}`)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {result.section.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {result.course.name} / {result.module.title}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {result.metadata.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {result.metadata.difficulty} / {result.metadata.primaryStyle} / {result.metadata.videoType}
                </Typography>
              </CardContent>
            </Card>
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
