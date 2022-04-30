import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

    deleteUser(id: number) {
      return this.userRepository.delete(id);
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

    async setPicture(user: UserEntity, path: string) {
      user.picture = path;
      return await this.userRepository.save(user);
    }

    async requestFriend(user: UserEntity, id: number) {
      const friend = await this.findOneById(id);
      if (!friend)
        throw new NotFoundException('User not found');
      user.friends = await this.getFriends(user.id);
      user.friends.push(friend);
      return await this.userRepository.save(user);
    }

    async deleteFriend(user: UserEntity, id: number) {
      const friendRemove = await this.findOneById(id);
      if (!friendRemove)
        throw new NotFoundException('User not found');
      friendRemove.friends = await this.getFriends(id);
      friendRemove.friends = friendRemove.friends.filter((friend) => friend.id !== user.id);
      await this.userRepository.save(friendRemove);

      user.friends = await this.getFriends(user.id);
      user.friends = user.friends.filter((friend) => {return friend.id !== id});
      return await this.userRepository.save(user);
    }

    async getRequestedUsers(id): Promise<UserEntity[]> {
        return await this.userRepository.query(
          ` SELECT *
            FROM "user" U
            WHERE U.id <> $1
              AND EXISTS(
                SELECT 1
                FROM user_friends_user F
                WHERE (F."userId_1" = $1 AND F."userId_2" = U.id )
                );  `,
          [id],
        );
        //return await this.userRepository.createQueryBuilder('user').leftJoinAndSelect('user.friends', 'user').getMany();
    }

    async getRequestedByUsers(id): Promise<UserEntity[]> {
      return await this.userRepository.query(
        ` SELECT *
          FROM "user" U
          WHERE U.id <> $1
            AND EXISTS(
              SELECT 1
              FROM user_friends_user F
              WHERE (F."userId_1" = U.id AND F."userId_2" = $1 )
              );  `,
        [id],
      );
  }

    async getFriends(id): Promise<UserEntity[]> {
      const requests = await this.getRequestedUsers(id);
      const requestedBy = await this.getRequestedByUsers(id);
      return requests.filter((user) => requestedBy.some((usr) => user.id === usr.id));
    }

    async blockUser(user: UserEntity, id: number) {
      const toBlock = await this.findOneById(id);
      if (!toBlock)
        throw new NotFoundException('User not found');
      user.blockedUsers = await this.getBlockedUsers(user.id);
      user.blockedUsers.push(toBlock);
      return await this.userRepository.save(user);
    }

    async unblockUser(user: UserEntity, id: number) {
      user.blockedUsers = await this.getBlockedUsers(user.id);
      user.blockedUsers = user.blockedUsers.filter((usr) => {return usr.id !== id});
      return await this.userRepository.save(user);
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
