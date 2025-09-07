import type { Types } from 'mongoose';
import type { ProfessionDocument } from '../../catalogs/profession/profession.schema';
import type { RegistrationDraft } from '../../bot/types/my-context';

type UserProfileInput = Pick<
  RegistrationDraft,
  'username' | 'experienceYears' | 'about'
> & {
  profession?: Types.ObjectId | string | ProfessionDocument | null;
  targetProfession?: Types.ObjectId | string | ProfessionDocument | null;
};

function professionToLabel(
  value: Types.ObjectId | string | ProfessionDocument | null | undefined,
): string {
  if (!value) return '—';
  if (typeof value === 'string') return value;
  // If a populated document is provided, prefer its name
  if ((value as ProfessionDocument).name) {
    return (value as ProfessionDocument).name;
  }
  return value.toString();
}

export const formatUserProfile = (user: UserProfileInput): string => {
  const lines: string[] = [
    '====================',
    '      Профиль      ',
    '====================',
    'Ник: @' + (user.username ?? '—'),
    '--------------------',
    'Ваша профессия: ' + professionToLabel(user.profession ?? null),
    'Целевая профессия: ' + professionToLabel(user.targetProfession ?? null),
    'Опыт: ' + (user.experienceYears ?? 0) + ' световых лет',
    '--------------------',
    'О себе: ' + (user.about ?? '—'),
  ];
  return lines.join('\n');
};
