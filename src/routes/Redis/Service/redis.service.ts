import {
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PkceSession } from '../dto/pkceSession.dto';
import { Login } from '../dto/login.dto';
import { GetLogin } from '../dto/getLogin.dto';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.config.get<string>('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      password: this.config.get<string>('REDIS_PASSWORD'),
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async setPkceSession(
    state: string,
    data: PkceSession,
    ttlSeconds: number = 300,
  ): Promise<void> {
    await this.client.set(
      `pkce:${state}`,
      JSON.stringify(data),
      'EX',
      ttlSeconds,
    );
  }

  async getPkceSession(state: string): Promise<PkceSession | null> {
    const raw = (await this.client.get(`pkce:${state}`)) as string;

    return (JSON.parse(raw) as PkceSession) ?? null;
  }

  async deletePkceSession(state: string): Promise<void> {
    await this.client.del(`pkce:${state}`);
  }

  async setAuthCode(
    code: string,
    data: Login,
    ttlSeconds: number = 120,
  ): Promise<void> {
    await this.client.set(
      `authcode:${code}`,
      JSON.stringify({ data }),
      'EX',
      ttlSeconds,
    );
  }

  async getAuthCode(code: string): Promise<GetLogin> {
    const raw = (await this.client.get(`authcode:${code}`)) as string;

    if (JSON.parse(raw) === null) {
      throw new NotFoundException('Authcode not found');
    }

    return JSON.parse(raw) as GetLogin;
  }

  async deleteAuthCode(code: string): Promise<void> {
    await this.client.del(`authcode:${code}`);
  }
}
