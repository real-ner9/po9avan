import { Update, Ctx, Command } from 'nestjs-telegraf';
import { MyContext } from '../types/my-context';
import { COMMANDS } from '../../common/constants/commands';
import { MatchService } from '../../match/match.service';
import { UserService } from '../../user/user.service';
import { UserDocument } from '../../user/schemas/user.schema';
import { formatUserProfile } from '../../common/utils/formatters';
import { MatchesUiService } from '../matches-ui.service';

@Update()
export class MatchUpdate {
  constructor(
    private readonly matchesUiService: MatchesUiService,
    private readonly userService: UserService,
  ) {}

  @Command(COMMANDS.MATCHES)
  async onMatches(@Ctx() ctx: MyContext) {
    await this.matchesUiService.handleMatches(ctx);
  }
}
