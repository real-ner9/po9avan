import { Injectable } from '@nestjs/common';
import { MyContext } from './types/my-context';
import { UserService } from '../user/user.service';
import { ERRORS } from '../common/constants/errors';
import { formatUserProfile } from '../common/utils/formatters';
import { CALLBACKS } from '../common/constants/callbacks';

@Injectable()
export class BotService {
  constructor(private readonly userService: UserService) {}

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
          [
            {
              text: '📰 Смотреть анкеты',
              callback_data: CALLBACKS.PROFILE_FEED,
            },
          ],
          [
            {
              text: '✏️ Изменить ник',
              callback_data: CALLBACKS.PROFILE_EDIT_NICKNAME,
            },
            {
              text: '📷 Изменить фото',
              callback_data: CALLBACKS.PROFILE_EDIT_AVATAR,
            },
          ],
          [
            {
              text: '📄 Изменить «О себе»',
              callback_data: CALLBACKS.PROFILE_EDIT_ABOUT,
            },
          ],
          [
            {
              text: '🔁 Заполнить заново',
              callback_data: CALLBACKS.PROFILE_REFILL,
            },
          ],
        ],
      },
    });
    return;
  }
}
