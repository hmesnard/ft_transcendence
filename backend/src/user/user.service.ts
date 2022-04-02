import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>
    ) {}

    async findOneById(id: number) {
        return await this.userRepository.findOne({id: id});
    }

    //probablement a spliter en plusieurs petites fonctions
    async findOrCreate42(user42) {
        let user = await this.findOneById(user42.id);
        if (!user) {
            user = this.userRepository.create({
                id: user42.id,
                username: user42.username,
            });
            try {
                await this.userRepository.save(user);
            } catch (e) {
                throw new ConflictException('Username must be unique');
            }
        }
        return user;
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
