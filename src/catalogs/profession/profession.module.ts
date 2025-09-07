import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Profession, ProfessionSchema } from './profession.schema';
import { ProfessionService } from './profession.service';
import { ProfessionSeeder } from './profession.seeder';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Profession.name, schema: ProfessionSchema },
    ]),
  ],
  providers: [ProfessionService, ProfessionSeeder],
  exports: [ProfessionService],
})
export class ProfessionModule {}


