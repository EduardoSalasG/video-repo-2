import { useState } from 'react';
import { z } from 'zod';
import Box from '@mui/material/Box';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import type { Section } from '../../types';

const sectionSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional(),
  orderIndex: z.coerce.number().optional(),
  markdownContent: z.string().optional(),
});

type SectionFormData = z.infer<typeof sectionSchema>;

interface SectionFormProps {
  initial?: Section;
  onSave?: (data: SectionFormData) => void;
}

export const SectionForm = ({ initial, onSave }: SectionFormProps) => {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [orderIndex, setOrderIndex] = useState<string>(initial?.orderIndex != null ? String(initial.orderIndex) : '');
  const [markdownContent, setMarkdownContent] = useState(initial?.markdownContent ?? '');
  const [errors, setErrors] = useState<Partial<Record<keyof SectionFormData, string>>>({});

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = sectionSchema.safeParse({
      title,
      description: description || undefined,
      orderIndex: orderIndex ? Number(orderIndex) : undefined,
      markdownContent: markdownContent || undefined,
    });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        title: fieldErrors.title?.[0],
        description: fieldErrors.description?.[0],
        orderIndex: fieldErrors.orderIndex?.[0],
        markdownContent: fieldErrors.markdownContent?.[0],
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
        label="Descripción"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        fieldError={errors.description}
      />
      <FormField
        label="Orden"
        type="number"
        value={orderIndex}
        onChange={(event) => setOrderIndex(event.target.value)}
        fieldError={errors.orderIndex}
      />
      <FormField
        label="Contenido (markdown)"
        multiline
        rows={6}
        value={markdownContent}
        onChange={(event) => setMarkdownContent(event.target.value)}
        fieldError={errors.markdownContent}
      />
      <Button type="submit" variant="contained" fullWidth>
        Guardar
      </Button>
    </Box>
  );
};
