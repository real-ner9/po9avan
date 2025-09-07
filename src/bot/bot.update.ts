import {
  Update,
  Command,
  Ctx,
  Hears,
  Start,
  Action,
  On,
} from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { MyContext } from './types/my-context';
import { StepsService } from './steps.service';
import { MenuService } from './menu.service';
import { AuthService } from './auth.service';
import { HhService } from './hh.service';
import { ProfessionService } from '../catalogs/profession/profession.service';
import { InlineQueryResultArticle } from '@telegraf/types';
import { FeedService } from '../feed/feed.service';
import { UserService } from '../user/user.service';
import { Types } from 'mongoose';
import { InlineKeyboardMarkup } from '@telegraf/types/markup';
import { formatUserProfile } from '../common/utils/formatters';
import { ERRORS } from '../common/constants/errors';
// removed mentors service

@Update()
export class BotUpdate {
  constructor(
    private readonly authService: AuthService,
    private readonly botService: BotService,
    private readonly stepsService: StepsService,
    private readonly menuService: MenuService,
    private readonly hhService: HhService,
    private readonly professionService: ProfessionService,
    private readonly feedService: FeedService,
    private readonly userService: UserService,
  ) {}

  @Start()
  @Action('start')
  async onStart(@Ctx() ctx: MyContext) {
    return this.authService.handleStart(ctx);
  }

  @Action(/^like_reply:(accept|reject):(?<id>[a-fA-F0-9]{24})$/)
  async onLikeReply(@Ctx() ctx: MyContext) {
    const me = await this.getCurrentUser(ctx);
    if (!me) return;
    const match = ctx.match as unknown as RegExpMatchArray & {
      groups?: { id?: string };
      1?: 'accept' | 'reject';
    };
    const kind = (match?.[1] as 'accept' | 'reject') ?? 'accept';
    const otherId = match?.groups?.id;
    if (!otherId) return;
    if (kind === 'accept') {
      await this.feedService.react(
        me._id as unknown as Types.ObjectId,
        new Types.ObjectId(otherId),
        'like',
      );
      await ctx.answerCbQuery('Вы отправили взаимный лайк');
    } else {
      await this.feedService.react(
        me._id as unknown as Types.ObjectId,
        new Types.ObjectId(otherId),
        'dislike',
      );
      await ctx.answerCbQuery('Отказ отправлен');
    }
    try {
      await ctx.editMessageReplyMarkup(undefined);
    } catch {}
  }

  @Command('menu')
  async showMenu(@Ctx() ctx: MyContext) {
    return this.menuService.handleMenu(ctx);
  }

  @Command('feed')
  async openFeed(@Ctx() ctx: MyContext) {
    const me = await this.getCurrentUser(ctx);
    if (!me) return;
    await this.showNext(ctx, me._id as unknown as Types.ObjectId);
  }

  @Action(/^feed_(like|dislike):(?<id>[a-fA-F0-9]{24})$/)
  async onFeedReaction(@Ctx() ctx: MyContext) {
    const me = await this.getCurrentUser(ctx);
    if (!me) return;
    const match = ctx.match as unknown as RegExpMatchArray & {
      groups?: { id?: string };
      1?: 'like' | 'dislike';
    };
    const kind = (match?.[1] as 'like' | 'dislike') ?? 'like';
    const toId = match?.groups?.id;
    if (!toId) return;
    await this.feedService.react(
      me._id as unknown as Types.ObjectId,
      new Types.ObjectId(toId),
      kind,
    );
    const emoji = kind === 'like' ? '👍' : '👎';
    try {
      const originalMessage = (ctx.callbackQuery?.message as any)?.text as
        | string
        | undefined;
      if (originalMessage) {
        const marker = 'Ваш выбор:';
        const hasMarker = originalMessage.includes(marker);
        const updated = hasMarker
          ? originalMessage.replace(/Ваш выбор:.*/m, `${marker} ${emoji}`)
          : `${originalMessage}\n\n${marker} ${emoji}`;
        await ctx.editMessageText(updated);
      } else {
        await ctx.reply(`Ваш выбор: ${emoji}`);
      }
      await ctx.answerCbQuery(kind === 'like' ? 'Поставлен лайк' : 'Поставлен дизлайк');
    } catch (e) {
      // fall back: just acknowledge
      try {
        await ctx.answerCbQuery(kind === 'like' ? 'Поставлен лайк' : 'Поставлен дизлайк');
      } catch {}
    }
    await this.showNext(ctx, me._id as unknown as Types.ObjectId);
  }

  private async getCurrentUser(@Ctx() ctx: MyContext) {
    const telegramId = ctx.from?.id?.toString();
    if (!telegramId) {
      await ctx.reply(ERRORS.USER_NOT_FOUND);
      return null;
    }
    const me = await this.userService.findByTelegramId(telegramId);
    if (!me) {
      await ctx.reply(ERRORS.USER_NOT_FOUND);
      return null;
    }
    return me;
  }

  private async showNext(@Ctx() ctx: MyContext, meId: Types.ObjectId) {
    const candidate = await this.feedService.getNextCandidate(meId);
    if (!candidate) {
      await ctx.reply('Кандидатов больше нет. Попробуйте позже.');
      return;
    }
    const keyboard: InlineKeyboardMarkup['inline_keyboard'] = [
      [
        { text: '👎', callback_data: `feed_dislike:${candidate._id}` },
        { text: '👍', callback_data: `feed_like:${candidate._id}` },
      ],
    ];
    await ctx.reply(formatUserProfile(candidate), {
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  @Action('profile')
  async profileFromMenu(@Ctx() ctx: MyContext) {
    return this.botService.handleProfile(ctx);
  }

  @Hears(/.*/)
  async onStep(@Ctx() ctx: MyContext) {
    await this.stepsService.onStepHandler(ctx);
  }

  @On('inline_query')
  async onInlineQuery(@Ctx() ctx: MyContext) {
    const query = ctx?.inlineQuery?.query;
    const roles = await this.professionService.search(query);
    const results: InlineQueryResultArticle[] = roles.map(r => ({
      type: 'article',
      id: `prof-${r._id}`,
      title: r.name,
      input_message_content: {
        message_text: `prof:${r._id} ${r.name}`,
      },
    }));

    await ctx.answerInlineQuery(results, { cache_time: 1 });
  }
}
