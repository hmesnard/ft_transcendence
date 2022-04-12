import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewUserDto } from './dto/new-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>
    ) {}

    async createUser(newUser: NewUserDto): Promise<UserEntity> { //console.log ici
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
