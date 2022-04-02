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
}
