import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { Profession, PROFESSIONS } from '../users.schema';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(PROFESSIONS, { message: 'profession must be one of predefined list' })
  profession?: Profession;

  @IsOptional()
  @IsArray()
  @IsEnum(PROFESSIONS, { each: true, message: 'lookingFor must contain valid professions' })
  lookingFor?: Profession[];
}


