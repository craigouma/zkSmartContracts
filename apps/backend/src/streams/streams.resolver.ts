import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { StreamsService } from './streams.service';

@Resolver('Stream')
export class StreamsResolver {
  constructor(private readonly streamsService: StreamsService) {}

  @Query(() => [String])
  async streams() {
    return [];
  }

  @Query(() => String)
  async stream(@Args('id') id: string) {
    return 'Stream data';
  }

  @Mutation(() => String)
  async createStream(@Args('input') input: any) {
    return 'Stream created';
  }

  @Mutation(() => String)
  async withdrawFromStream(@Args('id') id: string, @Args('amount') amount: string) {
    return 'Withdrawal processed';
  }
} 