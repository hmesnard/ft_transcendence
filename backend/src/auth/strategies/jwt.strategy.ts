import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
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

// import { Injectable, UnauthorizedException } from "@nestjs/common";
// import { PassportStrategy } from "@nestjs/passport";
// import { InjectRepository } from "@nestjs/typeorm";
// import { ExtractJwt, Strategy } from "passport-jwt";
// import { User } from "src/users/user.entity";
// import { Repository } from "typeorm";
// import { JwtPayload } from "./jwtPayload.interface";

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy)
// {
//     constructor(@InjectRepository(User) private usersRepositoy: Repository<User>)
//     {
//         super({
//             secretOrKey: 'Secret',
//             jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//         });
//     }

//     async validate(payload: JwtPayload): Promise<User>
//     {
//         const { username } = payload;
//         const user: User = await this.usersRepositoy.findOne({ username });
//         if (!user)
//             throw new UnauthorizedException();
//         return user;
//     }
// }