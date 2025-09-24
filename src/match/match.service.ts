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

  async listForUser(userId: Types.ObjectId): Promise<Types.ObjectId[]> {
    const me = userId.toString();
    const docs = await this.matchModel
      .find({ $or: [{ userA: userId }, { userB: userId }] })
      .select('userA userB')
      .lean();
    return docs.map((m) => {
      const a = (m.userA as any).toString();
      const b = (m.userB as any).toString();
      const other = a === me ? b : a;
      return new Types.ObjectId(other);
    });
  }
}
