import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { fallbackParamLabels, humanizeParamValue, type ParamKind } from '../lib/labels';
import type { ParamRecord } from '../types';

type ParamLists = Record<ParamKind, ParamRecord[]>;

let cache: Promise<ParamLists> | null = null;
const listeners = new Set<() => void>();

const EMPTY: ParamLists = {
  primaryStyle: [],
  difficulty: [],
  videoType: [],
  labelType: [],
  accessLevel: [],
  role: [],
};

function loadParams(): Promise<ParamLists> {
  cache ??= api
    .getParams()
    .then((data) => ({
      primaryStyle: data.primaryStyles,
      difficulty: data.difficulties,
      videoType: data.videoTypes,
      labelType: data.labelTypes,
      accessLevel: data.accessLevels,
      role: data.roles,
    }))
    .catch(() => EMPTY);
  return cache;
}

export function invalidateParamLabels() {
  cache = null;
  listeners.forEach((listener) => listener());
}

export function useParamLabels() {
  const [params, setParams] = useState<ParamLists>(EMPTY);

  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      loadParams().then((data) => {
        if (mounted) setParams(data);
      });
    };
    refresh();
    listeners.add(refresh);
    return () => {
      mounted = false;
      listeners.delete(refresh);
    };
  }, []);

  const getLabel = (kind: ParamKind, value: string | undefined | null) => {
    if (!value) return '';
    const record = params[kind].find((item) => item.value === value);
    const label = record?.label ?? fallbackParamLabels[kind][value];
    return label && label !== value ? label : humanizeParamValue(value);
  };

  return { params, getLabel };
}
