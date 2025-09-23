import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegistrationDraft } from '../bot/types/my-context';
import { ERRORS } from '../common/constants/errors';
import { ProfessionService } from '../catalogs/profession/profession.service';
import { sanitizePlainText } from '../common/utils/sanitize';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly professionService: ProfessionService,
  ) {}

  getUserModel(): Model<UserDocument> {
    return this.userModel;
  }

  findByTelegramId(
    telegramId: string | undefined,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ telegramId })
      .populate('profession')
      .populate('targetProfession');
  }

  async createUser(data: RegistrationDraft): Promise<UserDocument | null> {
    const profession = await this.professionService.findById(data.profession);
    const targetProfession = await this.professionService.findById(
      data.targetProfession,
    );
    if (!profession || !targetProfession) {
      throw new Error(ERRORS.PROFESSION_NOT_FOUND);
    }

    const user = new this.userModel({
      ...data,
      profession,
      targetProfession,
    });
    return user.save();
  }

  async updateByTelegramId(
    telegramId: string | undefined,
    update: Partial<Pick<User, 'nickname' | 'about' | 'avatarFileId'>>,
  ): Promise<UserDocument | null> {
    if (!telegramId) throw new Error(ERRORS.USER_NOT_FOUND);
    const payload: Partial<User> = {};
    if (typeof update.nickname === 'string') {
      payload.nickname = sanitizePlainText(update.nickname, 24);
    }
    if (typeof update.about === 'string') {
      payload.about = sanitizePlainText(update.about, 400);
    }
    if (typeof update.avatarFileId === 'string') {
      payload.avatarFileId = update.avatarFileId.trim();
    }
    await this.userModel.updateOne({ telegramId }, { $set: payload }).exec();
    return this.findByTelegramId(telegramId);
  }
}
