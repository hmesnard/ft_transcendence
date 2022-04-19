import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ChannelModule } from './channel/channel.module';
import { ChannelController } from './channel/channel.controller';
// import { ChannelModule } from './channel/channel.module';


@Module({
  imports: [TypeOrmModule.forRoot({
    type : 'postgres',
    url: process.env.DATABASE_URL,
    entities: ["dist/**/*.entity{.ts,.js}"],
    autoLoadEntities: true,
    synchronize: true,
  }), UserModule, ChannelModule],
  controllers: [AppController,ChannelController],
  providers: [AppService],
})


// @Module({
//   imports: [
//     ConfigModule.forRoot({ isGlobal: true }),
//     TypeOrmModule.forRoot({
//       type: 'postgres',
//       host: 'localhost',
//       port: 5432,
//       username: process.env.POSTGRES_USER,
//       password: process.env.POSTGRES_PASSWORD,
//       database: process.env.POSTGRES_DB,
//       entities: ['dist/**/*.entity{.ts,.js}'],
//       synchronize: true
//     }),
//     UserModule,
//     AuthModule,
//     ChannelModule
//   ],
//   controllers: [AppController, ChannelController],
//   providers: [AppService],
// })
export class AppModule {}
