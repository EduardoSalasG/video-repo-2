import MenuItem from '@mui/material/MenuItem';
import { FormField } from '../molecules/FormField';

interface EntitySelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: { id: string; name: string }[];
  loading?: boolean;
  disabled?: boolean;
  fieldError?: string;
  placeholder?: string;
}

export const EntitySelect = ({
  label,
  value,
  onChange,
  items,
  loading,
  disabled,
  fieldError,
  placeholder,
}: EntitySelectProps) => (
  <FormField
    select
    label={label}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    disabled={disabled || loading || items.length === 0}
    fieldError={fieldError}
    helperText={loading ? 'Cargando...' : undefined}
  >
    <MenuItem value="">{placeholder ?? `Seleccionar ${label.toLowerCase()}`}</MenuItem>
    {items.map((item) => (
      <MenuItem key={item.id} value={item.id}>
        {item.name}
      </MenuItem>
    ))}
  </FormField>
);
