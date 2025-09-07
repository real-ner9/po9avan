import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'professions' })
export class Profession {
  @Prop({ required: true, trim: true, unique: true })
  name: string;

  @Prop({ type: [String], default: [] })
  synonyms?: string[];
}

export type ProfessionDocument = Profession & Document<Types.ObjectId>;
export const ProfessionSchema = SchemaFactory.createForClass(Profession);


