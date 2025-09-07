import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reaction, ReactionSchema } from './feed.schema';
import { FeedService } from './feed.service';
import { UserModule } from '../user/user.module';
import { TelegrafModule } from 'nestjs-telegraf';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reaction.name, schema: ReactionSchema },
    ]),
    UserModule,
    TelegrafModule,
  ],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}

