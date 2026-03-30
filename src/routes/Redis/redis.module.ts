import { Global, Module } from '@nestjs/common';
import { RedisService } from './Service/redis.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [RedisService, ConfigService],
  exports: [RedisService],
})
export class RedisModule {}
