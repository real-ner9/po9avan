import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { MyContext } from './types/my-context';
import { FeedService } from '../feed/feed.service';
import { formatUserProfile } from '../common/utils/formatters';
import { UserService } from '../user/user.service';
import { ERRORS } from '../common/constants/errors';
import { buildFeedKeyboard, getEmojiByKind } from '../feed/reactionHelpers';
import { ReactionKind } from '../feed/schemas/reaction.schema';

@Injectable()
export class FeedUiService {
  constructor(
    private readonly feedService: FeedService,
    private readonly userService: UserService,
  ) {}

  async updateMessageWithMarker(ctx: MyContext, marker: string, emoji: string) {
    const originalMessage = (ctx.callbackQuery?.message as any)?.text as
      | string
      | undefined;
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

  async showNext(ctx: MyContext) {
    const me = await this.userService.findByTelegramId(
      ctx.from?.id?.toString(),
    );
    if (!me) {
      await ctx.reply(ERRORS.USER_NOT_FOUND);
      return;
    }

    const candidate = await this.feedService.getNextCandidate(me._id);
    if (!candidate) {
      await ctx.reply('Кандидатов больше нет. Попробуйте позже.');
      return;
    }

    await ctx.reply(formatUserProfile(candidate), {
      reply_markup: { inline_keyboard: buildFeedKeyboard(candidate._id) },
    });
  }

  private parseObjectIdFromMatch(ctx: MyContext): Types.ObjectId | null {
    const match = ctx.match;
    const id = match?.groups?.id;
    return id ? new Types.ObjectId(id) : null;
  }

  async handleFeedReaction(ctx: MyContext) {
    const me = await this.userService.findByTelegramId(
      ctx.from?.id?.toString(),
    );
    if (!me) return;
    const toId = this.parseObjectIdFromMatch(ctx);
    const match = ctx.match;
    const kind = match?.[1] as ReactionKind;
    if (!toId) return;
    const result = await this.feedService.react(me._id, toId, kind);
    await ctx.reply(getEmojiByKind(kind));

    if (result?.match) {
      try {
        await ctx.reply('🎉 У вас новый матч! Посмотреть — /matches');
      } catch {}
    }
    await this.showNext(ctx);
  }
}
