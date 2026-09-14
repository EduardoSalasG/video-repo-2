import { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import CloseIcon from '@mui/icons-material/Close';
import { api } from '../../../lib/api';
import { useApiResource } from '../../../hooks/useApiResource';
import { useStatusSnackbar } from '../../../hooks/useStatusSnackbar';
import { useConfirm } from '../../../hooks/useConfirm';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useParamLabels } from '../../../hooks/useParamLabels';
import { RequirePerm } from '../../templates/RequirePerm';
import { Typography } from '../../atoms/Typography';
import { SubmitButton } from '../../atoms/SubmitButton';
import { IconButton } from '../../atoms/IconButton';
import { FormField } from '../../molecules/FormField';
import { FormError } from '../../molecules/FormError';
import { StatusSnackbar } from '../../molecules/StatusSnackbar';
import { PageHeader } from './PageHeader';
import type { PrimaryStyle } from '../../../types';

interface AdminLabel {
  id: string;
  name: string;
  styles: PrimaryStyle[];
}

export const StepsPage = () => {
  useDocumentTitle('Pasos · Administración');
  const { snackbar, showSuccess } = useStatusSnackbar();
  const { confirm, dialog } = useConfirm();
  const { params, getLabel } = useParamLabels();

  const [filterStyle, setFilterStyle] = useState('');
  const { data: labels, loading, error, reload } = useApiResource(
    () => api.getAdminLabels('STEP', filterStyle || undefined).then((d) => d.labels as AdminLabel[]),
    [filterStyle],
    [] as AdminLabel[],
  );

  const [newName, setNewName] = useState('');
  const [newStyles, setNewStyles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const styleOptions =
    params.primaryStyle.filter((s) => s.isActive).length > 0
      ? params.primaryStyle.filter((s) => s.isActive)
      : [
          { value: 'MAMBO_ON2', label: 'Mambo' },
          { value: 'CASINO', label: 'Casino' },
          { value: 'SENSUAL_BACHATA', label: 'Bachata Sensual' },
          { value: 'MODERN_BACHATA', label: 'Bachata Moderna' },
        ];

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newName.trim() || newStyles.length === 0 || submitting) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await api.createAdminLabel({ type: 'STEP', name: newName.trim(), styles: newStyles });
      setNewName('');
      setNewStyles([]);
      showSuccess('Paso creado');
      reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear paso';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (label: AdminLabel) => {
    confirm(
      {
        title: 'Eliminar paso',
        description: (
          <>
            Se eliminará el paso <strong>{label.name}</strong>. Los videos que lo tengan etiquetado
            podrían perder la referencia.
          </>
        ),
        confirmLabel: 'Eliminar paso',
      },
      async () => {
        await api.deleteAdminLabel(label.id);
        showSuccess('Paso eliminado');
        reload();
      },
    );
  };

  return (
    <RequirePerm permission="content.labels.manage">
      <Stack spacing={3} component="section" aria-labelledby="admin-steps-heading">
        <PageHeader
          title="Mantenedor de pasos"
          description="Crea pasos asociados a estilos. Alimentan el campo «Pasos» del formulario de videos."
        />

        <FormField
          select
          label="Filtrar por estilo"
          value={filterStyle}
          onChange={(e) => setFilterStyle(e.target.value)}
          sx={{ maxWidth: 320 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {styleOptions.map((style) => (
            <MenuItem key={style.value} value={style.value}>
              {style.label}
            </MenuItem>
          ))}
        </FormField>

        <Paper component="form" onSubmit={handleCreate} noValidate sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'flex-start' }}>
            <FormField
              label="Nuevo paso"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              margin="none"
              sx={{ flex: 1 }}
            />
            <Autocomplete
              multiple
              options={styleOptions.map((s) => s.value)}
              getOptionLabel={(option) => styleOptions.find((s) => s.value === option)?.label ?? option}
              value={newStyles}
              onChange={(_e, value) => setNewStyles(value)}
              renderInput={(p) => (
                <TextField
                  {...p}
                  label="Estilos"
                  placeholder="Asocia uno o varios estilos"
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <SubmitButton
              loading={submitting}
              loadingText="Agregando..."
              disabled={!newName.trim() || newStyles.length === 0}
              sx={{ height: 48 }}
            >
              Agregar
            </SubmitButton>
          </Stack>
          <FormError message={formError} />
        </Paper>

        {loading ? (
          <Stack spacing={1}>
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
          </Stack>
        ) : error ? (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              No se pudieron cargar los pasos: {error}
            </Typography>
          </Paper>
        ) : (
          <Paper sx={{ borderRadius: 2 }}>
            <List>
              {labels.map((label) => (
                <ListItem
                  key={label.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label={`Eliminar paso ${label.name}`}
                      onClick={() => handleDelete(label)}
                      color="error"
                    >
                      <CloseIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={label.name}
                    secondary={
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                        {label.styles.map((style) => (
                          <Chip
                            key={style}
                            label={getLabel('primaryStyle', style) || style}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
              {labels.length === 0 && (
                <ListItem>
                  <ListItemText primary="No hay pasos para el filtro seleccionado." />
                </ListItem>
              )}
            </List>
          </Paper>
        )}
      </Stack>
      <StatusSnackbar {...snackbar} />
      {dialog}
    </RequirePerm>
  );
};
