import { Injectable, Logger } from '@nestjs/common';
import { MyContext } from './types/my-context';
import { UserService } from '../user/user.service';
import { ERRORS } from '../common/constants/errors';
import { MenuService } from './menu.service';
import { formatUserProfile } from '../common/utils/formatters';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(
    private readonly userService: UserService,
    private readonly menuService: MenuService,
  ) {}
  async handleProfile(ctx: MyContext) {
    const telegramId = ctx.from?.id?.toString();
    if (!telegramId) {
      await ctx.reply(ERRORS.USER_NOT_FOUND);
      return;
    }

    const user = await this.userService.findByTelegramId(telegramId);
    if (!user) {
      await ctx.reply(ERRORS.USER_NOT_FOUND);
      return;
    }

    await ctx.reply(formatUserProfile(user));
    await this.menuService.handleEditMenu(ctx, user);
    return;
  }
}
