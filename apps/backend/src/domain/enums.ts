export enum Role {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
}

export const AccessLevel = {
  READ: 'READ',
  WRITE: 'WRITE',
  MAINTAIN: 'MAINTAIN',
} as const;

export type AccessLevel = string;

export const Difficulty = {
  BEGINNER: 'BEGINNER',
  BASIC: 'BASIC',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
} as const;

export type Difficulty = string;

export const PrimaryStyle = {
  MAMBO_ON2: 'MAMBO_ON2',
  CASINO: 'CASINO',
  SENSUAL_BACHATA: 'SENSUAL_BACHATA',
  MODERN_BACHATA: 'MODERN_BACHATA',
} as const;

export type PrimaryStyle = string;

export const VideoType = {
  STEP: 'STEP',
  SEQUENCE: 'SEQUENCE',
  CHOREOGRAPHY: 'CHOREOGRAPHY',
} as const;

export type VideoType = string;

export const LabelType = {
  STEP: 'STEP',
  INFLUENCE: 'INFLUENCE',
  TAG: 'TAG',
} as const;

export type LabelType = string;
