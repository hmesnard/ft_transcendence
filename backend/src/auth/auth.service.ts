import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    async treatFtOauth(user42) {
        let user = await this.userService.findOneById(user42.id);
        if (!user) {
            user = this.userService.createUser(user42);
        }
        const jwt = this.jwtService.sign({id: user.id, username: user.username});
        return {user, jwt};
    }
}
