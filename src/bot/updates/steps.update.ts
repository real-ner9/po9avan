import { Update, Hears, Ctx } from 'nestjs-telegraf';
import { MyContext } from '../types/my-context';
import { StepsService } from '../steps.service';
import { EditProfileService } from '../edit-profile.service';

@Update()
export class StepsUpdate {
  constructor(
    private readonly stepsService: StepsService,
    private readonly editService: EditProfileService,
  ) {}

  @Hears(/.*/)
  async onStep(@Ctx() ctx: MyContext) {
    const step = ctx.session?.step;
    if (step === 'editNickname') {
      await this.editService.applyNickname(ctx);
      ctx.session.step = undefined;
      return;
    }
    if (step === 'editAbout') {
      await this.editService.applyAbout(ctx);
      ctx.session.step = undefined;
      return;
    }
    await this.stepsService.onStepHandler(ctx);
  }
}


