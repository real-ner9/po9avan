import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './user.service';
import { ProfessionModule } from '../catalogs/profession/profession.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ProfessionModule,
  ],
  exports: [MongooseModule, UserService],
  providers: [UserService],
})
export class UserModule {}
