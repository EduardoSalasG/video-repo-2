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
  const aliveRef = useRef(true);
  const requestIdRef = useRef(0);

  const load = useCallback(() => {
    const requestId = ++requestIdRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcherRef
      .current()
      .then((data) => {
        if (aliveRef.current && requestId === requestIdRef.current) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((err: unknown) => {
        if (aliveRef.current && requestId === requestIdRef.current) {
          const message = err instanceof Error ? err.message : 'Error al cargar';
          setState((s) => ({ ...s, loading: false, error: message }));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    aliveRef.current = true;
    load();
    return () => {
      aliveRef.current = false;
    };
  }, [load]);

  const setData: React.Dispatch<React.SetStateAction<T>> = useCallback((value) => {
    setState((s) => ({
      ...s,
      data: typeof value === 'function' ? (value as (prev: T) => T)(s.data) : value,
    }));
  }, []);

  return { ...state, reload: load, setData };
}
