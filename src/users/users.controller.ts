import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Profession, PROFESSIONS } from './users.schema';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@Req() req: any) {
    const telegramId = req.user?.telegramId;
    if (!telegramId) return null;
    return this.usersService.getByTelegramId(telegramId);
  }

  @Post('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
    const telegramId = req.user?.telegramId;
    return this.usersService.updateProfile(telegramId, dto);
  }

  @Get('search')
  async search(@Query('profession') profession: Profession) {
    return this.usersService.searchByProfession(profession);
  }

  @Get('professions')
  professions() {
    return PROFESSIONS;
  }
}


