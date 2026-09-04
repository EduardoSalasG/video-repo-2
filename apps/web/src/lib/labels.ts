import type { PrimaryStyle, VideoType, Difficulty } from '../types';

export const primaryStyleLabels: Record<PrimaryStyle, string> = {
  MAMBO_ON2: 'Mambo',
  CASINO: 'Casino',
  SENSUAL_BACHATA: 'Bachata Sensual',
  MODERN_BACHATA: 'Bachata Moderna',
};

export const videoTypeLabels: Record<VideoType, string> = {
  STEP: 'Paso',
  SEQUENCE: 'Secuencia',
  CHOREOGRAPHY: 'Coreografía',
};

export const difficultyLabels: Record<Difficulty, string> = {
  BEGINNER: 'Principiante',
  BASIC: 'Básico',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
};
