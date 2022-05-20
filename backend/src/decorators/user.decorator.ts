// import { createParamDecorator, ExecutionContext } from "@nestjs/common";

// export const User = createParamDecorator(
//     (data: unknown, ctx: ExecutionContext) => {
//         const request = ctx.switchToHttp().getRequest();
//         return request.user;
//     }
// );

import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserEntity } from "src/user/entities/user.entity";

export const User = createParamDecorator(
    (_data, ctx: ExecutionContext): UserEntity => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
});