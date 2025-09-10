import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotUpdate } from './bot.update';
import { BotService } from './bot.service';
import { BotInitializer } from './bot.initializer';
import { UserModule } from '../user/user.module';
import { session } from 'telegraf';
import { StepsService } from './steps.service';
import { AuthService } from './auth.service';
import { HhService } from './hh.service';
import { ProfessionModule } from '../catalogs/profession/profession.module';
import { FeedModule } from '../feed/feed.module';
import { MatchModule } from '../match/match.module';
// removed mentors service

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.BOT_TOKEN as string,
      middlewares: [session()],
    }),
    UserModule,
    ProfessionModule,
    FeedModule,
    MatchModule,
  ],
  providers: [
    BotInitializer,
    BotUpdate,
    BotService,
    StepsService,
    AuthService,
    HhService,
  ],
  exports: [BotService, StepsService],
})
export class BotModule {}
