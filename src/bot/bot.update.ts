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
  ) {}

  @Start()
  @Action('start')
  async onStart(@Ctx() ctx: MyContext) {
    return this.authService.handleStart(ctx);
  }

  @Command('menu')
  async showMenu(@Ctx() ctx: MyContext) {
    return this.menuService.handleMenu(ctx);
  }

  // reverted mentor search handlers

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
