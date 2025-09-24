import { Update, Start, Ctx, On, Command, Action } from 'nestjs-telegraf';
import { AuthService } from '../auth.service';
import { MyContext } from '../types/my-context';
import { ProfessionService } from '../../catalogs/profession/profession.service';
import { InlineQueryResultArticle } from '@telegraf/types';
import { ProfileService } from '../profile.service';
import { COMMANDS } from '../../common/constants/commands';
import { CALLBACKS } from '../../common/constants/callbacks';
import { REG_STEPS } from '../../common/constants/steps';
import { REPLIES } from '../../common/constants/replies';

const CACHE_TIME_SEC = 1;

@Update()
export class ProfileUpdate {
  constructor(
    private readonly authService: AuthService,
    private readonly profileService: ProfileService,
    private readonly professionService: ProfessionService,
    private readonly botService: ProfileService,
  ) {}
  @Start()
  async onStart(@Ctx() ctx: MyContext) {
    return this.authService.handleStart(ctx);
  }

  @Command(COMMANDS.PROFILE)
  async onMenuProfile(@Ctx() ctx: MyContext) {
    return this.botService.handleProfile(ctx);
  }

  @On('inline_query')
  async onInlineQuery(@Ctx() ctx: MyContext) {
    const query = ctx?.inlineQuery?.query;
    const profs = await this.professionService.search(query);
    const results: InlineQueryResultArticle[] = profs.map((p) => ({
      type: 'article',
      id: `prof-${p._id}`,
      title: p.name,
      input_message_content: {
        message_text: `prof:${p._id} ${p.name}`,
      },
    }));

    await ctx.answerInlineQuery(results, {
      cache_time: CACHE_TIME_SEC,
    });
  }

  // Обработчик chosen_inline_result не нужен — логика в StepsService по тексту "prof:..."

  @Action(CALLBACKS.PROFILE_EDIT_NICKNAME)
  async onEditNickname(@Ctx() ctx: MyContext) {
    await this.profileService.startEditNickname(ctx);
  }

  @Action(CALLBACKS.PROFILE_EDIT_ABOUT)
  async onEditAbout(@Ctx() ctx: MyContext) {
    await this.profileService.startEditAbout(ctx);
  }

  @Action(CALLBACKS.PROFILE_EDIT_PROFESSION)
  async onEditProfession(@Ctx() ctx: MyContext) {
    await this.profileService.startEditProfession(ctx);
  }

  @Action(CALLBACKS.PROFILE_EDIT_TARGET_PROFESSION)
  async onEditTargetProfession(@Ctx() ctx: MyContext) {
    await this.profileService.startEditTargetProfession(ctx);
  }

  @Action(CALLBACKS.PROFILE_EDIT_EXPERIENCE)
  async onEditExperience(@Ctx() ctx: MyContext) {
    await this.profileService.startEditExperience(ctx);
  }

  @Action(CALLBACKS.PROFILE_EDIT_AVATAR)
  async onEditAvatar(@Ctx() ctx: MyContext) {
    await this.profileService.startEditAvatar(ctx);
  }

  @Action(CALLBACKS.PROFILE_REFILL)
  async onRefill(@Ctx() ctx: MyContext) {
    await this.authService.startRegistration(ctx);
  }
}
