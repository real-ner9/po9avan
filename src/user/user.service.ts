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

  getModel(): Model<UserDocument> {
    return this.userModel;
  }

  async updateNicknameByTelegramId(
    telegramId: string,
    rawNickname: string,
  ): Promise<void> {
    const nickname = sanitizePlainText(rawNickname, 24);
    await this.userModel.updateOne({ telegramId }, { $set: { nickname } });
  }

  async updateAboutByTelegramId(
    telegramId: string,
    rawAbout: string,
  ): Promise<void> {
    const about = sanitizePlainText(rawAbout, 400);
    await this.userModel.updateOne({ telegramId }, { $set: { about } });
  }

  async deleteByTelegramId(telegramId: string): Promise<void> {
    await this.userModel.deleteOne({ telegramId });
  }

  async upsertUserFromDraft(data: RegistrationDraft): Promise<UserDocument> {
    const profession = await this.professionService.findById(data.profession);
    const targetProfession = await this.professionService.findById(
      data.targetProfession,
    );
    if (!profession || !targetProfession) {
      throw new Error(ERRORS.PROFESSION_NOT_FOUND);
    }
    await this.userModel.updateOne(
      { telegramId: data.telegramId },
      {
        $set: {
          telegramId: data.telegramId,
          username: data.username,
          nickname: data.nickname,
          experienceYears: data.experienceYears,
          about: data.about,
          profession: (profession as any)._id,
          targetProfession: (targetProfession as any)._id,
        },
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
    const saved = await this.findByTelegramId(data.telegramId);
    if (!saved) throw new Error('User upsert failed');
    return saved;
  }
}
