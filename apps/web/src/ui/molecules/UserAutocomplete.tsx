import { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { api } from '../../lib/api';
import type { User } from '../../types';

interface UserAutocompleteProps {
  value: string;
  onChange: (userId: string) => void;
  label?: string;
  error?: string;
}

const getLabel = (user: User | null) => {
  if (!user) return '';
  const name = `${user.firstName} ${user.lastName}`.trim();
  return name ? `${name} (${user.email})` : user.email;
};

export const UserAutocomplete = ({ value, onChange, label = 'Usuario', error }: UserAutocompleteProps) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);

  useEffect(() => {
    const selectedFromOptions = options.find((u) => u.id === value) ?? null;
    if (selectedFromOptions) {
      setSelected(selectedFromOptions);
      setInputValue(getLabel(selectedFromOptions));
    } else if (!value) {
      setSelected(null);
    }
  }, [value, options]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.length < 2 && !inputValue.includes('@')) {
        setOptions([]);
        return;
      }
      setLoading(true);
      api
        .searchUsers(inputValue)
        .then((users) => {
          setOptions(users);
          if (value) {
            const current = users.find((u) => u.id === value) ?? null;
            setSelected(current);
          }
        })
        .catch(() => setOptions([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <Autocomplete
      options={options}
      value={selected}
      inputValue={inputValue}
      getOptionLabel={getLabel}
      isOptionEqualToValue={(option, val) => option.id === val?.id}
      noOptionsText="Escribe para buscar..."
      loading={loading}
      loadingText="Buscando..."
      onInputChange={(_event, newValue) => setInputValue(newValue)}
      onChange={(_event, newValue) => {
        setSelected(newValue);
        onChange(newValue?.id ?? '');
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={!!error}
          helperText={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
