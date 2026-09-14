import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { CourseModule, Section } from '../types';

export function useCourseModules(courseId: string) {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setModules([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    api
      .getModules(courseId)
      .then((data) => setModules([...data].sort((a, b) => a.title.localeCompare(b.title))))
      .catch((err: unknown) => {
        setModules([]);
        setError(err instanceof Error ? err.message : 'Error al cargar módulos');
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  return { modules, setModules, loading, error };
}

export function useModuleSections(moduleId: string) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!moduleId) {
      setSections([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    api
      .getSections(moduleId)
      .then((data) => setSections([...data].sort((a, b) => a.title.localeCompare(b.title))))
      .catch((err: unknown) => {
        setSections([]);
        setError(err instanceof Error ? err.message : 'Error al cargar secciones');
      })
      .finally(() => setLoading(false));
  }, [moduleId]);

  return { sections, setSections, loading, error };
}
