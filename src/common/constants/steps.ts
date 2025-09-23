export const REG_STEPS = {
  NICKNAME: 'nickname',
  PROFESSION: 'profession',
  TARGET_PROFESSION: 'targetProfession',
  EXPERIENCE_YEARS: 'experienceYears',
  ABOUT: 'about',
  AVATAR: 'avatar',
  CONFIRM: 'confirm',
  // edit profile steps
  EDIT_NICKNAME: 'edit_nickname',
  EDIT_ABOUT: 'edit_about',
  EDIT_AVATAR: 'edit_avatar',
} as const;

export type RegStep = (typeof REG_STEPS)[keyof typeof REG_STEPS];
