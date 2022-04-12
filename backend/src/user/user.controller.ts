import { Body, Controller, Get, HttpCode, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
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

    @Post('tfa/secret')
    @UseGuards(JwtGuard)
    async register(
        @Res() response: Response,
        @User() user
    ) {
        const { otpauthUrl } = await this.userService.generateTfaSecret(user);

        return this.userService.pipeQrCodeStream(response, otpauthUrl);
    }

    @Post('tfa/turn-on')
    @HttpCode(200)
    @UseGuards(JwtGuard)
    async turnOnTfa(
        @User() user,
        @Body() { tfaCode }
    ) {
        const isCodeValid = this.userService.isTfaCodeValid(tfaCode, user);
        if (!isCodeValid) {
            throw new UnauthorizedException('Wrong authentication code');
        }
        await this.userService.turnOnTfa(user.id);
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
