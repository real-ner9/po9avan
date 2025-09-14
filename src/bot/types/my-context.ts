import { Context } from 'telegraf';

export interface RegistrationDraft {
  telegramId: string;
  username: string;
  nickname: string;
  profession: string; // будет хранить ObjectId как строку
  targetProfession: string; // будет хранить ObjectId как строку
  experienceYears: number;
  about: string;
}

export interface SessionData {
  step?:
    | 'sphere'
    | 'nickname'
    | 'profession'
    | 'targetProfession'
    | 'experienceYears'
    | 'about'
    | 'confirm'
    | 'editNickname'
    | 'editAbout';
  data: Partial<RegistrationDraft>;
  isAdmin?: boolean; // является ли пользователь администратором
  isRefill?: boolean;
}

export interface MyContext extends Context {
  session: SessionData;
  match: RegExpMatchArray;
}
