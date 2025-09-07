import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reaction, ReactionDocument } from './feed.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { formatUserProfile } from '../common/utils/formatters';
import type { InlineKeyboardMarkup } from '@telegraf/types/markup';

@Injectable()
export class FeedService {
  constructor(
    @InjectModel(Reaction.name)
    private readonly reactionModel: Model<ReactionDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectBot() private readonly bot: Telegraf,
  ) {}

  async getNextCandidate(currentUserId: Types.ObjectId) {
    const exclude: Types.ObjectId[] = [currentUserId];
    // Exclude users already reacted to by current user
    const reacted = await this.reactionModel
      .find({ fromUser: currentUserId })
      .select('toUser')
      .lean();
    const reactedIds = reacted.map((r) => r.toUser);
    const excludedIds = [...exclude, ...reactedIds];

    const criteria: any = { _id: { $nin: excludedIds } };

    const user = await this.userModel
      .findOne(criteria)
      .sort({ createdAt: -1 })
      .lean();
    return user || null;
  }

  async react(
    fromUserId: Types.ObjectId,
    toUserId: Types.ObjectId,
    kind: 'like' | 'dislike',
  ) {
    if (fromUserId.equals(toUserId)) return null;
    const prev = await this.reactionModel.findOne({
      fromUser: fromUserId,
      toUser: toUserId,
    });
    const res = await this.reactionModel.findOneAndUpdate(
      { fromUser: fromUserId, toUser: toUserId },
      { $set: { fromUser: fromUserId, toUser: toUserId, kind } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    // notify on like only if it wasn't already a like
    if (kind === 'like' && (!prev || prev.kind !== 'like')) {
      await this.notifyLiked(toUserId, fromUserId);
      // check mutual like
      const reciprocal = await this.reactionModel.findOne({
        fromUser: toUserId,
        toUser: fromUserId,
        kind: 'like',
      });
      if (reciprocal) {
        await this.notifyMutual(fromUserId, toUserId);
      }
    }
    return res;
  }

  private async notifyLiked(
    toUserId: Types.ObjectId,
    fromUserId: Types.ObjectId,
  ): Promise<void> {
    const [toUser, fromUser] = await Promise.all([
      this.userModel.findById(toUserId).lean(),
      this.userModel
        .findById(fromUserId)
        .populate('profession')
        .populate('targetProfession')
        .lean(),
    ]);
    if (!toUser || !fromUser) return;
    const keyboard: InlineKeyboardMarkup['inline_keyboard'] = [
      [
        {
          text: '👍 Взаимно',
          callback_data: `like_reply:accept:${fromUser._id}`,
        },
        {
          text: '👎 Не интересно',
          callback_data: `like_reply:reject:${fromUser._id}`,
        },
      ],
    ];
    const usernameLine = fromUser.username
      ? `@${fromUser.username}`
      : '(ник скрыт)';
    const text =
      '❤️ Вас лайкнули!\n\n' +
      formatUserProfile(fromUser as unknown as any) +
      '\n\n' +
      `Связаться: ${usernameLine}`;
    await this.bot.telegram.sendMessage(String(toUser.telegramId), text, {
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private async notifyMutual(
    aId: Types.ObjectId,
    bId: Types.ObjectId,
  ): Promise<void> {
    const [a, b] = await Promise.all([
      this.userModel.findById(aId).lean(),
      this.userModel.findById(bId).lean(),
    ]);
    if (!a || !b) return;
    const makeContact = (u: any) => (u.username ? `@${u.username}` : 'без ника');
    const msgForA = `✨ Взаимный лайк! Можете связаться: ${makeContact(b)}`;
    const msgForB = `✨ Взаимный лайк! Можете связаться: ${makeContact(a)}`;
    await Promise.all([
      this.bot.telegram.sendMessage(String(a.telegramId), msgForA),
      this.bot.telegram.sendMessage(String(b.telegramId), msgForB),
    ]);
  }
}
