import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { Typography } from '../atoms/Typography';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { invalidateParamLabels } from '../../hooks/useParamLabels';
import type { ParamRecord } from '../../types';

interface ParamMaintainerProps {
  title: string;
  description?: string;
  items: ParamRecord[];
  loading?: boolean;
  onCreate: (value: string, label: string) => Promise<void>;
  onUpdate: (value: string, data: { label?: string; orderIndex?: number; isActive?: boolean }) => Promise<void>;
  onDelete: (value: string) => Promise<void>;
}

export const ParamMaintainer = ({ title, description, items, loading, onCreate, onUpdate, onDelete }: ParamMaintainerProps) => {
  const [newValue, setNewValue] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [editing, setEditing] = useState<ParamRecord | null>(null);
  const [form, setForm] = useState({ label: '', orderIndex: 0, isActive: true });

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newValue.trim() || !newLabel.trim()) return;
    await onCreate(newValue.trim().toUpperCase(), newLabel.trim());
    invalidateParamLabels();
    setNewValue('');
    setNewLabel('');
  };

  const handleEdit = (item: ParamRecord) => {
    setEditing(item);
    setForm({ label: item.label, orderIndex: item.orderIndex, isActive: item.isActive });
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    await onUpdate(editing.value, form);
    invalidateParamLabels();
    setEditing(null);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" component="h2" sx={{ mt: { xs: 2.5, sm: 0 } }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      <Box component="form" onSubmit={handleCreate} noValidate>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <FormField
            label="Valor"
            value={newValue}
            onChange={(event) => setNewValue(event.target.value)}
            margin="none"
            sx={{ flex: 1 }}
            helperText="Identificador interno, por ejemplo MAMBO_ON2"
          />
          <FormField
            label="Etiqueta"
            value={newLabel}
            onChange={(event) => setNewLabel(event.target.value)}
            margin="none"
            sx={{ flex: 1 }}
            helperText="Nombre visible, por ejemplo Mambo"
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!newValue.trim() || !newLabel.trim()}
            sx={{ height: 40 }}
          >
            Agregar
          </Button>
        </Stack>
      </Box>
      {editing && (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            Editar {editing.value}
          </Typography>
          <Box component="form" onSubmit={handleUpdate} noValidate>
            <Stack spacing={2}>
              <FormField
                label="Etiqueta"
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
              <Stack direction="row" spacing={1}>
                <Button type="submit" variant="contained">Guardar</Button>
                <Button type="button" variant="outlined" onClick={() => setEditing(null)}>Cancelar</Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      )}
      {loading && <Typography color="text.secondary">Cargando...</Typography>}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <List>
          {items.map((item) => (
            <ListItem
              key={item.value}
              secondaryAction={
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton edge="end" onClick={() => handleEdit(item)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => onDelete(item.value).then(invalidateParamLabels)} color="error">
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
          {items.length === 0 && !loading && (
            <ListItem>
              <ListItemText primary="Sin registros" />
            </ListItem>
          )}
        </List>
      </Paper>
    </Stack>
  );
};
