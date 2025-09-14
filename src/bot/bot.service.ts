import { Injectable } from '@nestjs/common';
import { MyContext } from './types/my-context';
import { UserService } from '../user/user.service';
import { ERRORS } from '../common/constants/errors';
import { formatUserProfile } from '../common/utils/formatters';

@Injectable()
export class BotService {
  constructor(
    private readonly userService: UserService,
  ) {}

  async handleProfile(ctx: MyContext) {
    const telegramId = ctx.from?.id?.toString();
    const user = await this.userService.findByTelegramId(telegramId);
    if (!user) {
      await ctx.reply(ERRORS.USER_NOT_FOUND);
      return;
    }

    await ctx.reply(formatUserProfile(user), {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📰 Смотреть анкеты', callback_data: 'profile_feed' }],
          [
            { text: '✏️ Изменить ник', callback_data: 'profile_edit_nickname' },
            {
              text: '📄 Изменить «О себе»',
              callback_data: 'profile_edit_about',
            },
          ],
          [{ text: '🔁 Заполнить заново', callback_data: 'profile_refill' }],
        ],
      },
    });
    return;
  }
}
