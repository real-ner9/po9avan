import { Injectable } from '@nestjs/common';
import { MyContext } from './types/my-context';
import { UserService } from '../user/user.service';
import { ERRORS } from '../common/constants/errors';
import { UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class BotContextService {
  constructor(private readonly userService: UserService) {}

  async getCurrentUser(ctx: MyContext): Promise<UserDocument | null> {
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

  async requireCurrentUser(ctx: MyContext): Promise<UserDocument | null> {
    const me = await this.getCurrentUser(ctx);
    if (!me) return null;
    return me;
  }
}

