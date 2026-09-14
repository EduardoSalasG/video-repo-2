import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Typography } from '../atoms/Typography';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { StatusSnackbar, type StatusSeverity } from '../molecules/StatusSnackbar';
import { api } from '../../lib/api';
import { brand } from '../../theme';
import type { ParamRecord, PermissionRecord } from '../../types';

interface RolePermissionsMaintainerProps {
  roles: ParamRecord[];
}

export const RolePermissionsMaintainer = ({ roles }: RolePermissionsMaintainerProps) => {
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [assigned, setAssigned] = useState<Set<string>>(new Set());
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ message: string; severity: StatusSeverity } | null>(null);

  const categories = useMemo(() => {
    const map = new Map<string, PermissionRecord[]>();
    for (const permission of permissions) {
      const list = map.get(permission.category) ?? [];
      list.push(permission);
      map.set(permission.category, list);
    }
    return [...map.entries()];
  }, [permissions]);

  useEffect(() => {
    api
      .getPermissions()
      .then(setPermissions)
      .catch(() => setStatus({ message: 'No se pudieron cargar los permisos', severity: 'error' }));
  }, []);

  useEffect(() => {
    if (!selectedRole) return;
    setLoading(true);
    api
      .getRolePermissions(selectedRole)
      .then((data) => {
        setAssigned(new Set(data.permissions));
        setIsSuperuser(data.isSuperuser);
      })
      .catch(() => setStatus({ message: 'No se pudieron cargar los permisos del rol', severity: 'error' }))
      .finally(() => setLoading(false));
  }, [selectedRole]);

  const toggle = (value: string) => {
    setAssigned((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const data = await api.setRolePermissions(selectedRole, [...assigned], isSuperuser);
      setAssigned(new Set(data.permissions));
      setIsSuperuser(data.isSuperuser);
      setStatus({ message: 'Permisos actualizados', severity: 'success' });
    } catch {
      setStatus({ message: 'No se pudieron guardar los permisos', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" component="h1">
          Permisos por rol
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Asigna los permisos que tendrá cada rol en el panel de administración. Los cambios aplican de inmediato.
        </Typography>
      </Box>

      <FormField
        select
        label="Rol"
        value={selectedRole}
        onChange={(event) => setSelectedRole(event.target.value)}
        margin="none"
      >
        {roles
          .filter((role) => role.isActive)
          .map((role) => (
            <MenuItem key={role.value} value={role.value}>
              {role.label}
            </MenuItem>
          ))}
      </FormField>

      {selectedRole && (
        <>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isSuperuser}
                  onChange={(event) => setIsSuperuser(event.target.checked)}
                  disabled={loading}
                />
              }
              label="Superusuario"
            />
            <Typography variant="body2" color="text.secondary">
              Un superusuario tiene acceso total al panel, sin importar los permisos marcados abajo.
            </Typography>
          </Paper>

          <Box sx={{ opacity: isSuperuser ? 0.5 : 1 }}>
            {categories.map(([category, items]) => (
              <Accordion key={category} defaultExpanded disableGutters elevation={0} sx={{ border: `1px solid ${brand.hairline}`, borderRadius: 2, '&:before': { display: 'none' }, mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {category}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  {items.map((permission) => (
                    <FormControlLabel
                      key={permission.value}
                      control={
                        <Checkbox
                          checked={assigned.has(permission.value)}
                          onChange={() => toggle(permission.value)}
                          disabled={loading || isSuperuser}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">{permission.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {permission.value}
                          </Typography>
                        </Box>
                      }
                      sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}
                    />
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          <Button variant="contained" onClick={handleSave} disabled={saving || loading} sx={{ alignSelf: 'flex-start' }}>
            {saving ? 'Guardando...' : 'Guardar permisos'}
          </Button>
        </>
      )}

      <StatusSnackbar
        open={status !== null}
        message={status?.message ?? ''}
        severity={status?.severity ?? 'info'}
        onClose={() => setStatus(null)}
      />
    </Stack>
  );
};
