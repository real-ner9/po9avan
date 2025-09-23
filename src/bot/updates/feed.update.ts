import { Update, Action, Ctx, Command } from 'nestjs-telegraf';
import { MyContext } from '../types/my-context';
import { FeedUiService } from '../feed-ui.service';
import { COMMANDS } from '../../common/constants/commands';
import { CALLBACKS } from '../../common/constants/callbacks';

@Update()
export class FeedUpdate {
  constructor(private readonly feedUi: FeedUiService) {}

  @Command(COMMANDS.FEED)
  async onMenuFeed(@Ctx() ctx: MyContext) {
    await this.feedUi.showNext(ctx);
  }

  @Action(
    new RegExp(
      `^(${CALLBACKS.FEED_LIKE}|${CALLBACKS.FEED_DISLIKE}):(?<id>[a-fA-F0-9]{24})$`,
    ),
  )
  async onFeedReaction(@Ctx() ctx: MyContext) {
    await this.feedUi.handleFeedReaction(ctx);
  }
}
