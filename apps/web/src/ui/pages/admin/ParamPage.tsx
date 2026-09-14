import { api } from '../../../lib/api';
import { useApiResource } from '../../../hooks/useApiResource';
import { useStatusSnackbar } from '../../../hooks/useStatusSnackbar';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { RequirePerm } from '../../templates/RequirePerm';
import { StatusSnackbar } from '../../molecules/StatusSnackbar';
import { ParamMaintainer } from '../../organisms/ParamMaintainer';
import type { ParamRecord } from '../../../types';

export type ParamKind =
  | 'estilos'
  | 'dificultades'
  | 'tipos-video'
  | 'tipos-etiqueta'
  | 'niveles-acceso'
  | 'roles';

interface ParamConfig {
  title: string;
  description: string;
  perm: string;
  load: () => Promise<ParamRecord[]>;
  create: (data: { value: string; label: string }) => Promise<unknown>;
  update: (value: string, data: { label?: string; orderIndex?: number; isActive?: boolean }) => Promise<unknown>;
  remove: (value: string) => Promise<unknown>;
}

export const PARAM_CONFIGS: Record<ParamKind, ParamConfig> = {
  estilos: {
    title: 'Mantenedor de estilos',
    description: 'Crea, edita y desactiva estilos principales. Estos valores alimentan los selects de videos y pasos.',
    perm: 'admin.params.manage',
    load: api.getPrimaryStyles,
    create: api.createPrimaryStyle,
    update: api.updatePrimaryStyle,
    remove: api.deletePrimaryStyle,
  },
  dificultades: {
    title: 'Mantenedor de dificultades',
    description: 'Crea, edita y desactiva niveles de dificultad. El orden define cómo se listan en los formularios.',
    perm: 'admin.params.manage',
    load: api.getDifficulties,
    create: api.createDifficulty,
    update: api.updateDifficulty,
    remove: api.deleteDifficulty,
  },
  'tipos-video': {
    title: 'Mantenedor de tipos de video',
    description: 'Crea, edita y desactiva tipos de video (paso, secuencia, coreografía, etc.).',
    perm: 'admin.params.manage',
    load: api.getVideoTypes,
    create: api.createVideoType,
    update: api.updateVideoType,
    remove: api.deleteVideoType,
  },
  'tipos-etiqueta': {
    title: 'Mantenedor de tipos de etiqueta',
    description: 'Crea, edita y desactiva tipos de etiqueta (paso, influencia, tag, etc.).',
    perm: 'admin.params.manage',
    load: api.getLabelTypes,
    create: api.createLabelType,
    update: api.updateLabelType,
    remove: api.deleteLabelType,
  },
  'niveles-acceso': {
    title: 'Mantenedor de niveles de acceso',
    description: 'Crea, edita y desactiva niveles de acceso (lectura, escritura, mantener, etc.).',
    perm: 'admin.params.manage',
    load: api.getAccessLevels,
    create: api.createAccessLevel,
    update: api.updateAccessLevel,
    remove: api.deleteAccessLevel,
  },
  roles: {
    title: 'Mantenedor de roles',
    description: 'Crea, edita y desactiva roles de usuario (admin, instructor, estudiante, etc.).',
    perm: 'admin.roles.manage',
    load: api.getRoles,
    create: api.createRole,
    update: api.updateRole,
    remove: api.deleteRole,
  },
};

export const ParamPage = ({ kind }: { kind: ParamKind }) => {
  const config = PARAM_CONFIGS[kind];
  useDocumentTitle(`${config.title} · Administración`);
  const { snackbar, showSuccess, showError } = useStatusSnackbar();
  const { data: items, loading, error, reload } = useApiResource(config.load, [kind], [] as ParamRecord[]);

  const onCreate = async (value: string, label: string) => {
    try {
      await config.create({ value, label });
      showSuccess('Registro creado');
      reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear';
      showError(message);
      throw err;
    }
  };

  const onUpdate = async (value: string, data: { label?: string; orderIndex?: number; isActive?: boolean }) => {
    try {
      await config.update(value, data);
      showSuccess('Registro actualizado');
      reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar';
      showError(message);
      throw err;
    }
  };

  const onDelete = async (value: string) => {
    try {
      await config.remove(value);
      showSuccess('Registro eliminado');
      reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar';
      showError(message);
      throw err;
    }
  };

  return (
    <RequirePerm permission={config.perm}>
      <ParamMaintainer
        title={config.title}
        description={config.description}
        items={items}
        loading={loading}
        error={error}
        onRetry={reload}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
      <StatusSnackbar {...snackbar} />
    </RequirePerm>
  );
};
