import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ChatService {
    constructor(
        private authService: AuthService
    ) {}

    async getUserFromSocket(socket: Socket) {
        const cookie = socket.handshake.headers.cookie;
        //const { access_token: authenticationToken } = parse(cookie); //Parse cookie if necessary (https://wanago.io/2021/01/25/api-nestjs-chat-websockets/)
        const user = await this.authService.getUserFromAuthenticationToken(cookie);
        if (!user) {
          throw new WsException('Invalid credentials.');
        }
        console.log(user);
        return user;
    }

}
