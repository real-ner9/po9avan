// src/common/constants/errors.ts

export const ERRORS = {
  USER_NOT_FOUND: 'Пользователь не найден. Пожалуйста, начните с /start.',
  PROFESSION_NOT_FOUND: 'Профессия не найдена.',
} as const;

export type ErrorKey = keyof typeof ERRORS;
