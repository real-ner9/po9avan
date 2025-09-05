import { Injectable, NestMiddleware } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as crypto from 'crypto';

@Injectable()
export class TelegramWebAppAuthMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: any, res: any, next: () => void) {
    try {
      const initData = (req.headers['x-telegram-init-data'] as string) || (req.query?.initData as string) || '';
      if (!initData) return next();

      const parsed = new URLSearchParams(initData);
      const hash = parsed.get('hash');
      parsed.delete('hash');
      const dataCheckString = Array.from(parsed.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('\n');

      const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
      const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
      const calcHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

      if (!hash || calcHash !== hash) return next();

      const userRaw = parsed.get('user');
      let user: any = undefined;
      if (userRaw) {
        try {
          user = JSON.parse(userRaw);
        } catch {}
      }
      if (user?.id) {
        const upserted = await this.usersService.upsertFromTelegram({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
        });
        req.user = { telegramId: upserted.telegramId };
      }
    } catch {}
    next();
  }
}


