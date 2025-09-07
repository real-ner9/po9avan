import { Injectable } from '@nestjs/common';
import { MyContext } from './types/my-context';
import { UserService } from '../user/user.service';
import { InlineKeyboardMarkup } from '@telegraf/types/markup';
import { UserDocument } from '../user/schemas/user.schema';
import { ERRORS } from '../common/constants/errors';

@Injectable()
export class MenuService {
  constructor(private readonly userService: UserService) {}

  async handleMenu(ctx: MyContext) {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) {
      await ctx.reply(ERRORS.USER_NOT_FOUND);
      return;
    }
    const keyboard: InlineKeyboardMarkup['inline_keyboard'] = [];
    await ctx.reply('📋 Главное меню', {
      reply_markup: { inline_keyboard: keyboard },
    });
    return;
  }

  async handleEditMenu(ctx: MyContext, user: UserDocument) {
    const keyboard: InlineKeyboardMarkup['inline_keyboard'] = [];

    await ctx.reply('🔧 Редактирование профиля', {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }
}
