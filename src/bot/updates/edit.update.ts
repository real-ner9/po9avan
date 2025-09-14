import { Update, Action, Ctx } from 'nestjs-telegraf';
import { MyContext } from '../types/my-context';
import { EditProfileService } from '../edit-profile.service';
import { BotContextService } from '../bot-context.service';
import { FeedUiService } from '../feed-ui.service';
import { AuthService } from '../auth.service';

@Update()
export class EditUpdate {
  constructor(
    private readonly editService: EditProfileService,
    private readonly ctxService: BotContextService,
    private readonly feedUi: FeedUiService,
    private readonly authService: AuthService,
  ) {}

  // Кнопки уже показываются в BotService.handleProfile вместе с профилем

  @Action('profile_edit_nickname')
  async editNickname(@Ctx() ctx: MyContext) {
    await this.editService.startEditNickname(ctx);
  }

  @Action('profile_edit_about')
  async editAbout(@Ctx() ctx: MyContext) {
    await this.editService.startEditAbout(ctx);
  }

  @Action('profile_feed')
  async profileFeed(@Ctx() ctx: MyContext) {
    const me = await this.ctxService.requireCurrentUser(ctx);
    if (!me) return;
    await this.feedUi.showNext(ctx, me._id as any);
  }

  @Action('profile_refill')
  async profileRefill(@Ctx() ctx: MyContext) {
    // Сбрасываем анкету: удаляем пользователя и запускаем регистрацию заново
    const telegramId = ctx.from?.id?.toString();
    if (!telegramId) return;
    try {
      await this.ctxService['userService']?.getModel()?.deleteOne({ telegramId });
    } catch {}
    // Флаг рефилла (если пригодится для аналитики)
    ctx.session.isRefill = true;
    await ctx.answerCbQuery('Начинаем заново');
    await this.authService.startRegistration(ctx);
  }
}