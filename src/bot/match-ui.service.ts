import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { InlineKeyboardMarkup } from '@telegraf/types/markup';
import { MyContext } from './types/my-context';
import { UserService } from '../user/user.service';
import { ERRORS } from '../common/constants/errors';
import { MatchService } from '../match/match.service';
import { CALLBACKS } from '../common/constants/callbacks';
import { formatUserProfile } from '../common/utils/formatters';

@Injectable()
export class MatchUiService {
  constructor(
    private readonly matchService: MatchService,
    private readonly userService: UserService,
  ) {}

  private parseObjectIdFromMatch(ctx: MyContext): Types.ObjectId | null {
    const raw = ctx?.match as unknown as { groups?: { id?: string } } | undefined;
    const id = raw?.groups?.id;
    return id ? new Types.ObjectId(id) : null;
  }

  private buildCarouselKeyboard(): InlineKeyboardMarkup['inline_keyboard'] {
    return [[
      { text: '⬅️', callback_data: CALLBACKS.MATCHES_PREV },
      { text: '➡️', callback_data: CALLBACKS.MATCHES_NEXT },
    ]];
  }

  private getUserLabel(options: {
    nickname?: string | null;
    username?: string | null;
  }): string {
    const { nickname, username } = options;
    if (nickname && nickname.trim().length > 0) return `👤 ${nickname}`;
    if (username && username.trim().length > 0) return `👤 @${username}`;
    return '👤 Пользователь';
  }

  private ensureSession(ctx: MyContext) {
    if (!ctx.session.matches) ctx.session.matches = { ids: [], index: 0 };
  }

  private formatEntryText(label: string, profileText: string): string {
    return [label, '', profileText, '', 'Нажмите «Перейти в профиль» чтобы открыть диалог.'].join('\n');
  }

  async showList(ctx: MyContext): Promise<void> {
    const me = await this.userService.findByTelegramId(
      ctx.from?.id?.toString(),
    );
    if (!me) {
      await ctx.reply(ERRORS.USER_NOT_FOUND);
      return;
    }

    const ids = await this.matchService.listForUser(me._id);
    if (ids.length === 0) {
      await ctx.reply('У вас пока нет матчей. Вернитесь в /feed.');
      return;
    }

    this.ensureSession(ctx);
    ctx.session.matches!.ids = ids.slice(0, 10).map((x) => x.toString());
    ctx.session.matches!.index = 0;

    await this.showCurrent(ctx);
  }

  private async getCurrentUser(ctx: MyContext) {
    const state = ctx.session.matches!;
    const currentId = state.ids[state.index];
    const userModel = this.userService.getUserModel();
    const user = await userModel
      .findById(currentId)
      .populate('profession')
      .populate('targetProfession')
      .lean();
    return user;
  }

  async showCurrent(ctx: MyContext): Promise<void> {
    this.ensureSession(ctx);
    const state = ctx.session.matches!;
    const user = await this.getCurrentUser(ctx);
    if (!user) {
      await ctx.reply('Пользователь не найден');
      return;
    }
    const label = this.getUserLabel({ nickname: (user as any).nickname, username: (user as any).username });
    const text = this.formatEntryText(label, formatUserProfile(user as any));

    const kb: InlineKeyboardMarkup['inline_keyboard'] = [
      [
        { text: 'Перейти в профиль', callback_data: `${CALLBACKS.MATCH_OPEN}:${(user as any)._id}` },
      ],
      [
        { text: '⬅️', callback_data: CALLBACKS.MATCHES_PREV },
        { text: `${state.index + 1}/${state.ids.length}`, callback_data: 'noop' },
        { text: '➡️', callback_data: CALLBACKS.MATCHES_NEXT },
      ],
    ];

    try {
      await ctx.editMessageText(text, { reply_markup: { inline_keyboard: kb } });
    } catch {
      await ctx.reply(text, { reply_markup: { inline_keyboard: kb } });
    }
  }

  async handleOpenMatch(ctx: MyContext): Promise<void> {
    const id = this.parseObjectIdFromMatch(ctx);
    if (!id) return;
    const userModel = this.userService.getUserModel();
    const user = await userModel
      .findById(id)
      .populate('profession')
      .populate('targetProfession')
      .lean();
    if (!user) {
      try {
        await ctx.answerCbQuery('Пользователь не найден');
      } catch {}
      return;
    }
    const text = formatUserProfile(user as any);
    const kb: InlineKeyboardMarkup['inline_keyboard'] = [
      [
        { text: '⬅️ Назад к списку', callback_data: CALLBACKS.MATCHES_PREV },
      ],
    ];
    try {
      await ctx.editMessageText(text, { reply_markup: { inline_keyboard: kb } });
    } catch {
      await ctx.reply(text, { reply_markup: { inline_keyboard: kb } });
    }
  }

  async handlePrev(ctx: MyContext): Promise<void> {
    this.ensureSession(ctx);
    const state = ctx.session.matches!;
    if (!state.ids.length) return;
    state.index = (state.index - 1 + state.ids.length) % state.ids.length;
    await this.showCurrent(ctx);
  }

  async handleNext(ctx: MyContext): Promise<void> {
    this.ensureSession(ctx);
    const state = ctx.session.matches!;
    if (!state.ids.length) return;
    state.index = (state.index + 1) % state.ids.length;
    await this.showCurrent(ctx);
  }
}
