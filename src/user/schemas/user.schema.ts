import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  Profession,
  ProfessionDocument,
} from '../../catalogs/profession/profession.schema';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  telegramId: string;

  @Prop()
  username: string;

  @Prop({ type: Types.ObjectId, ref: Profession.name })
  profession: ProfessionDocument;

  @Prop({ type: Types.ObjectId, ref: Profession.name })
  targetProfession: ProfessionDocument;

  @Prop({ type: Number, min: 0, max: 13 })
  experienceYears: number;

  @Prop({ type: String })
  about: string;
}

export type UserDocument = User & Document<Types.ObjectId>;
export const UserSchema = SchemaFactory.createForClass(User);
