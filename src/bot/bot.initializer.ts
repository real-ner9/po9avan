import { OnModuleInit, Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';

@Injectable()
export class BotInitializer implements OnModuleInit {
  constructor(@InjectBot() private readonly bot: Telegraf) {}

  async onModuleInit() {
    await this.bot.telegram.setMyCommands([
      { command: 'start', description: '🚀 Старт' },
      { command: 'menu', description: '📺 Меню' },
    ]);
  }
}
