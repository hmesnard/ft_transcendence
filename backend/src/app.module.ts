import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MatchModule } from './match/match.module';
import { ChatModule } from './chat/chat.module';
import { ChatGateway } from './chat.gateway';
import { GameModule } from './game/game.module';
import { GameGateway } from './game.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true
    }),
    UserModule,
    AuthModule,
    MatchModule,
    ChatModule,
    GameModule
  ],
  controllers: [],
  providers: [ChatGateway, GameGateway],
})
export class AppModule {}
