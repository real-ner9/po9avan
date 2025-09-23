import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reaction, ReactionDocument, ReactionKind } from './schemas/reaction.schema';
import { UserDocument } from '../user/schemas/user.schema';
import { MatchService } from '../match/match.service';
import { UserService } from '../user/user.service';

@Injectable()
export class FeedService {
  constructor(
    @InjectModel(Reaction.name)
    private readonly reactionModel: Model<ReactionDocument>,
    private readonly matchService: MatchService,
    private readonly userService: UserService,
  ) {}

  async getNextCandidate(
    currentUserId: Types.ObjectId,
  ): Promise<UserDocument | null> {
    const exclude: Types.ObjectId[] = [currentUserId];
    // Exclude users already reacted to by current user
    const reacted = await this.reactionModel
      .find({ fromUser: currentUserId })
      .select('toUser')
      .lean();
    const reactedIds = reacted.map((r) => r.toUser);
    const excludedIds = [...exclude, ...reactedIds];

    const criteria = { _id: { $nin: excludedIds } };

    return this.userService
      .getUserModel()
      .findOne(criteria)
      .sort({ createdAt: -1 })
      .lean();
  }

  async react(
    fromUserId: Types.ObjectId,
    toUserId: Types.ObjectId,
    kind: ReactionKind,
  ): Promise<{ match: boolean } | null> {
    if (fromUserId.equals(toUserId)) return null;
    // const prev = await this.reactionModel.findOne({
    //   fromUser: fromUserId,
    //   toUser: toUserId,
    // });
    // const res = await this.reactionModel.findOneAndUpdate(
    //   { fromUser: fromUserId, toUser: toUserId },
    //   { $set: { fromUser: fromUserId, toUser: toUserId, kind } },
    //   { upsert: true, new: true, setDefaultsOnInsert: true },
    // );
    if (kind === 'like') {
      const reciprocal = await this.reactionModel.findOne({
        fromUser: toUserId,
        toUser: fromUserId,
        kind: 'like',
      });
      if (reciprocal) {
        await this.matchService.ensureMatch(fromUserId, toUserId);
        return { match: true };
      }
    }
    return { match: false };
  }
}
