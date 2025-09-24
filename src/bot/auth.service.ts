import { Injectable } from '@nestjs/common';
import { MyContext, RegistrationDraft } from './types/my-context';
import { UserService } from '../user/user.service';
import { REPLIES } from '../common/constants/replies';
import { ERRORS } from '../common/constants/errors';
import { ProfessionService } from '../catalogs/profession/profession.service';
import { formatUserProfile } from '../common/utils/formatters';
import { generateNickname, sanitizePlainText } from '../common/utils/sanitize';
import { CALLBACKS } from '../common/constants/callbacks';
import { REG_STEPS } from '../common/constants/steps';
import { ProfileService } from './profile.service';
import { NO, YES } from '../common/constants/commands';

// no aliasing to keep style consistent

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly professionService: ProfessionService,
    private readonly botService: ProfileService,
  ) {}
  private professionRegExp = /^prof:(?<id>[a-fA-F0-9]{24})\b/;

  async handleStart(ctx: MyContext) {
    try {
      const telegramId = ctx.from?.id?.toString();
      if (!telegramId) {
        await ctx.reply('❌ Не удалось получить данные пользователя.');
        return;
      }

      const existing = await this.userService.findByTelegramId(telegramId);
      if (existing) {
        await ctx.reply(formatUserProfile(existing));
        return;
      }

      await this.startRegistration(ctx);
    } catch (error) {
      console.error('Error in handleStart:', error);
      await ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
    }
  }

  async startRegistration(ctx: MyContext) {
    // init session for registration
    ctx.session = ctx.session ?? {};
    ctx.session.data = {
      telegramId: ctx.from?.id?.toString() || '',
      username: ctx.from?.username ?? undefined,
    };
    ctx.session.step = REG_STEPS.NICKNAME;
    await ctx.reply(REPLIES.REGISTRATION.INTRO);
    await ctx.reply(REPLIES.REGISTRATION.NICKNAME);
  }

  async handleNicknameStep(ctx: MyContext, text: string) {
    const raw = text.trim();
    const nickname =
      sanitizePlainText(raw, 24) || generateNickname(ctx.from?.username);
    ctx.session.data.nickname = nickname;
    ctx.session.step = REG_STEPS.PROFESSION;
    await ctx.reply(`Отлично! Никнейм: ${nickname}`);
    await ctx.reply(REPLIES.REGISTRATION.PROFESSION);
    await ctx.reply(REPLIES.NOTIFICATION.SEARCH, {
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

  // ПРОФЕССИЯ/ МБ ПОТОМ НОРМ СДЕЛАЮ ЩА ЛЕНЬ
  async handleProfessionStep(ctx: MyContext, text: string) {
    const match = text.match(this.professionRegExp);
    if (!match?.groups?.id) {
      await ctx.reply(REPLIES.NOTIFICATION.FOLLOW_INSTRUCTIONS);
      return;
    }
    ctx.session.data.profession = match.groups.id;
    ctx.session.step = REG_STEPS.TARGET_PROFESSION;

    await ctx.reply(REPLIES.REGISTRATION.TARGET_PROFESSION);
    await ctx.reply(REPLIES.NOTIFICATION.SEARCH, {
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
  async handleTargetProfessionStep(ctx: MyContext, text: string) {
    const match = text.match(this.professionRegExp);
    if (!match?.groups?.id) {
      await ctx.reply(REPLIES.NOTIFICATION.FOLLOW_INSTRUCTIONS);
      return;
    }
    ctx.session.data.targetProfession = match.groups.id;
    ctx.session.step = REG_STEPS.EXPERIENCE_YEARS;
    await ctx.reply(REPLIES.REGISTRATION.EXPERIENCE);
  }

  async handleExperienceYearsStep(ctx: MyContext, text: string) {
    const value = Number(text.trim());
    if (!Number.isFinite(value) || value < 1 || value > 13) {
      await ctx.reply(ERRORS.EXPERIENCE_INVALID);
      return;
    }
    ctx.session.data.experienceYears = value;
    ctx.session.step = REG_STEPS.ABOUT;
    await ctx.reply(REPLIES.REGISTRATION.ABOUT);
  }

  async handleAboutStep(ctx: MyContext, text: string) {
    const about = sanitizePlainText(text, 400);
    if (about.length > 400) {
      await ctx.reply(ERRORS.ABOUT_TOO_LONG);
      return;
    }
    ctx.session.data.about = about;
    ctx.session.step = REG_STEPS.CONFIRM;
    await ctx.reply(REPLIES.REGISTRATION.AVATAR, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Пропустить',
              callback_data: CALLBACKS.SKIP_AVATAR,
            },
          ],
        ],
      },
    });
  }

  async handleConfirmStep(ctx: MyContext, text: string) {
    if (text.toLowerCase() === YES) {
      return this.confirmSession(ctx);
    }
    if (text.toLowerCase() === NO) {
      await ctx.reply(REPLIES.NOTIFICATION.EXIT);
      return this.exitSession(ctx);
    }
    await ctx.reply(REPLIES.NOTIFICATION.FOLLOW_INSTRUCTIONS);
    return;
  }

  private async confirmSession(ctx: MyContext) {
    await this.userService.createUser(ctx.session.data as RegistrationDraft);
    await ctx.reply(REPLIES.REGISTRATION.SAVED);
    await this.botService.handleProfile(ctx);
    this.exitSession(ctx);
  }

  private exitSession(ctx: MyContext) {
    ctx.session.step = undefined;
    ctx.session.data = {};
    return;
  }
}
