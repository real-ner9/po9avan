import { Injectable } from '@nestjs/common';
import { MyContext } from './types/my-context';
import { UserService } from '../user/user.service';
import { ERRORS } from '../common/constants/errors';
import { formatUserProfile } from '../common/utils/formatters';
import { CALLBACKS } from '../common/constants/callbacks';
import { REG_STEPS } from '../common/constants/steps';
import { sanitizePlainText } from '../common/utils/sanitize';
import { ProfessionService } from '../catalogs/profession/profession.service';
import { REPLIES } from '../common/constants/replies';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userService: UserService,
    private readonly professionService: ProfessionService,
  ) {}
  private professionRegExp = /^prof:(?<id>[a-fA-F0-9]{24})\b/;

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
          // [
          //   {
          //     text: '📷 Изменить фото',
          //     callback_data: CALLBACKS.PROFILE_EDIT_AVATAR,
          //   },
          // ],
          [
            {
              text: '✏️ Изменить ник',
              callback_data: CALLBACKS.PROFILE_EDIT_NICKNAME,
            },
          ],
          [
            {
              text: 'Изменить профессию',
              callback_data: CALLBACKS.PROFILE_EDIT_PROFESSION,
            },
          ],
          [
            {
              text: 'Изменить целевую профессию',
              callback_data: CALLBACKS.PROFILE_EDIT_TARGET_PROFESSION,
            },
          ],
          [
            {
              text: 'Изменить опыт работы (лол)',
              callback_data: CALLBACKS.PROFILE_EDIT_EXPERIENCE,
            },
          ],
          [
            {
              text: '📄 Изменить «О себе»',
              callback_data: CALLBACKS.PROFILE_EDIT_ABOUT,
            },
          ],
          // [
          //   {
          //     text: '🔁 Заполнить заново',
          //     callback_data: CALLBACKS.PROFILE_REFILL,
          //   },
          // ],
        ],
      },
    });
    return;
  }

  async startEditNickname(ctx: MyContext) {
    ctx.session.step = REG_STEPS.EDIT_NICKNAME;
    await ctx.reply('Введите новый ник (до 24 символов):');
  }

  async startEditAbout(ctx: MyContext) {
    ctx.session.step = REG_STEPS.EDIT_ABOUT;
    await ctx.reply('Введите новый текст «О себе» (до 400 символов):');
  }

  async startEditProfession(ctx: MyContext) {
    ctx.session.step = REG_STEPS.EDIT_PROFESSION;
    await ctx.reply('Выберите новую профессию через inline-поиск:', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🔎 Выбрать из каталога',
              switch_inline_query_current_chat: '',
            },
          ],
        ],
      },
    });
  }

  async startEditTargetProfession(ctx: MyContext) {
    ctx.session.step = REG_STEPS.EDIT_TARGET_PROFESSION;
    await ctx.reply('Выберите новую целевую профессию через inline-поиск:', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🔎 Выбрать из каталога',
              switch_inline_query_current_chat: '',
            },
          ],
        ],
      },
    });
  }

  async startEditExperience(ctx: MyContext) {
    ctx.session.step = REG_STEPS.EDIT_EXPERIENCE;
    await ctx.reply('Введите новый стаж (1–13):');
  }

  async startEditAvatar(ctx: MyContext) {
    // Заглушка: не входим в шаг, сразу сообщаем и возвращаемся в профиль
    await ctx.reply('Заглушка: редактирование аватара пока недоступно.');
    await this.handleProfile(ctx);
  }

  // Обработчики шагов
  async handleEditNickname(ctx: MyContext, text: string) {
    const nickname = sanitizePlainText(text.trim(), 24);
    const telegramId = ctx.from?.id?.toString();
    await this.userService.updateByTelegramId(telegramId, { nickname });
    await ctx.reply('✅ Ник обновлён.');
    ctx.session.step = undefined;
    await this.handleProfile(ctx);
  }

  async handleEditAbout(ctx: MyContext, text: string) {
    const about = sanitizePlainText(text, 400);
    if (about.length > 400) {
      await ctx.reply(ERRORS.ABOUT_TOO_LONG);
      return;
    }
    const telegramId = ctx.from?.id?.toString();
    await this.userService.updateByTelegramId(telegramId, { about });
    await ctx.reply('✅ Текст «О себе» обновлён.');
    ctx.session.step = undefined;
    await this.handleProfile(ctx);
  }

  async handleEditProfession(ctx: MyContext, text: string) {
    const match = text.match(this.professionRegExp);
    if (!match?.groups?.id) {
      await ctx.reply(REPLIES.NOTIFICATION.FOLLOW_INSTRUCTIONS);
      return;
    }
    const profession = await this.professionService.findById(match.groups.id);
    if (!profession) {
      await ctx.reply(ERRORS.PROFESSION_NOT_FOUND);
      return;
    }
    const telegramId = ctx.from?.id?.toString();
    const userModel = this.userService.getUserModel();
    await userModel
      .updateOne({ telegramId }, { $set: { profession } })
      .exec();
    await ctx.reply('✅ Профессия обновлена.');
    ctx.session.step = undefined;
    await this.handleProfile(ctx);
  }

  async handleEditTargetProfession(ctx: MyContext, text: string) {
    const match = text.match(this.professionRegExp);
    if (!match?.groups?.id) {
      await ctx.reply(REPLIES.NOTIFICATION.FOLLOW_INSTRUCTIONS);
      return;
    }
    const targetProfession = await this.professionService.findById(
      match.groups.id,
    );
    if (!targetProfession) {
      await ctx.reply(ERRORS.PROFESSION_NOT_FOUND);
      return;
    }
    const telegramId = ctx.from?.id?.toString();
    const userModel = this.userService.getUserModel();
    await userModel
      .updateOne({ telegramId }, { $set: { targetProfession } })
      .exec();
    await ctx.reply('✅ Целевая профессия обновлена.');
    ctx.session.step = undefined;
    await this.handleProfile(ctx);
  }

  async handleEditExperience(ctx: MyContext, text: string) {
    const value = Number(text.trim());
    if (!Number.isFinite(value) || value < 1 || value > 13) {
      await ctx.reply(ERRORS.EXPERIENCE_INVALID);
      return;
    }
    const telegramId = ctx.from?.id?.toString();
    const userModel = this.userService.getUserModel();
    await userModel
      .updateOne({ telegramId }, { $set: { experienceYears: value } })
      .exec();
    await ctx.reply('✅ Стаж обновлён.');
    ctx.session.step = undefined;
    await this.handleProfile(ctx);
  }
}
