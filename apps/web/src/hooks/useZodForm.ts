import { useState, type FormEvent } from 'react';
import type { ZodType } from 'zod';

type FieldErrors<T> = Partial<Record<keyof T, string>>;

interface ZodForm<T> {
  values: T;
  errors: FieldErrors<T>;
  formError: string | null;
  submitting: boolean;
  setField: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: React.Dispatch<React.SetStateAction<T>>;
  setFormError: (message: string | null) => void;
  reset: (next?: T) => void;
  handleSubmit: (onValid: (data: T) => void | Promise<void>) => (event: FormEvent<HTMLFormElement>) => void;
}

export function useZodForm<T extends Record<string, unknown>>(
  schema: ZodType<T>,
  initial: T,
): ZodForm<T> {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = <K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const reset = (next?: T) => {
    setValues(next ?? initial);
    setErrors({});
    setFormError(null);
  };

  const handleSubmit =
    (onValid: (data: T) => void | Promise<void>) => (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitting) return;
      const result = schema.safeParse(values);
      if (!result.success) {
        const flattened = result.error.flatten().fieldErrors;
        const next: FieldErrors<T> = {};
        for (const key of Object.keys(flattened) as (keyof T)[]) {
          next[key] = flattened[key]?.[0];
        }
        setErrors(next);
        return;
      }
      setErrors({});
      setFormError(null);
      const outcome = onValid(result.data);
      if (outcome instanceof Promise) {
        setSubmitting(true);
        outcome
          .catch((err: unknown) => {
            const message = err instanceof Error ? err.message : 'Error al guardar';
            setFormError(message);
          })
          .finally(() => setSubmitting(false));
      }
    };

  return {
    values,
    errors,
    formError,
    submitting,
    setField,
    setValues,
    setFormError,
    reset,
    handleSubmit,
  };
}
