import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    async treatFtOauth(user42) {
        let user = await this.userService.getUserById(user42.id);
        if (!user) {
            user = await this.userService.createUser(user42);
        }
        const jwt = this.jwtService.sign({id: user.id, username: user.username});
        return {user, jwt};
    }

    treatTfa(id: number, tfaOK = false) {
        return this.jwtService.sign({ id, tfaOK });
    }

    async getUserFromAuthenticationToken(token: string) {
        const payload = this.jwtService.verify(token);
        if (payload.id) {
          const user = await this.userService.getUserById(payload.id);
          if (user) {
              if (!user.tfaEnabled || payload.tfaOK) {
                  return user
                } else {
                    throw new UnauthorizedException();
                }
            } else {
                throw new UnauthorizedException();
            }
        }
    }
}
