import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export const PROFESSIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'Mobile Developer',
  'Data Scientist',
  'ML Engineer',
  'DevOps Engineer',
  'Product Manager',
  'UI/UX Designer',
  'QA Engineer',
  'Game Developer',
  'Web3 Developer',
  'Cybersecurity Specialist',
  'Business Analyst',
  'Marketing Specialist',
] as const;

export type Profession = typeof PROFESSIONS[number];

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  telegramId!: number;

  @Prop({ required: true })
  firstName!: string;

  @Prop()
  lastName?: string;

  @Prop()
  username?: string;

  @Prop({ type: String, enum: PROFESSIONS, index: true })
  profession?: Profession;

  @Prop({ type: [String], default: [] })
  lookingFor!: Profession[];
}

export const UserSchema = SchemaFactory.createForClass(User);


