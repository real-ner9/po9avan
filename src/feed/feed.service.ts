import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reaction, ReactionDocument } from './feed.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { MatchService } from '../match/match.service';

@Injectable()
export class FeedService {
  constructor(
    @InjectModel(Reaction.name)
    private readonly reactionModel: Model<ReactionDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly matchService: MatchService,
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
  ): Promise<{ match: boolean } | null> {
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
    // create match on mutual like
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
