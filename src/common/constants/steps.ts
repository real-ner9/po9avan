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
  EDIT_PROFESSION: 'edit_profession',
  EDIT_TARGET_PROFESSION: 'edit_target_profession',
  EDIT_EXPERIENCE: 'edit_experience',
} as const;

export type RegStep = (typeof REG_STEPS)[keyof typeof REG_STEPS];
