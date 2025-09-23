import { Injectable } from '@nestjs/common';
import { MyContext } from './types/my-context';
import { AuthService } from './auth.service';
import { REPLIES } from '../common/constants/replies';
import { REG_STEPS } from '../common/constants/steps';

@Injectable()
export class StepsService {
  constructor(private readonly authService: AuthService) {}

  async onStepHandler(ctx: MyContext) {
    if (!ctx.session || !ctx.message || !('text' in ctx.message)) return;
    const step = ctx.session.step;
    const text = ctx.message.text
      .trim()
      .replace(/^@\S+\s+/, '')
      .trim();

    if (!text || !step) return;

    switch (step) {
      // auth
      case REG_STEPS.NICKNAME: {
        await this.authService.handleNicknameStep(ctx, text);
        break;
      }
      case REG_STEPS.PROFESSION: {
        await this.authService.handleProfessionStep(ctx, text);
        break;
      }
      case REG_STEPS.TARGET_PROFESSION: {
        await this.authService.handleTargetProfessionStep(ctx, text);
        break;
      }
      case REG_STEPS.EXPERIENCE_YEARS: {
        await this.authService.handleExperienceYearsStep(ctx, text);
        break;
      }
      case REG_STEPS.ABOUT: {
        await this.authService.handleAboutStep(ctx, text);
        break;
      }
      case REG_STEPS.AVATAR: {
        await this.authService.handleAvatarStep(ctx);
        break;
      }
      case REG_STEPS.CONFIRM: {
        await this.authService.handleConfirmStep(ctx, text);
        break;
      }
      default:
        await ctx.reply(REPLIES.NOTIFICATION.FOLLOW_INSTRUCTIONS);
        break;
    }
  }
}
