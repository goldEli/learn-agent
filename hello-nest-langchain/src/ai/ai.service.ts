import type { Runnable } from '@langchain/core/runnables';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  constructor(
    @Inject('AI_CHAIN')
    private readonly chain: Runnable<{ query: string }, string>,
  ) {}

  async runChain(query: string): Promise<string> {
    return this.chain.invoke({ query });
  }

  async *streamChain(query: string): AsyncGenerator<string> {
    const stream = await this.chain.stream({ query });
    for await (const chunk of stream) {
      yield chunk;
    }
  }
}
