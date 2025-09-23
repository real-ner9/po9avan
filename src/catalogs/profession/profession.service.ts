import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profession, ProfessionDocument } from './profession.schema';
import type { DefaultProfession } from './default-professions';

@Injectable()
export class ProfessionService {
  constructor(
    @InjectModel(Profession.name)
    private readonly model: Model<ProfessionDocument>,
  ) {}

  async upsertMany(items: DefaultProfession[]): Promise<void> {
    if (!items?.length) return;
    await Promise.all(
      items.map(({ name, synonyms }) =>
        this.model.updateOne(
          { name },
          { $set: { name, synonyms: Array.isArray(synonyms) ? synonyms : [] } },
          { upsert: true },
        ),
      ),
    );
  }

  async search(
    query: string | undefined,
    limit = 20,
  ): Promise<ProfessionDocument[]> {
    const q = (query || '').trim();
    const max = Math.min(limit, 50);
    if (!q) {
      return this.model.find({}).sort({ name: 1 }).limit(max).lean();
    }
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return this.model
      .find({ $or: [{ name: regex }, { synonyms: regex }] })
      .sort({ name: 1 })
      .limit(max)
      .lean();
  }

  async findById(id: string | undefined): Promise<ProfessionDocument | null> {
    return this.model.findById(id).lean();
  }
}
