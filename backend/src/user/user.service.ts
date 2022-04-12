import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { authenticator } from 'otplib';
import { Repository } from 'typeorm';
import { NewUserDto } from './dto/new-user.dto';
import { UserEntity } from './entities/user.entity';
import { toFileStream } from 'qrcode';
import { Response } from 'express';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>
    ) {}

    async createUser(newUser: NewUserDto): Promise<UserEntity> { //console.log ici -> Done : on recoit tout le user42
      let user = this.userRepository.create(newUser);
      try {
        user = await this.userRepository.save(user);
      } catch (e) {
        throw new ConflictException('Username must be unique'); //probably other possible errors
      }
      return user;
    }

    async findOneById(id: number): Promise<UserEntity> {
      return await this.userRepository.findOne({id: id}); //juste id ?
    }

    async setTfaSecret(secret: string, id: number) {
      return this.userRepository.update(id, {
        tfaSecret: secret
      });
    }

    async generateTfaSecret(user: UserEntity) {
      const secret = authenticator.generateSecret();

      const otpauthUrl = authenticator.keyuri(user.username, process.env.APP_NAME, secret);

      await this.setTfaSecret(secret, user.id);

      return {
        secret,
        otpauthUrl
      }
    }

    async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
      return toFileStream(stream, otpauthUrl);
    }

    async turnOnTfa(id: number) {
      return this.userRepository.update(id, {
        tfaEnabled: true
      });
    }

    isTfaCodeValid(tfaCode: string, user: UserEntity) {
      return authenticator.verify({
        token: tfaCode,
        secret: user.tfaSecret
      })
    }

    async getFriends(id): Promise<UserEntity[]> {
        return await this.userRepository.query(
          ` SELECT *
            FROM "user" U
            WHERE U.id <> $1
              AND EXISTS(
                SELECT 1
                FROM user_friends_user F
                WHERE (F."userId_1" = $1 AND F."userId_2" = U.id )
                OR (F."userId_2" = $1 AND F."userId_1" = U.id )
                );  `,
          [id],
        );
    }

    async getBlockedUsers(id): Promise<UserEntity[]> {
        return await this.userRepository.query(
          ` SELECT *
            FROM "user" U
            WHERE U.id <> $1
              AND EXISTS(
                SELECT 1
                FROM user_blocked_users_user F
                WHERE (F."userId_1" = $1 AND F."userId_2" = U.id )
                );  `,
          [id],
        );
    }
}
