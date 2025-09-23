import { OnModuleInit, Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';
import { COMMANDS } from '../common/constants/commands';

@Injectable()
export class BotInitializer implements OnModuleInit {
  constructor(@InjectBot() private readonly bot: Telegraf) {}

  async onModuleInit() {
    await this.bot.telegram.setMyCommands([
      { command: COMMANDS.PROFILE, description: '📺 Профиль' },
      { command: COMMANDS.FEED, description: '📰 Лента' },
      { command: COMMANDS.MATCHES, description: 'Метчи' },
    ]);
  }
}
