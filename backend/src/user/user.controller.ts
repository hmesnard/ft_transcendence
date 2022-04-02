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
    getProfile(
        @User() user
    ) {
        return this.userService.findOneById(user.id);
    }

    @Get('friends')
    @UseGuards(JwtGuard)
    getFriends(
        @User() user
    ) {
        return this.userService.getFriends(user.id);
    }

    @Get('blocked')
    @UseGuards(JwtGuard)
    getBlockedUsers(
        @User() user
    ) {
        return this.userService.getBlockedUsers(user.id);
    }
}
