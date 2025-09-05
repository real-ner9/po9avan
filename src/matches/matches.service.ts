import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from './matches.schema';
import { Profession } from '../users/users.schema';

@Injectable()
export class MatchesService {
  constructor(@InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>) {}

  private getPairKey(a: number, b: number): number[] {
    return [Math.min(a, b), Math.max(a, b)];
  }

  async createMatch(creatorId: number, targetId: number, profession?: Profession): Promise<Match> {
    if (creatorId === targetId) {
      throw new BadRequestException('Нельзя мэтчиться с самим собой');
    }
    const participants = this.getPairKey(creatorId, targetId);
    const existing = await this.matchModel.findOne({ participants }).lean<Match>().exec();
    if (existing) return existing as unknown as Match;
    return this.matchModel.create({ participants, createdBy: creatorId, targetId, profession });
  }

  async listForUser(telegramId: number): Promise<Match[]> {
    return this.matchModel.find({ participants: telegramId }).lean<Match[]>().exec();
  }
}


