import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';

interface ApiResourceState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

interface ApiResource<T> extends ApiResourceState<T> {
  reload: () => void;
  setData: React.Dispatch<React.SetStateAction<T>>;
}

export function useApiResource<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList,
  initial: T,
): ApiResource<T> {
  const [state, setState] = useState<ApiResourceState<T>>({ data: initial, loading: true, error: null });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcherRef
      .current()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al cargar';
        setState((s) => ({ ...s, loading: false, error: message }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  const setData: React.Dispatch<React.SetStateAction<T>> = useCallback((value) => {
    setState((s) => ({
      ...s,
      data: typeof value === 'function' ? (value as (prev: T) => T)(s.data) : value,
    }));
  }, []);

  return { ...state, reload: load, setData };
}
