import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/decorators/user.decorator';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(
        private userService: UserService
    ) {}

    @Delete()
    @UseGuards(JwtGuard)
    deleteUser(
        @User() user
    ) {
        return this.userService.deleteUser(user.id);
    }

    @Get()
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

    @Post('friend/:id')
    @UseGuards(JwtGuard)
    requestFriend(
        @User() user,
        @Param('id', ParseIntPipe) id
    ) {
        return this.userService.requestFriend(user, id);
    }

    @Delete('friend/:id')
    @UseGuards(JwtGuard)
    deleteFriend(
        @User() user,
        @Param('id', ParseIntPipe) id
    ) {
        return this.userService.deleteFriend(user, id);
    }
    
    @Get('friend')
    @UseGuards(JwtGuard)
    getFriends(
        @User() user
    ) {
        return this.userService.getFriends(user.id);
    }

    @Post('block/:id')
    @UseGuards(JwtGuard)
    blockUser(
        @User() user,
        @Param('id', ParseIntPipe) id
    ) {
        return this.userService.blockUser(user, id);
    }

    @Delete('block/:id')
    @UseGuards(JwtGuard)
    unblockUser(
        @User() user,
        @Param('id', ParseIntPipe) id
    ) {
        return this.userService.unblockUser(user, id);
    }

    @Get('block')
    @UseGuards(JwtGuard)
    getBlockedUsers(
        @User() user
    ) {
        return this.userService.getBlockedUsers(user.id);
    }
}
