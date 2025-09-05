import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Profession } from '../users/users.schema';

export type MatchDocument = HydratedDocument<Match>;

@Schema({ timestamps: true })
export class Match {
  @Prop({ type: [Number], required: true, index: true })
  participants!: number[]; // [minId, maxId]

  @Prop({ type: Number, required: true })
  createdBy!: number; // telegramId инициатора

  @Prop({ type: Number, required: true })
  targetId!: number; // telegramId второй стороны

  @Prop({ type: String, required: false })
  profession?: Profession; // контекст профессии, по которой смэтчились
}

export const MatchSchema = SchemaFactory.createForClass(Match);

MatchSchema.index({ participants: 1 }, { unique: true });


