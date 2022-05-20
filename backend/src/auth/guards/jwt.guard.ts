// import { Injectable } from "@nestjs/common";
// import { AuthGuard } from "@nestjs/passport";

// @Injectable()
// export class JwtGuard extends AuthGuard('jwt') {}

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate
{
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext)
  {
    const request = context.switchToHttp().getRequest();
    try {
      const jwt = request.cookies['jwt'];
      return this.jwtService.verify(jwt);
    } catch {
      throw new UnauthorizedException();
    }
  }
}