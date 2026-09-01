import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Typography } from '../atoms/Typography';
import { Markdown } from '../atoms/Markdown';
import { MOCK_COURSES } from '../../data/mock';

const findSection = (id: string) => {
  for (const course of MOCK_COURSES) {
    for (const module of course.modules) {
      const section = module.sections.find((s) => s.id === id);
      if (section) return section;
    }
  }
  return undefined;
};

export const Section = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const section = useMemo(
    () => (sectionId ? findSection(sectionId) : undefined),
    [sectionId]
  );

  if (!section) {
    return <Typography>Sección no encontrada</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {section.title}
      </Typography>
      <Box sx={{ mb: 3 }}>
        <video
          src={section.videoUrl}
          controls
          preload="metadata"
          width="100%"
          aria-label={`Video de ${section.title}`}
          style={{ borderRadius: 8 }}
        />
      </Box>
      <Markdown source={section.content} />
    </Box>
  );
};
