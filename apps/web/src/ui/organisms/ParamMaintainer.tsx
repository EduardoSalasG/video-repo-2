import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Skeleton from '@mui/material/Skeleton';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { Typography } from '../atoms/Typography';
import { IconButton } from '../atoms/IconButton';
import { SubmitButton } from '../atoms/SubmitButton';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { FormError } from '../molecules/FormError';
import { useConfirm } from '../../hooks/useConfirm';
import { invalidateParamLabels } from '../../hooks/useParamLabels';
import type { ParamRecord } from '../../types';

interface ParamMaintainerProps {
  title: string;
  description?: string;
  items: ParamRecord[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onCreate: (value: string, label: string) => Promise<void>;
  onUpdate: (value: string, data: { label?: string; orderIndex?: number; isActive?: boolean }) => Promise<void>;
  onDelete: (value: string) => Promise<void>;
}

export const ParamMaintainer = ({
  title,
  description,
  items,
  loading,
  error,
  onRetry,
  onCreate,
  onUpdate,
  onDelete,
}: ParamMaintainerProps) => {
  const [newValue, setNewValue] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [editing, setEditing] = useState<ParamRecord | null>(null);
  const [form, setForm] = useState({ label: '', orderIndex: 0, isActive: true });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newValue.trim() || !newLabel.trim() || submitting) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await onCreate(newValue.trim().toUpperCase(), newLabel.trim());
      invalidateParamLabels();
      setNewValue('');
      setNewLabel('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al crear');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: ParamRecord) => {
    setEditing(item);
    setForm({ label: item.label, orderIndex: item.orderIndex, isActive: item.isActive });
    setFormError(null);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing || submitting) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await onUpdate(editing.value, form);
      invalidateParamLabels();
      setEditing(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (item: ParamRecord) => {
    confirm(
      {
        title: `Eliminar ${item.label}`,
        description: (
          <>
            Se eliminará <strong>{item.label}</strong> ({item.value}). Los formularios que usan este valor
            podrían dejar de mostrarlo correctamente.
          </>
        ),
      },
      async () => {
        await onDelete(item.value);
        invalidateParamLabels();
      },
    );
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" component="h1">
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      <Paper component="form" onSubmit={handleCreate} noValidate sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'flex-start' }}>
          <FormField
            label="Valor"
            required
            value={newValue}
            onChange={(event) => setNewValue(event.target.value)}
            margin="none"
            sx={{ flex: 1 }}
            helperText="Identificador interno, por ejemplo MAMBO_ON2"
          />
          <FormField
            label="Etiqueta"
            required
            value={newLabel}
            onChange={(event) => setNewLabel(event.target.value)}
            margin="none"
            sx={{ flex: 1 }}
            helperText="Nombre visible, por ejemplo Mambo"
          />
          <SubmitButton
            loading={submitting}
            loadingText="Agregando..."
            disabled={!newValue.trim() || !newLabel.trim()}
            sx={{ height: 48 }}
          >
            Agregar
          </SubmitButton>
        </Stack>
        <FormError message={formError} />
      </Paper>
      {editing && (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Editar {editing.value}
          </Typography>
          <Box component="form" onSubmit={handleUpdate} noValidate>
            <Stack spacing={2}>
              <FormField
                label="Etiqueta"
                required
                value={form.label}
                onChange={(event) => setForm((f) => ({ ...f, label: event.target.value }))}
                margin="none"
              />
              <TextField
                label="Orden"
                type="number"
                value={form.orderIndex}
                onChange={(event) => setForm((f) => ({ ...f, orderIndex: Number(event.target.value) }))}
                size="small"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={(event) => setForm((f) => ({ ...f, isActive: event.target.checked }))}
                  />
                }
                label="Activo"
              />
              <FormError message={formError} />
              <Stack direction="row" spacing={1}>
                <SubmitButton loading={submitting}>Guardar</SubmitButton>
                <Button type="button" variant="outlined" onClick={() => setEditing(null)}>
                  Cancelar
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      )}
      {loading ? (
        <Stack spacing={1}>
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
        </Stack>
      ) : error ? (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            No se pudieron cargar los datos: {error}
          </Typography>
          {onRetry && (
            <Button variant="outlined" onClick={onRetry}>
              Reintentar
            </Button>
          )}
        </Paper>
      ) : (
        <Paper sx={{ borderRadius: 2 }}>
          <List>
            {items.map((item) => (
              <ListItem
                key={item.value}
                secondaryAction={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <IconButton
                      edge="end"
                      aria-label={`Editar ${item.label}`}
                      onClick={() => handleEdit(item)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label={`Eliminar ${item.label}`}
                      onClick={() => handleDelete(item)}
                      color="error"
                    >
                      <CloseIcon />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemText
                  primary={item.label}
                  secondary={`${item.value} · orden ${item.orderIndex} · ${item.isActive ? 'activo' : 'inactivo'}`}
                />
              </ListItem>
            ))}
            {items.length === 0 && (
              <ListItem>
                <ListItemText primary="Sin registros. Agrega el primero con el formulario de arriba." />
              </ListItem>
            )}
          </List>
        </Paper>
      )}
      {dialog}
    </Stack>
  );
};
