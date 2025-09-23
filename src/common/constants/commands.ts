export const COMMANDS = {
  PROFILE: 'profile',
  FEED: 'feed',
  MATCHES: 'matches',
} as const;

export const YES = 'y' as const;
export const NO = 'n' as const;

export type CommandName = (typeof COMMANDS)[keyof typeof COMMANDS];
