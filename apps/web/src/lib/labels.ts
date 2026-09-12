import type { PrimaryStyle, VideoType, Difficulty, Role, AccessLevel } from '../types';

export const primaryStyleLabels: Record<string, string> = {
  MAMBO_ON2: 'Mambo',
  CASINO: 'Casino',
  SENSUAL_BACHATA: 'Bachata Sensual',
  MODERN_BACHATA: 'Bachata Moderna',
};

export const videoTypeLabels: Record<string, string> = {
  STEP: 'Paso',
  SEQUENCE: 'Secuencia',
  CHOREOGRAPHY: 'Coreografía',
};

export const difficultyLabels: Record<string, string> = {
  BEGINNER: 'Principiante',
  BASIC: 'Básico',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
};

export const labelTypeLabels: Record<string, string> = {
  STEP: 'Paso',
  INFLUENCE: 'Influencia',
  TAG: 'Tag',
};

export const accessLevelLabels: Record<string, string> = {
  READ: 'Lectura',
  WRITE: 'Escritura',
  MAINTAIN: 'Mantener',
};

export const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  INSTRUCTOR: 'Instructor',
  STUDENT: 'Estudiante',
};

export type ParamKind =
  | 'primaryStyle'
  | 'difficulty'
  | 'videoType'
  | 'labelType'
  | 'accessLevel'
  | 'role';

export const fallbackParamLabels: Record<ParamKind, Record<string, string>> = {
  primaryStyle: primaryStyleLabels,
  difficulty: difficultyLabels,
  videoType: videoTypeLabels,
  labelType: labelTypeLabels,
  accessLevel: accessLevelLabels,
  role: roleLabels,
};

export type { PrimaryStyle, VideoType, Difficulty, Role, AccessLevel };
