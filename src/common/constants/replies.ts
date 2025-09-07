export const REPLIES = {
  REGISTRATION: {
    INTRO:
      '👋 Привет! Давай создадим твой профиль, чтобы я мог найти для тебя ментора.',
    PROFESSION: 'Какая у вас текущая профессия?',
    TARGET_PROFESSION: 'Какую профессию вы хотите получить?',
    EXPERIENCE: 'Какой у вас опыт в этой сфере? (От 1 до 13 лет):',
    ABOUT: 'Кратко расскажите о себе (макс. 400 символов):',
    SAVED: '✅ Профиль сохранён!',
    CONFIRM_INTRO:
      'Проверьте, всё ли верно. Если да — ответьте «да». Чтобы отменить — /start',
    EXPERIENCE_INVALID: 'Введите число от 1 до 13.',
    ABOUT_TOO_LONG: 'Слишком длинно. Пожалуйста, уложитесь в 400 символов.',
  },
  NOTIFICATION: {
    FOLLOW_INSTRUCTIONS: 'Пожалуйста, следуйте инструкциям.',
    EXIT: 'Выхожу...',
    SEARCH: 'Введите текст после @po9avan_bot для поиска:',
  },
} as const;

export type ReplyKey = keyof typeof REPLIES;
