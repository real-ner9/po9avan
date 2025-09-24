import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { FeedUiService } from './feed-ui.service';
import { FeedUpdate } from './updates/feed.update';
import { MatchUpdate } from './updates/match.update';
import { StepsUpdate } from './updates/steps.update';
import { ProfileService } from './profile.service';
import { BotInitializer } from './bot.initializer';
import { UserModule } from '../user/user.module';
import { session } from 'telegraf';
import { StepsService } from './steps.service';
import { AuthService } from './auth.service';
import { ProfessionModule } from '../catalogs/profession/profession.module';
import { FeedModule } from '../feed/feed.module';
import { MatchModule } from '../match/match.module';
import { ProfileUpdate } from './updates/profile.update';
import { MatchesUiService } from './matches-ui.service';

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
    ProfileUpdate,
    FeedUpdate,
    MatchUpdate,
    StepsUpdate,
    ProfileService,
    StepsService,
    AuthService,
    FeedUiService,
    MatchesUiService,
  ],
  exports: [ProfileService, StepsService],
})
export class BotModule {}
