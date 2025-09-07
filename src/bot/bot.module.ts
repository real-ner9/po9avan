import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotUpdate } from './bot.update';
import { BotService } from './bot.service';
import { BotInitializer } from './bot.initializer';
import { UserModule } from '../user/user.module';
import { session } from 'telegraf';
import { StepsService } from './steps.service';
import { MenuService } from './menu.service';
import { AuthService } from './auth.service';
import { HhService } from './hh.service';
import { ProfessionModule } from '../catalogs/profession/profession.module';
// removed mentors service

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.BOT_TOKEN as string,
      middlewares: [session()],
    }),
    UserModule,
    ProfessionModule,
  ],
  providers: [
    BotInitializer,
    BotUpdate,
    BotService,
    MenuService,
    StepsService,
    AuthService,
    HhService,
  ],
  exports: [BotService, StepsService],
})
export class BotModule {}
