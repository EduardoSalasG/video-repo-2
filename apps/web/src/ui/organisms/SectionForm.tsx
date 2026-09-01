import { useState } from 'react';
import { z } from 'zod';
import Box from '@mui/material/Box';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import type { Section } from '../../types';

const sectionSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  videoUrl: z.string().url('La URL del video no es válida'),
  content: z.string().min(1, 'El contenido es obligatorio'),
});

type SectionFormData = z.infer<typeof sectionSchema>;

interface SectionFormProps {
  initial?: Section;
  onSave?: (data: SectionFormData) => void;
}

export const SectionForm = ({ initial, onSave }: SectionFormProps) => {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [errors, setErrors] = useState<Partial<Record<keyof SectionFormData, string>>>({});

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = sectionSchema.safeParse({ title, videoUrl, content });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        title: fieldErrors.title?.[0],
        videoUrl: fieldErrors.videoUrl?.[0],
        content: fieldErrors.content?.[0],
      });
      return;
    }
    setErrors({});
    onSave?.(result.data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6">
        {initial ? 'Editar sección' : 'Nueva sección'}
      </Typography>
      <FormField
        label="Título"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        fieldError={errors.title}
      />
      <FormField
        label="URL del video"
        value={videoUrl}
        onChange={(event) => setVideoUrl(event.target.value)}
        fieldError={errors.videoUrl}
      />
      <FormField
        label="Contenido (markdown)"
        multiline
        rows={6}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        fieldError={errors.content}
      />
      <Button type="submit" variant="contained" fullWidth>
        Guardar
      </Button>
    </Box>
  );
};
