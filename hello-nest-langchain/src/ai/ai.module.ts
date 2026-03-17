import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ConfigService } from '@nestjs/config';
import { PromptTemplate } from '@langchain/core/prompts';
import type { Runnable } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Module({
  controllers: [AiController],
  providers: [
    {
      provide: 'AI_CHAIN',
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<Runnable<{ query: string }, string>> => {
        const { ChatOpenAI } = await import('@langchain/openai');

        const modelName = configService.get<string>('MODEL_NAME');
        const apiKey = configService.get<string>('OPENAI_API_KEY');
        const baseURL = configService.get<string>('OPENAI_BASE_URL');

        if (!modelName) {
          throw new Error('MODEL_NAME is required');
        }
        if (!apiKey) {
          throw new Error('OPENAI_API_KEY is required');
        }

        const prompt = PromptTemplate.fromTemplate(
          '请回答以下问题：\n\n{query}',
        );
        const model = new ChatOpenAI({
          temperature: 0.7,
          modelName,
          apiKey,
          configuration: baseURL ? { baseURL } : undefined,
        });

        return prompt.pipe(model).pipe(new StringOutputParser());
      },
    },
    AiService,
  ],
})
export class AiModule {}
