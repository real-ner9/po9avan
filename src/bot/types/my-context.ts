import { Context } from 'telegraf';

export interface RegistrationDraft {
  telegramId?: string;
  username?: string;
  sphere?: string;
  profession?: string; // будет хранить ObjectId как строку
  professionName?: number; // будет хранить название профессии для удобства
  targetProfession?: string; // будет хранить ObjectId как строку
  targetProfessionName?: number; // будет хранить название профессии для удобства
  experienceYears?: number;
  about?: string;
  professionCategoryId?: number;
  targetProfessionCategoryId?: number;
}

export interface SessionData {
  step?:
    | 'sphere'
    | 'profession'
    | 'targetProfession'
    | 'experienceYears'
    | 'about'
    | 'confirm';
  data: Partial<RegistrationDraft>;
  isAdmin?: boolean; // является ли пользователь администратором
}

export interface MyContext extends Context {
  session: SessionData;
  match: RegExpMatchArray;
}
