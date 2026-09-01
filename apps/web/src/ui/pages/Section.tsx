import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Typography } from '../atoms/Typography';
import { Markdown } from '../atoms/Markdown';
import { api } from '../../lib/api';
import type { Section as SectionType } from '../../types';

export const Section = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const [section, setSection] = useState<SectionType | null>(null);
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
      <Typography variant="h4" component="h1" gutterBottom>
        {section.title}
      </Typography>
      {videoUrl && (
        <Box sx={{ mb: 3 }}>
          <video
            src={videoUrl}
            controls
            preload="metadata"
            width="100%"
            aria-label={`Video de ${section.title}`}
            style={{ borderRadius: 8 }}
          />
        </Box>
      )}
      {section.markdownContent && <Markdown source={section.markdownContent} />}
    </Box>
  );
};
