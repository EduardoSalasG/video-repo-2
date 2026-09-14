import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { FormError } from '../molecules/FormError';
import { brand } from '../../theme';

interface FileUploadFieldProps {
  label: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string | null;
  maxSizeMB?: number;
  uploading?: boolean;
  progress?: number;
  onCancel?: () => void;
  helperText?: string;
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;

export const FileUploadField = ({
  label,
  accept,
  file,
  onChange,
  disabled,
  required,
  error,
  maxSizeMB,
  uploading,
  progress,
  onCancel,
  helperText,
}: FileUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useRef(`file-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  const [localError, setLocalError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file && accept.startsWith('image')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
    return undefined;
  }, [file, accept]);

  const handleFile = (selected: File | null) => {
    setLocalError(null);
    if (!selected) {
      onChange(null);
      return;
    }
    if (accept !== '*' && !accept.split(',').some((a) => selected.type.startsWith(a.trim().replace('/*', '')))) {
      setLocalError(`Tipo de archivo no permitido (${selected.type || 'desconocido'})`);
      return;
    }
    if (maxSizeMB && selected.size > maxSizeMB * 1024 * 1024) {
      setLocalError(`El archivo supera el máximo de ${maxSizeMB} MB (${formatSize(selected.size)})`);
      return;
    }
    onChange(selected);
  };

  const shownError = localError ?? error ?? null;

  return (
    <Box sx={{ my: 2 }}>
      <InputLabel htmlFor={inputId.current} shrink sx={{ mb: 1, position: 'static', transform: 'none' }}>
        {label}
        {required ? ' *' : ''}
      </InputLabel>
      <input
        ref={inputRef}
        id={inputId.current}
        type="file"
        accept={accept}
        disabled={disabled || uploading}
        required={required}
        aria-invalid={!!shownError}
        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        style={{ display: 'none' }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <InputLabel
          htmlFor={inputId.current}
          sx={{ position: 'static', transform: 'none', cursor: disabled || uploading ? 'default' : 'pointer' }}
        >
          <Button
            component="span"
            variant="outlined"
            disabled={disabled || uploading}
            startIcon={<UploadFileIcon />}
          >
            {file ? 'Cambiar archivo' : 'Elegir archivo'}
          </Button>
        </InputLabel>
        {file && (
          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '100%' }}>
            {file.name} · {formatSize(file.size)}
          </Typography>
        )}
      </Box>
      {previewUrl && (
        <Box
          component="img"
          src={previewUrl}
          alt={`Vista previa de ${file?.name ?? 'imagen seleccionada'}`}
          sx={{ mt: 1.5, maxWidth: 240, maxHeight: 140, borderRadius: 2, border: `1px solid ${brand.hairline}`, objectFit: 'cover', display: 'block' }}
        />
      )}
      {uploading && (
        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <LinearProgress variant={progress !== undefined ? 'determinate' : 'indeterminate'} value={progress ?? 0} />
          </Box>
          {progress !== undefined && (
            <Typography variant="caption" color="text.secondary">
              {progress}%
            </Typography>
          )}
          {onCancel && (
            <Button variant="text" color="error" onClick={onCancel} size="small">
              Cancelar
            </Button>
          )}
        </Box>
      )}
      {helperText && !shownError && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {helperText}
        </Typography>
      )}
      <FormError message={shownError} />
    </Box>
  );
};
