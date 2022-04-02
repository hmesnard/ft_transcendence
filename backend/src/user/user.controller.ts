import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/decorators/user.decorator';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(
        private userService: UserService
    ) {}

    @Get('me')
    @UseGuards(JwtGuard)
    findMe(
        @User() user
    ) {
        return this.userService.findOneById(user.id);
    }
}
