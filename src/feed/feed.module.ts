import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reaction, ReactionSchema } from './feed.schema';
import { FeedService } from './feed.service';
import { UserModule } from '../user/user.module';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reaction.name, schema: ReactionSchema },
    ]),
    UserModule,
    MatchModule,
  ],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}

