import { Update, Hears, Ctx } from 'nestjs-telegraf';
import { MyContext } from '../types/my-context';
import { StepsService } from '../steps.service';

@Update()
export class StepsUpdate {
  constructor(private readonly stepsService: StepsService) {}

  @Hears(/.*/)
  async onStep(@Ctx() ctx: MyContext) {
    await this.stepsService.onStepHandler(ctx);
  }
}
