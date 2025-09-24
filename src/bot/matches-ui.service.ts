import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { MyContext } from './types/my-context';
import { FeedService } from '../feed/feed.service';
import { formatUserProfile } from '../common/utils/formatters';
import { UserService } from '../user/user.service';
import { ERRORS } from '../common/constants/errors';
import { buildFeedKeyboard, getEmojiByKind } from '../feed/reactionHelpers';
import { ReactionKind } from '../feed/schemas/reaction.schema';
import { MatchService } from '../match/match.service';
import { UserDocument } from '../user/schemas/user.schema';
import { Markup } from 'telegraf';

@Injectable()
export class MatchesUiService {
  constructor(
    private readonly matchService: MatchService,
    private readonly userService: UserService,
  ) {}

  async handleMatches(ctx: MyContext) {
    const me = await this.userService.findByTelegramId(
      ctx.from?.id?.toString(),
    );
    if (!me) {
      await ctx.reply('Пользователь не найден. Пройдите регистрацию: /start');
      return;
    }

    const partnerIds = await this.matchService.listForUser(me._id);
    console.log(partnerIds);
    if (!partnerIds.length) {
      await ctx.reply('Пока нет мэтчей. Попробуйте /feed');
      return;
    }

    const users: UserDocument[] = await this.userService
      .getUserModel()
      .find({ _id: { $in: partnerIds } })
      .lean();

    for (const user of users) {
      const text = formatUserProfile(user);
      const tgLink = user.username
        ? `https://t.me/${user.username}`
        : `tg://user?id=${user.telegramId}`;

      await ctx.reply(text, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          Markup.button.url('Перейти в профиль', tgLink),
        ]),
      });
    }
  }
}
