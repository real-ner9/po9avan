import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { Profession } from '../users/users.schema';

class CreateMatchDto {
  targetTelegramId!: number;
  profession?: Profession;
}

@Controller('api/matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateMatchDto) {
    const me = req.user?.telegramId;
    return this.matchesService.createMatch(me, dto.targetTelegramId, dto.profession);
  }

  @Get('me')
  async myMatches(@Req() req: any) {
    const me = req.user?.telegramId;
    return this.matchesService.listForUser(me);
  }
}


