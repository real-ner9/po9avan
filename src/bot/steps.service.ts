import { Injectable } from '@nestjs/common';
import { MyContext } from './types/my-context';
import { AuthService } from './auth.service';
import { REPLIES } from '../common/constants/replies';
import { REG_STEPS } from '../common/constants/steps';
import { ProfileService } from './profile.service';

@Injectable()
export class StepsService {
  constructor(
    private readonly authService: AuthService,
    private readonly profileService: ProfileService,
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
      case REG_STEPS.CONFIRM: {
        await this.authService.handleConfirmStep(ctx, text);
        break;
      }
      // edit profile
      case REG_STEPS.EDIT_NICKNAME: {
        await this.profileService.handleEditNickname(ctx, text);
        break;
      }
      case REG_STEPS.EDIT_ABOUT: {
        await this.profileService.handleEditAbout(ctx, text);
        break;
      }
      case REG_STEPS.EDIT_PROFESSION: {
        await this.profileService.handleEditProfession(ctx, text);
        break;
      }
      case REG_STEPS.EDIT_TARGET_PROFESSION: {
        await this.profileService.handleEditTargetProfession(ctx, text);
        break;
      }
      case REG_STEPS.EDIT_EXPERIENCE: {
        await this.profileService.handleEditExperience(ctx, text);
        break;
      }
      default:
        await ctx.reply(REPLIES.NOTIFICATION.FOLLOW_INSTRUCTIONS);
        break;
    }
  }
}
