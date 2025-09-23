import { UserDocument } from '../../user/schemas/user.schema';
import { ProfessionDocument } from '../../catalogs/profession/profession.schema';

type User = Partial<Omit<UserDocument, 'profession' | 'targetProfession'>> & {
  profession: string | ProfessionDocument;
  targetProfession: string | ProfessionDocument;
};

export const formatUserProfile = (user: User): string => {
  const toLabel = (p: string | ProfessionDocument | undefined): string =>
    typeof p === 'string' ? p : (p?.name ?? '—');
  const nickname = user.nickname ?? '—';
  const hasAvatar = user.avatarFileId ? '📷' : '❓';
  const lines: string[] = [
    '====================',
    `   ${hasAvatar} Профиль: ${nickname}   `,
    '====================',
    '--------------------',
    'Профессия: ' + toLabel(user.profession),
    'Целевая профессия: ' + toLabel(user.targetProfession),
    'Опыт: ' + (user.experienceYears ?? 0) + ' световых лет',
    '--------------------',
    'О себе: ' + (user.about ?? '—'),
  ];
  return lines.join('\n');
};
