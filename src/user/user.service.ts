import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegistrationDraft } from '../bot/types/my-context';
import { ERRORS } from '../common/constants/errors';
import { ProfessionService } from '../catalogs/profession/profession.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly professionService: ProfessionService,
  ) {}

  findByTelegramId(telegramId: string): Promise<UserDocument | null> {
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
}
