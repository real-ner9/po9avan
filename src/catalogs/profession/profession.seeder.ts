import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profession } from './profession.schema';
import { ProfessionService } from './profession.service';
import { DEFAULT_PROFESSIONS } from './default-professions';

@Injectable()
export class ProfessionSeeder implements OnModuleInit {
  constructor(
    private readonly professionService: ProfessionService,
    @InjectModel(Profession.name)
    private readonly professionModel: Model<Profession>,
  ) {}

  async onModuleInit(): Promise<void> {
    const existing = await this.professionModel.countDocuments();
    if (existing === 0) {
      await this.professionService.upsertMany(DEFAULT_PROFESSIONS);
      console.log('[ProfessionSeeder] Базовый каталог профессий создан');
    }
  }
}
