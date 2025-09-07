import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/schemas/user.schema';

export type ReactionKind = 'like' | 'dislike';

@Schema({ timestamps: true, collection: 'reactions' })
export class Reaction {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  fromUser: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  toUser: Types.ObjectId;

  @Prop({ type: String, enum: ['like', 'dislike'], required: true })
  kind: ReactionKind;
}

export type ReactionDocument = Reaction & Document<Types.ObjectId>;

export const ReactionSchema = SchemaFactory.createForClass(Reaction);

ReactionSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
