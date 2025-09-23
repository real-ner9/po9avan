import { Update, Start, Ctx, On, Command, Action } from 'nestjs-telegraf';
import { AuthService } from '../auth.service';
import { MyContext } from '../types/my-context';
import { ProfessionService } from '../../catalogs/profession/profession.service';
import { InlineQueryResultArticle } from '@telegraf/types';
import { BotService } from '../bot.service';
import { COMMANDS } from '../../common/constants/commands';
import { CALLBACKS } from '../../common/constants/callbacks';

const CACHE_TIME_SEC = 1;

@Update()
export class UserUpdate {
  constructor(
    private readonly authService: AuthService,
    private readonly professionService: ProfessionService,
    private readonly botService: BotService,
  ) {}
  @Start()
  async onStart(@Ctx() ctx: MyContext) {
    return this.authService.handleStart(ctx);
  }

  @Command(COMMANDS.PROFILE)
  async onMenuProfile(@Ctx() ctx: MyContext) {
    return this.botService.handleProfile(ctx);
  }

  @On('inline_query')
  async onInlineQuery(@Ctx() ctx: MyContext) {
    const query = ctx?.inlineQuery?.query;
    const profs = await this.professionService.search(query);
    const results: InlineQueryResultArticle[] = profs.map((p) => ({
      type: 'article',
      id: `prof-${p._id}`,
      title: p.name,
      input_message_content: {
         message_text: `prof:${p._id}`,
      },
    }));

    await ctx.answerInlineQuery(results, {
      cache_time: CACHE_TIME_SEC,
    });
  }

  @Action(CALLBACKS.SKIP_AVATAR)
  async onSkipAvatar(@Ctx() ctx: MyContext) {
    await this.authService.handleAvatarStepEnd(ctx);
  }
}
