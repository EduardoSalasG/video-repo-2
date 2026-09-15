import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useApiResource } from './useApiResource';
import type { Course, CourseModule, Section } from '../types';

const byOrderIndex = <T extends { orderIndex: number; title?: string }>(a: T, b: T) =>
  a.orderIndex - b.orderIndex || (a.title ?? '').localeCompare(b.title ?? '', 'es', { sensitivity: 'base' });

export function useCourses() {
  return useApiResource(
    () =>
      api
        .getCourses()
        .then((data) => [...data].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))),
    [],
    [] as Course[],
  );
}

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
      .then((data) => setModules([...data].sort(byOrderIndex)))
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
      .then((data) => setSections([...data].sort(byOrderIndex)))
      .catch((err: unknown) => {
        setSections([]);
        setError(err instanceof Error ? err.message : 'Error al cargar secciones');
      })
      .finally(() => setLoading(false));
  }, [moduleId]);

  return { sections, setSections, loading, error };
}
