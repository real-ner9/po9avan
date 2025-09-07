import { Injectable } from '@nestjs/common';
import { MyContext } from './types/my-context';
import { AuthService } from './auth.service';
import { REPLIES } from '../common/constants/replies';
import { ProfessionService } from '../catalogs/profession/profession.service';

@Injectable()
export class StepsService {
  constructor(
    private readonly authService: AuthService,
    private readonly professionService: ProfessionService,
  ) {}

  async onStepHandler(ctx: MyContext) {
    if (!ctx.session || !ctx.message || !('text' in ctx.message)) return;
    const step = ctx.session.step;
    const text = ctx.message.text
      .trim()
      .replace(/^@\S+\s+/, '')
      .trim();

    if (!text || !step) return;

    switch (step) {
      case 'profession': {
        await this.authService.handleProfessionStep(ctx, text);
        break;
      }
      case 'targetProfession': {
        await this.authService.handleTargetProfessionStep(ctx, text);
        break;
      }
      case 'experienceYears': {
        await this.authService.handleExperienceYearsStep(ctx, text);
        break;
      }
      case 'about': {
        await this.authService.handleAboutStep(ctx, text);
        break;
      }
      case 'confirm': {
        await this.authService.handleConfirmStep(ctx, text);
        break;
      }
      default:
        await ctx.reply(REPLIES.NOTIFICATION.FOLLOW_INSTRUCTIONS);
        break;
    }
  }
}
