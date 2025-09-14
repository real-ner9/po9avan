import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { InlineKeyboardMarkup } from '@telegraf/types/markup';
import { MyContext } from './types/my-context';
import { FeedService } from '../feed/feed.service';
import { formatUserProfile } from '../common/utils/formatters';

@Injectable()
export class FeedUiService {
  constructor(private readonly feedService: FeedService) {}

  buildFeedKeyboard(candidateId: Types.ObjectId): InlineKeyboardMarkup['inline_keyboard'] {
    return [
      [
        { text: '👎', callback_data: `feed_dislike:${candidateId}` },
        { text: '👍', callback_data: `feed_like:${candidateId}` },
      ],
    ];
  }

  getEmojiByKind(kind: 'like' | 'dislike'): string {
    return kind === 'like' ? '👍' : '👎';
  }

  async updateMessageWithMarker(ctx: MyContext, marker: string, emoji: string) {
    const originalMessage = (ctx.callbackQuery?.message as any)?.text as string | undefined;
    if (originalMessage) {
      const hasMarker = originalMessage.includes(marker);
      const updated = hasMarker
        ? originalMessage.replace(/Ваш выбор:.*/m, `${marker} ${emoji}`)
        : `${originalMessage}\n\n${marker} ${emoji}`;
      await ctx.editMessageText(updated);
    } else {
      await ctx.reply(`${marker} ${emoji}`);
    }
  }

  async showNext(ctx: MyContext, meId: Types.ObjectId) {
    const candidate = await this.feedService.getNextCandidate(meId);
    if (!candidate) {
      await ctx.reply('Кандидатов больше нет. Попробуйте позже.');
      return;
    }
    const keyboard = this.buildFeedKeyboard(candidate._id as unknown as Types.ObjectId);
    await ctx.reply(formatUserProfile(candidate as any), {
      reply_markup: { inline_keyboard: keyboard },
    });
  }
}


