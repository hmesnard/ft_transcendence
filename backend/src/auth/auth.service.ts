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
        const user = await this.userService.findOrCreate42(user42);
        const jwt = this.jwtService.sign({id: user.id, username: user.username});
        return {"access_token": jwt};
    }
}
