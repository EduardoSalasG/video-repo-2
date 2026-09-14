import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Markdown } from '../atoms/Markdown';
import { PageHeader } from '../organisms/PageHeader';
import { StatusSnackbar } from '../molecules/StatusSnackbar';
import { api } from '../../lib/api';
import { apiErrorMessage } from '../../lib/error';
import { useApiResource } from '../../hooks/useApiResource';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useParamLabels } from '../../hooks/useParamLabels';
import { useStatusSnackbar } from '../../hooks/useStatusSnackbar';
import type { Section as SectionType, Course, CourseModule, VideoMetadata } from '../../types';

interface SectionData {
  section: SectionType;
  module: CourseModule | null;
  course: Course | null;
  videoUrl: string | null;
  metadata: VideoMetadata | null;
  completed: boolean;
}

export const Section = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const { getLabel } = useParamLabels();
  const snackbar = useStatusSnackbar();
  const [markingDone, setMarkingDone] = useState(false);

  const { data, loading, error, reload, setData } = useApiResource<SectionData | null>(
    async () => {
      const section = await api.getSection(sectionId!);
      const videoUrl = section.videoFileId ? api.getVideoStreamUrl(section.videoFileId) : null;
      const [progress, metadata] = await Promise.all([
        api.getSectionProgress(sectionId!).catch(() => ({ completed: false })),
        api.getSectionMetadata(sectionId!).catch(() => null),
      ]);
      const mod = await api.getModule(section.moduleId).catch(() => null);
      const course = mod ? await api.getCourse(mod.courseId).catch(() => null) : null;
      return {
        section,
        module: mod,
        course,
        videoUrl,
        metadata: metadata ?? section.videoMetadata ?? null,
        completed: progress.completed,
      };
    },
    [sectionId],
    null,
  );

  useDocumentTitle(data?.section.title ?? 'Sección');

  const markCompleted = async () => {
    if (!sectionId || markingDone) return;
    setMarkingDone(true);
    try {
      const progress = await api.markSectionProgress(sectionId);
      setData((prev) => (prev ? { ...prev, completed: progress.completed } : prev));
      snackbar.showSuccess('Sección marcada como vista');
    } catch (err) {
      snackbar.showError(apiErrorMessage(err, 'No se pudo marcar la sección'));
    } finally {
      setMarkingDone(false);
    }
  };

  if (loading) {
    return (
      <Box aria-busy="true">
        <Skeleton variant="text" width={220} height={24} />
        <Skeleton variant="text" width="70%" height={40} />
        <Skeleton variant="rounded" height={280} sx={{ mt: 2, borderRadius: 4 }} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }} role="alert">
        <Typography variant="h6" gutterBottom>
          {error ?? 'Sección no encontrada'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
          <Button variant="outlined" onClick={reload}>
            Reintentar
          </Button>
          <Button component={Link} to="/app" variant="text">
            Volver a la biblioteca
          </Button>
        </Box>
      </Box>
    );
  }

  const { section, module, course, videoUrl, metadata, completed } = data;

  return (
    <Box>
      <PageHeader
        title={section.title}
        crumbs={[
          { label: 'Biblioteca', to: '/app' },
          ...(course ? [{ label: course.name, to: `/app/courses/${course.id}` }] : []),
          ...(module ? [{ label: module.title }] : []),
          { label: section.title },
        ]}
      />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {completed ? (
            <>
              <CheckCircleIcon color="success" aria-hidden="true" />
              <Typography color="success.main" variant="body2">
                Visto
              </Typography>
            </>
          ) : (
            <Button
              variant="outlined"
              size="small"
              onClick={() => void markCompleted()}
              disabled={markingDone}
            >
              {markingDone ? 'Marcando…' : 'Marcar como vista'}
            </Button>
          )}
        </Box>

        {videoUrl && (
          <Paper
            elevation={0}
            sx={{
              p: 1,
              mb: 2,
              borderRadius: 4,
              bgcolor: '#000000',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <video
              src={videoUrl}
              controls
              playsInline
              preload="metadata"
              crossOrigin="use-credentials"
              onEnded={() => void markCompleted()}
              aria-label={`Video de ${section.title}`}
              style={{ borderRadius: 8, display: 'block', maxWidth: '100%', maxHeight: '70vh' }}
            />
          </Paper>
        )}

        {metadata && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {[
              getLabel('difficulty', metadata.difficulty),
              getLabel('primaryStyle', metadata.primaryStyle),
              getLabel('videoType', metadata.videoType),
            ]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        )}

        {metadata?.tags && metadata.tags.length > 0 && (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" gap={0.75} sx={{ mb: 3 }}>
            {metadata.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Stack>
        )}

        {section.markdownContent && (
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 4 }}
          >
            <Markdown source={section.markdownContent} />
          </Paper>
        )}
      </motion.div>
      <StatusSnackbar {...snackbar.snackbar} />
    </Box>
  );
};
