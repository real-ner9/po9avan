import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

@Schema({ timestamps: true, collection: 'matches' })
export class Match {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userA: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userB: Types.ObjectId;
}

export type MatchDocument = Match & Document<Types.ObjectId>;

export const MatchSchema = SchemaFactory.createForClass(Match);

// Ensure pair uniqueness irrespective of order
MatchSchema.index({ userA: 1, userB: 1 }, { unique: true });
