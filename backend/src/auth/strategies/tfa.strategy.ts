import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/user/user.service";

@Injectable()
export class TfaStrategy extends PassportStrategy(Strategy, 'jwt-tfa') {
  constructor(
      private userService: UserService
  ) {

    const extractJwtFromCookie = (req: Request) => {
      let token = null;
      console.log(req.cookies);
      if (req && req.cookies) {
        token = req.cookies['access_token'];
      }
      console.log(token);
      return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    };

    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET
    });
  }

  async validate(payload: any) {
    console.log(payload);
    const user = await this.userService.getUserById(payload.id);
    if (user) {
      return user;
    } else {
      throw new UnauthorizedException();
    }
  }
}