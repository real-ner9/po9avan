import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, Profession } from './users.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async upsertFromTelegram(telegramUser: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  }): Promise<User> {
    const update = {
      telegramId: telegramUser.id,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
      username: telegramUser.username,
    };
    return this.userModel
      .findOneAndUpdate({ telegramId: telegramUser.id }, update, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      })
      .lean<User>()
      .exec();
  }

  async updateProfile(telegramId: number, dto: UpdateUserDto): Promise<User | null> {
    return this.userModel
      .findOneAndUpdate({ telegramId }, dto, { new: true })
      .lean<User>()
      .exec();
  }

  async getByTelegramId(telegramId: number): Promise<User | null> {
    return this.userModel.findOne({ telegramId }).lean<User>().exec();
  }

  async searchByProfession(profession: Profession): Promise<User[]> {
    return this.userModel.find({ lookingFor: profession }).lean<User[]>().exec();
  }
}


