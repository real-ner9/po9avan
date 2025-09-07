import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BotModule } from './bot/bot.module';
import { ProfessionModule } from './catalogs/profession/profession.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    BotModule,
    ProfessionModule,
  ],
})
export class AppModule {}
