import { Ctx, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Update()
export class TelegramUpdate {
  @Start()
  async onStart(@Ctx() ctx: Context) {
    const webAppUrl = process.env.WEBAPP_URL || 'http://localhost:3000/';
    await ctx.reply(
      'Привет! Открой веб-приложение, чтобы выбрать профессию и найти мэчи.',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Открыть WebApp',
                web_app: { url: webAppUrl },
              } as any,
            ],
          ],
        },
      },
    );
  }
}


