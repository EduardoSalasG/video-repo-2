import { api } from '../../../lib/api';
import { useApiResource } from '../../../hooks/useApiResource';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { RequirePerm } from '../../templates/RequirePerm';
import { RolePermissionsMaintainer } from '../../organisms/RolePermissionsMaintainer';
import type { ParamRecord } from '../../../types';

export const PermissionsPage = () => {
  useDocumentTitle('Permisos · Administración');
  const { data: roles } = useApiResource(() => api.getRoles(), [], [] as ParamRecord[]);

  return (
    <RequirePerm permission="admin.roles.manage">
      <RolePermissionsMaintainer roles={roles} />
    </RequirePerm>
  );
};
