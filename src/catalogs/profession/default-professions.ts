export type DefaultProfession = { name: string; synonyms: string[] };

export const DEFAULT_PROFESSIONS: DefaultProfession[] = [
  { name: 'Администратор', synonyms: ['Админ', 'IT-администратор'] },
  {
    name: 'Системный администратор',
    synonyms: ['Сисадмин', 'System Administrator'],
  },
  { name: 'Сетевой администратор', synonyms: ['Network Administrator'] },
  { name: 'DevOps-инженер', synonyms: ['DevOps', 'Site Reliability Engineer'] },
  { name: 'QA-инженер', synonyms: ['Тестировщик', 'QA Engineer'] },
  {
    name: 'Frontend-разработчик',
    synonyms: ['Фронтенд разработчик', 'Front-end Engineer'],
  },
  { name: 'Backend-разработчик', synonyms: ['Бэкенд разработчик', 'Back-end'] },
  { name: 'Fullstack-разработчик', synonyms: ['Full-stack', 'Фуллстек'] },
  {
    name: 'Мобильный разработчик',
    synonyms: ['Mobile Developer', 'iOS/Android'],
  },
  { name: 'Data Scientist', synonyms: ['Специалист по данным', 'DS'] },
  { name: 'Аналитик данных', synonyms: ['Data Analyst'] },
  { name: 'Продуктовый аналитик', synonyms: ['Product Analyst'] },
  { name: 'Продуктовый менеджер', synonyms: ['Product Manager', 'PM'] },
  { name: 'Проектный менеджер', synonyms: ['Project Manager', 'РП'] },
  {
    name: 'UX/UI дизайнер',
    synonyms: ['UI/UX Designer', 'Дизайнер интерфейсов'],
  },
  { name: 'Графический дизайнер', synonyms: ['Graphic Designer'] },
  { name: 'Копирайтер', synonyms: ['Copywriter'] },
  { name: 'Маркетолог', synonyms: ['Marketing Specialist'] },
  { name: 'SMM-специалист', synonyms: ['SMM', 'Social Media Manager'] },
  { name: 'HR-специалист', synonyms: ['HR', 'Recruiter'] },
];
