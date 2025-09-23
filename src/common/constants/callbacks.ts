export const CALLBACKS = {
  PROFILE_FEED: 'profile_feed',
  PROFILE_EDIT_NICKNAME: 'profile_edit_nickname',
  PROFILE_EDIT_AVATAR: 'profile_edit_avatar',
  PROFILE_EDIT_ABOUT: 'profile_edit_about',
  PROFILE_REFILL: 'profile_refill',

  FEED_LIKE: 'feed_like',
  FEED_DISLIKE: 'feed_dislike',

  MATCHES_PREV: 'matches_prev',
  MATCHES_NEXT: 'matches_next',
  MATCH_OPEN: 'match_open',

  SKIP_AVATAR: 'skip_avatar',
} as const;

export type CallbackData = (typeof CALLBACKS)[keyof typeof CALLBACKS];


