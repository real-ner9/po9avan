import { Update, Action, Ctx, Command } from 'nestjs-telegraf';
import { MyContext } from '../types/my-context';
import { MatchUiService } from '../match-ui.service';
import { COMMANDS } from '../../common/constants/commands';
import { CALLBACKS } from '../../common/constants/callbacks';

@Update()
export class MatchUpdate {
  constructor(private readonly matchUi: MatchUiService) {}

  @Command(COMMANDS.MATCHES)
  async onMenuMatches(@Ctx() ctx: MyContext) {
    await this.matchUi.showList(ctx);
  }

  @Action(new RegExp(`^${CALLBACKS.MATCH_OPEN}:(?<id>[a-fA-F0-9]{24})$`))
  async onOpen(@Ctx() ctx: MyContext) {
    await this.matchUi.handleOpenMatch(ctx);
  }

  @Action(new RegExp(`^${CALLBACKS.MATCHES_PREV}$`))
  async onPrev(@Ctx() ctx: MyContext) {
    await this.matchUi.handlePrev(ctx);
  }

  @Action(new RegExp(`^${CALLBACKS.MATCHES_NEXT}$`))
  async onNext(@Ctx() ctx: MyContext) {
    await this.matchUi.handleNext(ctx);
  }

  @Action(new RegExp('^noop$'))
  async onNoop(@Ctx() ctx: MyContext) {
    try {
      await ctx.answerCbQuery();
    } catch {}
  }
}
