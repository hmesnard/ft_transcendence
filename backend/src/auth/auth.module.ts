import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FtStrategy } from './strategies/ft.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TfaStrategy } from './strategies/tfa.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(), //isGlobal ne marche pas !!??
    UserModule, PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: 3600 }
    })
  ],
  exports: [AuthService, JwtStrategy, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, FtStrategy, TfaStrategy, JwtStrategy]
})
export class AuthModule {}
