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
import { AuthService } from './auth.service';
import { ProfessionService } from '../catalogs/profession/profession.service';
import { InlineQueryResultArticle } from '@telegraf/types';
import { FeedService } from '../feed/feed.service';
import { UserService } from '../user/user.service';
import { Types } from 'mongoose';
import { InlineKeyboardMarkup } from '@telegraf/types/markup';
import { formatUserProfile } from '../common/utils/formatters';
import { ERRORS } from '../common/constants/errors';
import { MatchService } from '../match/match.service';

// removed mentors service

@Update()
export class BotUpdate {
  constructor(
    private readonly authService: AuthService,
    private readonly botService: BotService,
    private readonly stepsService: StepsService,
    private readonly professionService: ProfessionService,
    private readonly feedService: FeedService,
    private readonly userService: UserService,
    private readonly matchService: MatchService,
  ) {}

  // helpers
  private static readonly FEED_MARKER = 'Ваш выбор:';
  private static readonly INLINE_CACHE_TIME_SEC = 1;

  private parseObjectIdFromMatch(ctx: MyContext): Types.ObjectId | null {
    const match = ctx.match as unknown as RegExpMatchArray & {
      groups?: { id?: string };
    };
    const id = match?.groups?.id;
    return id ? new Types.ObjectId(id) : null;
  }

  private async requireCurrentUser(ctx: MyContext) {
    const me = await this.getCurrentUser(ctx);
    if (!me) return null;
    return me;
  }

  private buildFeedKeyboard(candidateId: Types.ObjectId): InlineKeyboardMarkup['inline_keyboard'] {
    return [[
      { text: '👎', callback_data: `feed_dislike:${candidateId}` },
      { text: '👍', callback_data: `feed_like:${candidateId}` },
    ]];
  }

  private getEmojiByKind(kind: 'like' | 'dislike'): string {
    return kind === 'like' ? '👍' : '👎';
  }

  private async updateMessageWithMarker(ctx: MyContext, emoji: string) {
    const originalMessage = (ctx.callbackQuery?.message as any)?.text as string | undefined;
    if (originalMessage) {
      const marker = BotUpdate.FEED_MARKER;
      const hasMarker = originalMessage.includes(marker);
      const updated = hasMarker
        ? originalMessage.replace(/Ваш выбор:.*/m, `${marker} ${emoji}`)
        : `${originalMessage}\n\n${marker} ${emoji}`;
      await ctx.editMessageText(updated);
    } else {
      await ctx.reply(`${BotUpdate.FEED_MARKER} ${emoji}`);
    }
  }

  @Start()
  @Action('start')
  async onStart(@Ctx() ctx: MyContext) {
    return this.authService.handleStart(ctx);
  }

  @Action(/^like_reply:(accept|reject):(?<id>[a-fA-F0-9]{24})$/)
  async onLikeReply(@Ctx() ctx: MyContext) {
    const me = await this.requireCurrentUser(ctx);
    if (!me) return;
    const groupsId = this.parseObjectIdFromMatch(ctx);
    const match = ctx.match as unknown as RegExpMatchArray & { 1?: 'accept' | 'reject' };
    const kind = (match?.[1] as 'accept' | 'reject') ?? 'accept';
    if (!groupsId) return;

    if (kind === 'accept') {
      const { match: isMatch } =
        (await this.feedService.react(
          me._id as unknown as Types.ObjectId,
          groupsId,
          'like',
        )) || { match: false };
      await ctx.answerCbQuery('Вы отправили взаимный лайк');
      if (isMatch) {
        await ctx.reply('🎉 У вас новый матч! Посмотреть — /matches');
      }
    } else {
      await this.feedService.react(
        me._id as unknown as Types.ObjectId,
        groupsId,
        'dislike',
      );
      await ctx.answerCbQuery('Отказ отправлен');
    }
    try {
      await ctx.editMessageReplyMarkup(undefined);
    } catch {}
  }

  @Command('feed')
  async openFeed(@Ctx() ctx: MyContext) {
    const me = await this.requireCurrentUser(ctx);
    if (!me) return;
    await this.showNext(ctx, me._id as unknown as Types.ObjectId);
  }

  @Action(/^feed_(like|dislike):(?<id>[a-fA-F0-9]{24})$/)
  async onFeedReaction(@Ctx() ctx: MyContext) {
    const me = await this.requireCurrentUser(ctx);
    if (!me) return;
    const toId = this.parseObjectIdFromMatch(ctx);
    const match = ctx.match as unknown as RegExpMatchArray & { 1?: 'like' | 'dislike' };
    const kind = (match?.[1] as 'like' | 'dislike') ?? 'like';
    if (!toId) return;
    const result = await this.feedService.react(
      me._id as unknown as Types.ObjectId,
      toId,
      kind,
    );
    const emoji = this.getEmojiByKind(kind);
    try {
      await this.updateMessageWithMarker(ctx, emoji);
      await ctx.answerCbQuery(
        kind === 'like' ? 'Поставлен лайк' : 'Поставлен дизлайк',
      );
    } catch (e) {
      // fall back: just acknowledge
      try {
        await ctx.answerCbQuery(
          kind === 'like' ? 'Поставлен лайк' : 'Поставлен дизлайк',
        );
      } catch {}
    }
    if (result?.match) {
      try {
        await ctx.reply('🎉 У вас новый матч! Посмотреть — /matches');
      } catch {}
    }
    await this.showNext(ctx, me._id as unknown as Types.ObjectId);
  }

  @Command('matches')
  async onMenuMatches(@Ctx() ctx: MyContext) {
    const me = await this.requireCurrentUser(ctx);
    if (!me) return;
    const ids = await this.matchService.listForUser(
      me._id as unknown as Types.ObjectId,
    );
    if (!ids.length) {
      await ctx.reply('Пока матчей нет. Продолжайте знакомиться!');
      return;
    }
    const users = await this.userService
      .getModel()
      .find({ _id: { $in: ids } })
      .populate('profession')
      .populate('targetProfession')
      .sort({ createdAt: -1 })
      .lean();

    await ctx.reply(`Ваши матчи: ${users.length}`);
    for (const u of users) {
      const keyboard: InlineKeyboardMarkup['inline_keyboard'] = [];
      if (u.username) {
        keyboard.push([
          { text: '✉️ Открыть чат', url: `https://t.me/${u.username}` },
        ]);
      }
      await ctx.reply(formatUserProfile(u as any), {
        reply_markup: keyboard.length
          ? { inline_keyboard: keyboard }
          : undefined,
      });
    }
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
    const keyboard = this.buildFeedKeyboard(candidate._id as unknown as Types.ObjectId);
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
    const results: InlineQueryResultArticle[] = roles.map((r) => ({
      type: 'article',
      id: `prof-${r._id}`,
      title: r.name,
      input_message_content: {
        message_text: `prof:${r._id} ${r.name}`,
      },
    }));

    await ctx.answerInlineQuery(results, { cache_time: BotUpdate.INLINE_CACHE_TIME_SEC });
  }
}
