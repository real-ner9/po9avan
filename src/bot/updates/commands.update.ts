import { Update, Start, Action, Command, Ctx } from 'nestjs-telegraf';
import { MyContext } from '../types/my-context';
import { AuthService } from '../auth.service';
import { BotService } from '../bot.service';
import { FeedUiService } from '../feed-ui.service';
import { BotContextService } from '../bot-context.service';
import { MatchService } from '../../match/match.service';
import { UserService } from '../../user/user.service';
import { InlineKeyboardMarkup } from '@telegraf/types/markup';
import { formatUserProfile } from '../../common/utils/formatters';
import { Types } from 'mongoose';

@Update()
export class CommandsUpdate {
  constructor(
    private readonly authService: AuthService,
    private readonly botService: BotService,
    private readonly feedUi: FeedUiService,
    private readonly ctxService: BotContextService,
    private readonly matchService: MatchService,
    private readonly userService: UserService,
  ) {}

  @Start()
  @Action('start')
  async onStart(@Ctx() ctx: MyContext) {
    return this.authService.handleStart(ctx);
  }

  @Command('profile')
  async onMenuProfile(@Ctx() ctx: MyContext) {
    return this.botService.handleProfile(ctx);
  }

  @Command('feed')
  async onMenuFeed(@Ctx() ctx: MyContext) {
    const me = await this.ctxService.requireCurrentUser(ctx);
    if (!me) return;
    await this.feedUi.showNext(ctx, me._id as unknown as Types.ObjectId);
  }

  @Command('matches')
  async onMenuMatches(@Ctx() ctx: MyContext) {
    const me = await this.ctxService.requireCurrentUser(ctx);
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
}


