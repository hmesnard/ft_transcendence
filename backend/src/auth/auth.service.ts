import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import { Request } from 'express';
import { Socket } from 'socket.io';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
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

    async getUserFromSocket(socket: Socket) {
        const cookie = socket.handshake.headers.cookie;
        //const { access_token: authenticationToken } = parse(cookie); //Parse cookie if necessary (https://wanago.io/2021/01/25/api-nestjs-chat-websockets/)
        const user = await this.getUserFromAuthenticationToken(cookie);
        if (!user) {
          throw new WsException('Invalid credentials.');
        }
        console.log(user);
        return user;
    }

    async getLoggedUser(request: Request)
    {
        const cookie = request.cookies['jwt'];
        const data = await this.jwtService.verifyAsync(cookie);
        return this.userRepository.findOne({ username: data['username'] });
    }
}
