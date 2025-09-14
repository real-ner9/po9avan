import { Update, On, Ctx } from 'nestjs-telegraf';
import { MyContext } from '../types/my-context';
import { ProfessionService } from '../../catalogs/profession/profession.service';
import { InlineQueryResultArticle } from '@telegraf/types';

@Update()
export class InlineUpdate {
  private static readonly INLINE_CACHE_TIME_SEC = 1;

  constructor(private readonly professionService: ProfessionService) {}

  @On('inline_query')
  async onInlineQuery(@Ctx() ctx: MyContext) {
    const query = ctx?.inlineQuery?.query;
    const roles = await this.professionService.search(query);
    const results: InlineQueryResultArticle[] = roles.map((r) => ({
      type: 'article',
      id: `prof-${r._id}`,
      title: r.name,
      input_message_content: {
        message_text: `prof:${r._id} ${r.name}`,
      },
    }));

    await ctx.answerInlineQuery(results, { cache_time: InlineUpdate.INLINE_CACHE_TIME_SEC });
  }
}


