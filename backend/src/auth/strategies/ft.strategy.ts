import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42"

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, '42'){
    constructor() {
        super({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: 'http://localhost:3000/auth/42/return',
        });
    }

    async validate(
        accessToken,
        refreshToken,
        user
        ): Promise<any> {
            return user;
        }
}