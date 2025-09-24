export const CALLBACKS = {
  PROFILE_EDIT_NICKNAME: 'profile_edit_nickname',
  PROFILE_EDIT_AVATAR: 'profile_edit_avatar',
  PROFILE_EDIT_ABOUT: 'profile_edit_about',
  PROFILE_REFILL: 'profile_refill',
  PROFILE_EDIT_PROFESSION: 'profile_edit_profession',
  PROFILE_EDIT_TARGET_PROFESSION: 'profile_edit_target_profession',
  PROFILE_EDIT_EXPERIENCE: 'profile_edit_experience',

  SKIP_AVATAR: 'skip_avatar',
} as const;

export type CallbackData = (typeof CALLBACKS)[keyof typeof CALLBACKS];
