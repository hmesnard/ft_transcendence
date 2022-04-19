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
            user = await this.userService.createUser(user42);
        }
        const jwt = this.jwtService.sign({username: user.username});
        return {user, jwt};
    }

    treatTfa(id: number, tfaOK = false) {
        return this.jwtService.sign({ id, tfaOK });
    }
}
