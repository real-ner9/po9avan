import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Match, MatchDocument } from './schemas/match.schema';

@Injectable()
export class MatchService {
  constructor(
    @InjectModel(Match.name)
    private readonly matchModel: Model<MatchDocument>,
  ) {}

  async ensureMatch(a: Types.ObjectId, b: Types.ObjectId) {
    // order-insensitive: store (min, max)
    const [userA, userB] = a.toString() < b.toString() ? [a, b] : [b, a];
    const doc = await this.matchModel.findOneAndUpdate(
      { userA, userB },
      { $setOnInsert: { userA, userB } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return doc;
  }

  async exists(a: Types.ObjectId, b: Types.ObjectId): Promise<boolean> {
    const [userA, userB] = a.toString() < b.toString() ? [a, b] : [b, a];
    const found = await this.matchModel.exists({ userA, userB });
    return Boolean(found);
  }

  async listForUser(userId: Types.ObjectId): Promise<Types.ObjectId[]> {
    const docs = await this.matchModel
      .find({ $or: [{ userA: userId }, { userB: userId }] })
      .lean();
    return docs.map((m) =>
      (m.userA as unknown as Types.ObjectId).equals(userId)
        ? (m.userB as unknown as Types.ObjectId)
        : (m.userA as unknown as Types.ObjectId),
    );
  }
}
