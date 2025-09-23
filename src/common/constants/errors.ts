// src/common/constants/errors.ts

export const ERRORS = {
  USER_NOT_FOUND: 'Пользователь не найден. Пожалуйста, начните с /start.',
  PROFESSION_NOT_FOUND: 'Профессия не найдена.',
  EXPERIENCE_INVALID: 'Введите число от 1 до 13.',
  ABOUT_TOO_LONG: 'Слишком длинно. Пожалуйста, уложитесь в 400 символов.',
} as const;

export type ErrorKey = keyof typeof ERRORS;
