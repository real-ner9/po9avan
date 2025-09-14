import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { FeedUiService } from './feed-ui.service';
import { BotContextService } from './bot-context.service';
import { CommandsUpdate } from './updates/commands.update';
import { ActionsUpdate } from './updates/actions.update';
import { InlineUpdate } from './updates/inline.update';
import { StepsUpdate } from './updates/steps.update';
import { EditUpdate } from './updates/edit.update';
import { EditProfileService } from './edit-profile.service';
import { BotService } from './bot.service';
import { BotInitializer } from './bot.initializer';
import { UserModule } from '../user/user.module';
import { session } from 'telegraf';
import { StepsService } from './steps.service';
import { AuthService } from './auth.service';
import { ProfessionModule } from '../catalogs/profession/profession.module';
import { FeedModule } from '../feed/feed.module';
import { MatchModule } from '../match/match.module';

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
    CommandsUpdate,
    EditUpdate,
    ActionsUpdate,
    InlineUpdate,
    StepsUpdate,
    BotService,
    StepsService,
    AuthService,
    FeedUiService,
    BotContextService,
    EditProfileService,
  ],
  exports: [BotService, StepsService],
})
export class BotModule {}
