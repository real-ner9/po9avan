import { Types } from 'mongoose';
import { InlineKeyboardMarkup } from '@telegraf/types/markup';
import { CALLBACKS } from '../common/constants/callbacks';
import {
  REACTION_KIND_DISLIKE,
  REACTION_KIND_LIKE,
  ReactionKind,
} from './schemas/reaction.schema';

export const buildFeedKeyboard = (
  candidateId: Types.ObjectId,
): InlineKeyboardMarkup['inline_keyboard'] => {
  return [
    [
      {
        text: getEmojiByKind(REACTION_KIND_DISLIKE),
        callback_data: `${CALLBACKS.FEED_DISLIKE}:${candidateId}`,
      },
      {
        text: getEmojiByKind(REACTION_KIND_LIKE),
        callback_data: `${CALLBACKS.FEED_LIKE}:${candidateId}`,
      },
    ],
  ];
};

export const getEmojiByKind = (kind: ReactionKind): string => {
  return kind === 'like' ? '👍' : '👎';
};
