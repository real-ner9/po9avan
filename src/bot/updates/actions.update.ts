import { Update, Action, Ctx } from 'nestjs-telegraf';
import { MyContext } from '../types/my-context';
import { Types } from 'mongoose';
import { FeedService } from '../../feed/feed.service';
import { BotContextService } from '../bot-context.service';
import { FeedUiService } from '../feed-ui.service';
import { BotService } from '../bot.service';

@Update()
export class ActionsUpdate {
  private static readonly FEED_MARKER = 'Ваш выбор:';

  constructor(
    private readonly feedService: FeedService,
    private readonly ctxService: BotContextService,
    private readonly feedUi: FeedUiService,
    private readonly botService: BotService,
  ) {}

  private parseObjectIdFromMatch(ctx: MyContext): Types.ObjectId | null {
    const match = ctx.match as unknown as RegExpMatchArray & {
      groups?: { id?: string };
    };
    const id = match?.groups?.id;
    return id ? new Types.ObjectId(id) : null;
  }

  @Action(/^feed_(like|dislike):(?<id>[a-fA-F0-9]{24})$/)
  async onFeedReaction(@Ctx() ctx: MyContext) {
    const me = await this.ctxService.requireCurrentUser(ctx);
    if (!me) return;
    const toId = this.parseObjectIdFromMatch(ctx);
    const match = ctx.match as unknown as RegExpMatchArray & {
      1?: 'like' | 'dislike';
    };
    const kind = (match?.[1] as 'like' | 'dislike') ?? 'like';
    if (!toId) return;
    const result = await this.feedService.react(
      me._id as unknown as Types.ObjectId,
      toId,
      kind,
    );
    const emoji = this.feedUi.getEmojiByKind(kind);
    try {
      await this.feedUi.updateMessageWithMarker(
        ctx,
        ActionsUpdate.FEED_MARKER,
        emoji,
      );
      await ctx.answerCbQuery(
        kind === 'like' ? 'Поставлен лайк' : 'Поставлен дизлайк',
      );
    } catch (e) {
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
    await this.feedUi.showNext(ctx, me._id as unknown as Types.ObjectId);
  }

  @Action(/^like_reply:(accept|reject):(?<id>[a-fA-F0-9]{24})$/)
  async onLikeReply(@Ctx() ctx: MyContext) {
    const me = await this.ctxService.requireCurrentUser(ctx);
    if (!me) return;
    const groupsId = this.parseObjectIdFromMatch(ctx);
    const match = ctx.match as unknown as RegExpMatchArray & {
      1?: 'accept' | 'reject';
    };
    const kind = (match?.[1] as 'accept' | 'reject') ?? 'accept';
    if (!groupsId) return;

    if (kind === 'accept') {
      const { match: isMatch } = (await this.feedService.react(
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

  @Action('profile')
  async profileFromMenu(@Ctx() ctx: MyContext) {
    return this.botService.handleProfile(ctx);
  }
}
