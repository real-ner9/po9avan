import { Context } from 'telegraf';

export interface RegistrationDraft {
  telegramId: string;
  username: string;
  nickname: string;
  profession: string; // будет хранить ObjectId как строку
  targetProfession: string; // будет хранить ObjectId как строку
  experienceYears: number;
  about: string;
  avatarFileId?: string;
}

export interface SessionData {
  step?: import('../../common/constants/steps').RegStep;
  data: Partial<RegistrationDraft>;
  isAdmin?: boolean; // является ли пользователь администратором
  isRefill?: boolean;
  matches?: {
    ids: string[];
    index: number;
  };
}

export interface MyContext extends Context {
  session: SessionData;
  match: RegExpMatchArray;
}
