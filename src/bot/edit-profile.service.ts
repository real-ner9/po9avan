import { Injectable } from '@nestjs/common';
import { MyContext } from './types/my-context';
import { UserService } from '../user/user.service';

@Injectable()
export class EditProfileService {
  constructor(private readonly userService: UserService) {}

  async startEditNickname(ctx: MyContext) {
    ctx.session.step = 'editNickname';
    await ctx.reply('Введите новый ник (до 24 символов):');
  }

  async startEditAbout(ctx: MyContext) {
    ctx.session.step = 'editAbout';
    await ctx.reply('Введите новый текст «О себе» (до 400 символов):');
  }

  async applyNickname(ctx: MyContext) {
    const telegramId = ctx.from?.id?.toString();
    const text = 'text' in (ctx.message || {}) ? (ctx.message as any).text : '';
    if (!telegramId) return;
    await this.userService.updateNicknameByTelegramId(telegramId, text);
    await ctx.reply('✅ Ник обновлён.');
  }

  async applyAbout(ctx: MyContext) {
    const telegramId = ctx.from?.id?.toString();
    const text = 'text' in (ctx.message || {}) ? (ctx.message as any).text : '';
    if (!telegramId) return;
    await this.userService.updateAboutByTelegramId(telegramId, text);
    await ctx.reply('✅ Текст «О себе» обновлён.');
  }
}


