import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Res, StreamableFile, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/decorators/user.decorator';
import { UserEntity } from './entities/user.entity';
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
        return this.userService.getUserById(user.id);
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

    @Post('picture')
    @UseGuards(JwtGuard)
    @UseInterceptors(FileInterceptor('file'))
    setPicture(
        @User() user,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.userService.setPicture(user, file.path);
    }

    @Get('picture')
    @UseGuards(JwtGuard)
    getPicture(
        @User() user: UserEntity
    ) {
        const file = createReadStream(join(process.cwd(), user.picture));
        return new StreamableFile(file);
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
