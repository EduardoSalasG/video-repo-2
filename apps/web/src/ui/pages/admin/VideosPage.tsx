import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import { api } from '../../../lib/api';
import { useApiResource } from '../../../hooks/useApiResource';
import { useCourseModules, useModuleSections } from '../../../hooks/useCascadeSelects';
import { useZodForm } from '../../../hooks/useZodForm';
import { useStatusSnackbar } from '../../../hooks/useStatusSnackbar';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useParamLabels } from '../../../hooks/useParamLabels';
import { RequirePerm } from '../../templates/RequirePerm';
import { Typography } from '../../atoms/Typography';
import { SubmitButton } from '../../atoms/SubmitButton';
import { FormField } from '../../molecules/FormField';
import { FormError } from '../../molecules/FormError';
import { StatusSnackbar } from '../../molecules/StatusSnackbar';
import { EntitySelect } from '../../organisms/EntitySelect';
import { FileUploadField } from '../../organisms/FileUploadField';
import { PageHeader } from '../../organisms/PageHeader';
import type { Course, Section, VideoMetadata, Difficulty, PrimaryStyle, VideoType } from '../../../types';

const videoMetadataSchema = z.object({
  difficulty: z.string().min(1, 'La dificultad es obligatoria'),
  primaryStyle: z.string().min(1, 'El estilo es obligatorio'),
  videoType: z.string().min(1, 'El tipo de video es obligatorio'),
  durationCounts: z.coerce.number().min(1, 'La duración debe ser mayor a 0'),
  steps: z.array(z.string()),
  influences: z.array(z.string()),
  tags: z.array(z.string()),
});

const linkSchema = z.object({
  url: z.string().url('Ingresa una URL válida (https://...)'),
});

const INITIAL_METADATA = {
  difficulty: 'BEGINNER',
  primaryStyle: 'MAMBO_ON2',
  videoType: 'STEP',
  durationCounts: 0,
  steps: [] as string[],
  influences: [] as string[],
  tags: [] as string[],
};

