import { Context } from 'telegraf';

export interface RegistrationDraft {
  telegramId: string;
  username: string;
  profession: string; // будет хранить ObjectId как строку
  targetProfession: string; // будет хранить ObjectId как строку
  experienceYears: number;
  about: string;
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
