import { Injectable } from '@nestjs/common';
import { MyContext, RegistrationDraft } from './types/my-context';
import { UserService } from '../user/user.service';
import { MenuService } from './menu.service';
import { REPLIES } from '../common/constants/replies';
import { ERRORS } from '../common/constants/errors';
import { ProfessionService } from '../catalogs/profession/profession.service';
import { formatUserProfile } from '../common/utils/formatters';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly menuService: MenuService,
    private readonly professionService: ProfessionService,
  ) {}

  async handleStart(ctx: MyContext) {
    const telegramId = ctx.from?.id?.toString();
    if (!telegramId) return;

    const existing = await this.userService.findByTelegramId(telegramId);
    if (existing) {
      await ctx.reply(formatUserProfile(existing));
      return;
    }

    // init session for registration
    ctx.session = ctx.session ?? {};
    ctx.session.data = {
      telegramId,
      username: ctx.from?.username ?? undefined,
    };
    ctx.session.step = 'profession';
    await ctx.reply(REPLIES.REGISTRATION.INTRO);
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

  async handleProfessionStep(ctx: MyContext, text: string) {
    const match = text.match(/^prof:(?<id>[a-fA-F0-9]{24})\b/);
    if (!match?.groups?.id) {
      await ctx.reply(REPLIES.NOTIFICATION.FOLLOW_INSTRUCTIONS);
      return;
    }
    ctx.session.data.profession = match.groups.id;
    ctx.session.step = 'targetProfession';

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
    const match = text.match(/^prof:(?<id>[a-fA-F0-9]{24})\b/);
    if (!match?.groups?.id) {
      await ctx.reply(REPLIES.NOTIFICATION.FOLLOW_INSTRUCTIONS);
      return;
    }
    ctx.session.data.targetProfession = match.groups.id;
    ctx.session.step = 'experienceYears';
    await ctx.reply(REPLIES.REGISTRATION.EXPERIENCE);
  }

  async handleExperienceYearsStep(ctx: MyContext, text: string) {
    const value = Number(text.trim());
    if (!Number.isFinite(value) || value < 1 || value > 13) {
      await ctx.reply(REPLIES.REGISTRATION.EXPERIENCE_INVALID);
      return;
    }
    ctx.session.data.experienceYears = value;
    ctx.session.step = 'about';
    await ctx.reply(REPLIES.REGISTRATION.ABOUT);
  }

  async handleAboutStep(ctx: MyContext, text: string) {
    const about = text.trim();
    if (about.length > 400) {
      await ctx.reply(REPLIES.REGISTRATION.ABOUT_TOO_LONG);
      return;
    }
    ctx.session.data.about = about;
    const profession = await this.professionService.findById(
      ctx.session.data.profession,
    );
    const targetProfession = await this.professionService.findById(
      ctx.session.data.targetProfession,
    );
    if (!profession || !targetProfession) {
      await ctx.reply(ERRORS.PROFESSION_NOT_FOUND);
      return this.exitSession(ctx);
    }
    await ctx.reply(
      formatUserProfile({
        ...ctx.session.data,
        profession: profession.name,
        targetProfession: targetProfession.name,
      }),
    );
    ctx.session.step = 'confirm';
    await ctx.reply(REPLIES.REGISTRATION.CONFIRM_INTRO);
  }

  async handleConfirmStep(ctx: MyContext, text: string) {
    if (text.toLowerCase() === 'да') {
      await this.confirmSession(ctx);
    } else {
      return this.exitSession(ctx);
    }
  }

  private async confirmSession(ctx: MyContext) {
    const data = ctx.session.data;
    if (!data) {
      return this.exitSession(ctx);
    }
    try {
      await this.userService.createUser(data as RegistrationDraft);
      await ctx.reply(REPLIES.REGISTRATION.SAVED);
    } catch (error) {
      await ctx.reply(
        '❌ Ошибка при сохранении данных. Пожалуйста, попробуйте ещё раз.',
      );
      console.log(error);
    }
    ctx.session.step = undefined;
    ctx.session.data = {};
  }

  private async exitSession(ctx: MyContext) {
    await ctx.reply(REPLIES.NOTIFICATION.EXIT);
    ctx.session.step = undefined;
    ctx.session.data = {};
    return;
  }
}