export const VideosPage = () => {
  useDocumentTitle('Videos · Administración');
  const { snackbar, showSuccess, showError } = useStatusSnackbar();
  const { params, getLabel } = useParamLabels();

  const { data: courses, loading: loadingCourses } = useApiResource(() => api.getCourses(), [], [] as Course[]);
  const [courseId, setCourseId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const { modules, loading: loadingModules } = useCourseModules(courseId);
  const { sections, setSections, loading: loadingSections } = useModuleSections(moduleId);
  const [parentError, setParentError] = useState<string | null>(null);

  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [currentMetadata, setCurrentMetadata] = useState<VideoMetadata | null>(null);
  const [loadingCurrent, setLoadingCurrent] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const [stepOptions, setStepOptions] = useState<string[]>([]);
  const [influenceOptions, setInfluenceOptions] = useState<string[]>([]);
  const [tagOptions, setTagOptions] = useState<string[]>([]);

  const metaForm = useZodForm(videoMetadataSchema, INITIAL_METADATA);
  const linkForm = useZodForm(linkSchema, { url: '' });

  const selectedCourse = courses.find((c) => c.id === courseId);
  const selectedModule = modules.find((m) => m.id === moduleId);
  const selectedSection = sections.find((s) => s.id === sectionId);

  useEffect(() => {
    api.getVideoLabels('STEP', undefined, metaForm.values.primaryStyle).then(setStepOptions).catch(() => setStepOptions([]));
    api.getVideoLabels('INFLUENCE').then(setInfluenceOptions).catch(() => setInfluenceOptions([]));
    api.getVideoLabels('TAG').then(setTagOptions).catch(() => setTagOptions([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaForm.values.primaryStyle]);

  useEffect(() => {
    if (!sectionId) {
      setCurrentSection(null);
      setCurrentMetadata(null);
      return;
    }
    setLoadingCurrent(true);
    Promise.all([api.getSection(sectionId), api.getSectionMetadata(sectionId)])
      .then(([section, metadata]) => {
        setCurrentSection(section);
        setCurrentMetadata(metadata);
      })
      .catch(() => {
        setCurrentSection(null);
        setCurrentMetadata(null);
      })
      .finally(() => setLoadingCurrent(false));
  }, [sectionId]);

  const metadataPayload = (data: z.infer<typeof videoMetadataSchema>) => ({
    difficulty: data.difficulty as Difficulty,
    primaryStyle: data.primaryStyle as PrimaryStyle,
    videoType: data.videoType as VideoType,
    durationCounts: data.durationCounts,
    steps: data.steps,
    influences: data.influences,
    tags: data.tags,
  });

  const refreshSection = (updated?: Section) => {
    if (updated) {
      setCurrentSection(updated);
      setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    }
    if (sectionId) {
      api.getSection(sectionId).then(setCurrentSection).catch(() => undefined);
      api.getSectionMetadata(sectionId).then(setCurrentMetadata).catch(() => undefined);
    }
  };

  const submitUpload = (event: React.FormEvent<HTMLFormElement>) => {
    if (!sectionId) {
      event.preventDefault();
      setParentError('Selecciona una sección');
      return;
    }
    setParentError(null);
    metaForm.handleSubmit(async (data) => {
      if (!file) {
        setFileError('Selecciona un archivo de video');
        return;
      }
      setFileError(null);
      setUploading(true);
      setProgress(0);
      abortRef.current = new AbortController();
      try {
        await api.uploadVideo(sectionId, file, metadataPayload(data), setProgress, abortRef.current.signal);
        setFile(null);
        refreshSection();
        showSuccess('Video cargado');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al subir video';
        if (message === 'Subida cancelada') {
          showError('Subida cancelada');
        } else {
          metaForm.setFormError(message);
        }
      } finally {
        setUploading(false);
        setProgress(undefined);
        abortRef.current = null;
      }
    })(event);
  };

  const submitLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sectionId) {
      setParentError('Selecciona una sección');
      return;
    }
    setParentError(null);
    const metaResult = videoMetadataSchema.safeParse(metaForm.values);
    if (!metaResult.success) {
      const flattened = metaResult.error.flatten().fieldErrors;
      const first = Object.values(flattened)[0]?.[0];
      metaForm.setFormError(first ?? 'Revisa los metadatos del video');
      return;
    }
    linkForm.handleSubmit(async (data) => {
      try {
        await api.attachVideoLink(sectionId, data.url, metadataPayload(metaResult.data));
        linkForm.reset();
        refreshSection();
        showSuccess('Enlace guardado');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al guardar enlace';
        linkForm.setFormError(message);
      }
    })(event);
  };

  return (
    <RequirePerm permission="content.courses.manage">
      <Stack spacing={3} component="section" aria-labelledby="admin-videos-heading">
        <PageHeader
          title="Videos"
          description="Elige curso, módulo y sección para subir un video o adjuntar un enlace."
          crumbs={[
            { label: 'Contenido' },
            { label: 'Videos' },
            ...(selectedCourse ? [{ label: selectedCourse.name }] : []),
            ...(selectedModule ? [{ label: selectedModule.title }] : []),
            ...(selectedSection ? [{ label: selectedSection.title }] : []),
          ]}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <EntitySelect
            label="Curso"
            value={courseId}
            onChange={(value) => {
              setCourseId(value);
              setModuleId('');
              setSectionId('');
            }}
            items={courses.map((c) => ({ id: c.id, name: c.name }))}
            loading={loadingCourses}
          />
          <EntitySelect
            label="Módulo"
            value={moduleId}
            onChange={(value) => {
              setModuleId(value);
              setSectionId('');
            }}
            items={modules.map((m) => ({ id: m.id, name: m.title }))}
            loading={loadingModules}
            disabled={!courseId}
          />
          <EntitySelect
            label="Sección"
            value={sectionId}
            onChange={(value) => {
              setSectionId(value);
              setParentError(null);
            }}
            items={sections.map((s) => ({ id: s.id, name: s.title }))}
            loading={loadingSections}
            disabled={!moduleId}
            fieldError={parentError ?? undefined}
          />
        </Stack>

        {sectionId && currentSection?.videoFileId && (
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
              Video actual de «{currentSection.title}»
            </Typography>
            {loadingCurrent ? (
              <Typography color="text.secondary" variant="body2">
                Cargando...
              </Typography>
            ) : currentMetadata ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip size="small" variant="outlined" label={getLabel('difficulty', currentMetadata.difficulty)} />
                <Chip size="small" variant="outlined" label={getLabel('primaryStyle', currentMetadata.primaryStyle)} />
                <Chip size="small" variant="outlined" label={getLabel('videoType', currentMetadata.videoType)} />
                <Chip size="small" variant="outlined" label={`${currentMetadata.durationCounts} counts`} />
              </Stack>
            ) : (
              <Typography color="text.secondary" variant="body2">
                Video asociado sin metadatos visibles.
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              Para reemplazarlo, sube un nuevo archivo o guarda un nuevo enlace. La edición y eliminación
              de videos requieren soporte del backend (pendiente).
            </Typography>
          </Paper>
        )}

        {sectionId && (
          <>
            <Paper component="form" onSubmit={submitUpload} noValidate sx={{ p: 2, borderRadius: 2, maxWidth: 560 }}>
              <Typography variant="h6" component="h2" id="admin-videos-heading" sx={{ mb: 1 }}>
                Subir video a «{selectedSection?.title ?? 'la sección'}»
              </Typography>

              <FormField
                select
                label="Dificultad"
                required
                value={metaForm.values.difficulty}
                onChange={(e) => metaForm.setField('difficulty', e.target.value)}
                fieldError={metaForm.errors.difficulty}
              >
                {(params.difficulty.filter((d) => d.isActive).length > 0
                  ? params.difficulty.filter((d) => d.isActive)
                  : [
                      { value: 'BEGINNER', label: 'Principiante' },
                      { value: 'BASIC', label: 'Básico' },
                      { value: 'INTERMEDIATE', label: 'Intermedio' },
                      { value: 'ADVANCED', label: 'Avanzado' },
                    ]
                ).map((d) => (
                  <MenuItem key={d.value} value={d.value}>
                    {d.label}
                  </MenuItem>
                ))}
              </FormField>

              <FormField
                select
                label="Estilo principal"
                required
                value={metaForm.values.primaryStyle}
                onChange={(e) => metaForm.setField('primaryStyle', e.target.value)}
                fieldError={metaForm.errors.primaryStyle}
              >
                {(params.primaryStyle.filter((s) => s.isActive).length > 0
                  ? params.primaryStyle.filter((s) => s.isActive)
                  : [
                      { value: 'MAMBO_ON2', label: 'Mambo' },
                      { value: 'CASINO', label: 'Casino' },
                      { value: 'SENSUAL_BACHATA', label: 'Bachata Sensual' },
                      { value: 'MODERN_BACHATA', label: 'Bachata Moderna' },
                    ]
                ).map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </FormField>

              <FormField
                select
                label="Tipo de video"
                required
                value={metaForm.values.videoType}
                onChange={(e) => metaForm.setField('videoType', e.target.value)}
                fieldError={metaForm.errors.videoType}
              >
                {(params.videoType.filter((t) => t.isActive).length > 0
                  ? params.videoType.filter((t) => t.isActive)
                  : [
                      { value: 'STEP', label: 'Paso' },
                      { value: 'SEQUENCE', label: 'Secuencia' },
                      { value: 'CHOREOGRAPHY', label: 'Coreografía' },
                    ]
                ).map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </FormField>

              <FormField
                label="Duración (counts)"
                type="number"
                required
                value={String(metaForm.values.durationCounts)}
                onChange={(e) =>
                  metaForm.setField('durationCounts', e.target.value ? Number(e.target.value) : 0)
                }
                fieldError={metaForm.errors.durationCounts}
              />

              <Autocomplete
                multiple
                freeSolo
                options={stepOptions}
                value={metaForm.values.steps}
                onChange={(_e, value) => metaForm.setField('steps', value as string[])}
                filterSelectedOptions
                slotProps={{ chip: { deleteIcon: <CloseIcon fontSize="small" /> } }}
                renderInput={(p) => (
                  <TextField {...p} label="Pasos" helperText="Escribe y presiona Enter" />
                )}
              />
              <Autocomplete
                multiple
                freeSolo
                options={influenceOptions}
                value={metaForm.values.influences}
                onChange={(_e, value) => metaForm.setField('influences', value as string[])}
                filterSelectedOptions
                slotProps={{ chip: { deleteIcon: <CloseIcon fontSize="small" /> } }}
                renderInput={(p) => (
                  <TextField {...p} label="Influencias" helperText="Escribe y presiona Enter" />
                )}
              />
              <Autocomplete
                multiple
                freeSolo
                options={tagOptions}
                value={metaForm.values.tags}
                onChange={(_e, value) => metaForm.setField('tags', value as string[])}
                filterSelectedOptions
                slotProps={{ chip: { deleteIcon: <CloseIcon fontSize="small" /> } }}
                renderInput={(p) => (
                  <TextField {...p} label="Tags" helperText="Escribe y presiona Enter" />
                )}
              />

              <FileUploadField
                label="Archivo de video"
                accept="video/*"
                required
                file={file}
                onChange={(f) => {
                  setFile(f);
                  setFileError(null);
                }}
                error={fileError}
                uploading={uploading}
                progress={progress}
                onCancel={uploading ? () => abortRef.current?.abort() : undefined}
              />

              <FormError message={metaForm.formError} />
              <SubmitButton fullWidth sx={{ mt: 2 }} loading={uploading} loadingText="Subiendo...">
                Subir video
              </SubmitButton>
            </Paper>

            <Paper component="form" onSubmit={submitLink} noValidate sx={{ p: 2, borderRadius: 2, maxWidth: 560 }}>
              <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                O guardar un enlace
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Usa los mismos metadatos del formulario de arriba.
              </Typography>
              <FormField
                label="URL del video"
                placeholder="https://..."
                required
                value={linkForm.values.url}
                onChange={(e) => linkForm.setField('url', e.target.value)}
                fieldError={linkForm.errors.url}
              />
              <FormError message={linkForm.formError} />
              <SubmitButton
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                loading={linkForm.submitting}
                loadingText="Guardando..."
              >
                Guardar enlace
              </SubmitButton>
            </Paper>
          </>
        )}

        {!sectionId && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography color="text.secondary">
              Selecciona una sección para subir o enlazar su video.
            </Typography>
          </Paper>
        )}
      </Stack>
      <StatusSnackbar {...snackbar} />
    </RequirePerm>
  );
};
